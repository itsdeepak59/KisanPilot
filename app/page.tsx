"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { FarmerProfile, ProfileLanguage } from "@/lib/profile";
import { MandiTrend } from "@/components/mandi-trend";
import { DecisionSignals } from "@/components/decision-signals";
import { AlertCheck } from "@/components/alert-check";
import { StructuredAnswer } from "@/components/structured-answer";
import { MAX_CONVERSATION_MESSAGES, type ConversationMessage } from "@/lib/conversation";

const DEVICE_ID_KEY = "kisanpilot.device_id";

function getDeviceId(): string {
  const existing = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const deviceId = window.crypto.randomUUID();
  window.localStorage.setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
}

function profileToForm(profile: FarmerProfile | null) {
  return {
    language: profile?.language ?? "en",
    place_name: profile?.place_name ?? "",
    state: profile?.state ?? "",
    district: profile?.district ?? "",
    crops: profile?.crops.join(", ") ?? "",
    alert_rain_mm: String(profile?.alert_rain_mm ?? 20),
    alert_wind_kmh: String(profile?.alert_wind_kmh ?? 40),
  };
}

type TraceEvent = {
  type: string;
  tool?: string;
  input?: unknown;
  result?: unknown;
  fetched_at?: string;
};

const speechLanguage: Record<ProfileLanguage, string> = { en: "en-IN", hi: "hi-IN", te: "te-IN" };

function formatTraceValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return "Unavailable";
  }
}

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

export default function Home() {
  const deviceId = useRef("");
  const [deviceIdLabel, setDeviceIdLabel] = useState("");
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [form, setForm] = useState(profileToForm(null));
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [savedMessage, setSavedMessage] = useState("");
  const [questionMessage, setQuestionMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [trace, setTrace] = useState<TraceEvent[]>([]);
  const [asking, setAsking] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const recognition = useRef<SpeechRecognitionLike | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = getDeviceId();
    deviceId.current = id;
    fetch(`/api/profile?device_id=${encodeURIComponent(id)}`)
      .then(async (response) => {
        const result = (await response.json()) as { ok: boolean; data?: FarmerProfile | null };
        if (result.ok && result.data) {
          setProfile(result.data);
          setForm(profileToForm(result.data));
        }
      })
      .catch(() => setSavedMessage("Profile could not be loaded. You can still enter it and try saving."))
      .finally(() => {
        setDeviceIdLabel(id);
        setLoading(false);
      });
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSavedMessage("");
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          device_id: deviceId.current,
          language: form.language,
          place_name: form.place_name,
          state: form.state,
          district: form.district,
          crops: form.crops.split(",").map((crop) => crop.trim()).filter(Boolean),
          alert_rain_mm: Number(form.alert_rain_mm),
          alert_wind_kmh: Number(form.alert_wind_kmh),
        }),
      });
      const result = (await response.json()) as { ok: boolean; data?: FarmerProfile; error?: string };
      if (!response.ok || !result.ok || !result.data) throw new Error(result.error ?? "Profile could not be saved");
      setProfile(result.data);
      setForm(profileToForm(result.data));
      setSavedMessage("Profile saved.");
    } catch (error) {
      setSavedMessage(error instanceof Error ? error.message : "Profile could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  function startVoiceInput() {
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceMessage("Voice input is not available in this browser. You can type your question instead.");
      return;
    }
    recognition.current?.stop();
    const current = new Recognition();
    current.lang = speechLanguage[form.language];
    current.interimResults = false;
    current.maxAlternatives = 1;
    current.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) setQuestion((existing) => `${existing} ${transcript}`.trim());
      setVoiceMessage("Voice question captured. Review it before submitting.");
    };
    current.onerror = () => setVoiceMessage("Voice input was unavailable. You can type your question instead.");
    current.onend = () => setListening(false);
    recognition.current = current;
    setVoiceMessage("Listening…");
    setListening(true);
    try {
      current.start();
    } catch {
      setListening(false);
      setVoiceMessage("Voice input could not start. You can type your question instead.");
    }
  }

  function speakAnswer() {
    if (!answer) {
      setVoiceMessage("Submit a question and wait for an answer before using spoken playback.");
      return;
    }
    if (!("speechSynthesis" in window)) {
      setVoiceMessage("Spoken playback is not available in this browser. The written answer is available above.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(answer);
    utterance.lang = speechLanguage[form.language];
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => {
      setSpeaking(false);
      setVoiceMessage("Spoken playback was unavailable. The written answer is available above.");
    };
    setSpeaking(true);
    setVoiceMessage("Speaking the answer…");
    window.speechSynthesis.speak(utterance);
  }

  async function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submittedQuestion = question.trim();
    if (!submittedQuestion) {
      setQuestionMessage("Write a question first.");
      return;
    }
    setAsking(true);
    setAnswer("");
    setTrace([]);
    setQuestionMessage("Live sources are being checked…");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          question: submittedQuestion,
          language: form.language,
          device_id: deviceId.current,
          place_name: form.place_name,
          state: form.state,
          district: form.district,
          crops: form.crops.split(",").map((crop) => crop.trim()).filter(Boolean),
          conversation,
        }),
      });
      if (!response.ok || !response.body) {
        const result = await response.json().catch(() => null) as { error?: unknown } | null;
        throw new Error(typeof result?.error === "string" ? result.error : "The advisory service is unavailable.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedAnswer = "";
      let buffer = "";
      while (true) {
        const chunk = await reader.read();
        buffer += decoder.decode(chunk.value ?? new Uint8Array(), { stream: !chunk.done });
        const messages = buffer.split("\n\n");
        buffer = messages.pop() ?? "";
        for (const message of messages) {
          const line = message.split("\n").find((item) => item.startsWith("data: "));
          if (!line) continue;
          let event: TraceEvent & { text?: string; error?: string };
          try {
            event = JSON.parse(line.slice(6)) as TraceEvent & { text?: string; error?: string };
          } catch {
            setQuestionMessage("The advisory stream returned an unreadable event. Please try again.");
            continue;
          }
          if (event.type === "text_delta" && event.text) {
            accumulatedAnswer += event.text;
            setAnswer((current) => current + event.text);
          }
          if (event.type === "tool_call" || event.type === "tool_result") setTrace((current) => [...current, event]);
          if (event.type === "error") throw new Error(event.error ?? "The advisory service is unavailable.");
          if (event.type === "done") {
            setConversation((current) => [...current, { role: "user" as const, content: submittedQuestion }, { role: "assistant" as const, content: accumulatedAnswer }].slice(-MAX_CONVERSATION_MESSAGES));
            setQuestionMessage("Answer grounded in the trace below.");
          }
        }
        if (chunk.done) break;
      }
    } catch (error) {
      setQuestionMessage(error instanceof Error ? error.message : "The advisory service is unavailable.");
    } finally {
      setAsking(false);
    }
  }

  function startNewConversation() {
    setConversation([]);
    setQuestion("");
    setAnswer("");
    setTrace([]);
    setQuestionMessage("New conversation started.");
    setVoiceMessage("");
  }

  return (
    <main className="min-h-screen bg-[#f5f7f2] text-[#17231b]">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-8">
        <section className="flex flex-col justify-between rounded-[2rem] bg-[#173b2b] p-7 text-[#f2f5e9] shadow-xl sm:p-10">
          <div>
            <div className="flex items-center gap-3 text-sm font-semibold tracking-wide text-[#c4d9a6]"><span className="grid size-9 place-items-center rounded-full bg-[#c4d9a6] text-[#173b2b]">K</span>KisanPilot</div>
            <p className="mt-16 max-w-md text-sm uppercase tracking-[0.22em] text-[#b5c9a1]">Live farm decisions</p>
            <h1 className="mt-4 max-w-lg text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Ask what your farm needs next.</h1>
            <p className="mt-6 max-w-md text-base leading-7 text-[#d8e2d0]">Set your language, location, and crops once. Future answers will show the live source and time behind each recommendation.</p>
          </div>
          <div className="mt-12 border-t border-white/15 pt-5 text-sm text-[#b5c9a1]">No login required · Your profile is linked to this browser.</div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[2rem] border border-[#dce4d8] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-medium text-[#65806c]">Your farm profile</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Start with your context</h2></div><span className="rounded-full bg-[#edf4e7] px-3 py-1 text-xs font-medium text-[#476c4f]">{loading ? "Loading" : profile ? "Saved" : "New profile"}</span></div><p className="mt-4 break-all text-xs text-[#819083]">Browser device ID: <code>{deviceIdLabel || "Preparing…"}</code></p>
            <form className="mt-7 space-y-5" onSubmit={saveProfile}>
              <label className="block text-sm font-medium">Language<select className="mt-2 w-full rounded-xl border border-[#d5dfd2] bg-white px-4 py-3 outline-none focus:border-[#477652] focus:ring-2 focus:ring-[#c9ddc4]" value={form.language} onChange={(event) => setForm({ ...form, language: event.target.value as ProfileLanguage })}><option value="en">English</option><option value="hi">हिन्दी</option><option value="te">తెలుగు</option></select></label>
              <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-medium">Village or town<input className="mt-2 w-full rounded-xl border border-[#d5dfd2] px-4 py-3 outline-none placeholder:text-[#9aa79c] focus:border-[#477652] focus:ring-2 focus:ring-[#c9ddc4]" placeholder="Enter your location" value={form.place_name} onChange={(event) => setForm({ ...form, place_name: event.target.value })} /></label><label className="block text-sm font-medium">District<input className="mt-2 w-full rounded-xl border border-[#d5dfd2] px-4 py-3 outline-none placeholder:text-[#9aa79c] focus:border-[#477652] focus:ring-2 focus:ring-[#c9ddc4]" placeholder="Enter district" value={form.district} onChange={(event) => setForm({ ...form, district: event.target.value })} /></label></div>
              <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-medium">State<input className="mt-2 w-full rounded-xl border border-[#d5dfd2] px-4 py-3 outline-none placeholder:text-[#9aa79c] focus:border-[#477652] focus:ring-2 focus:ring-[#c9ddc4]" placeholder="Enter state" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} /></label><label className="block text-sm font-medium">Crops<input className="mt-2 w-full rounded-xl border border-[#d5dfd2] px-4 py-3 outline-none placeholder:text-[#9aa79c] focus:border-[#477652] focus:ring-2 focus:ring-[#c9ddc4]" placeholder="Comma-separated crops" value={form.crops} onChange={(event) => setForm({ ...form, crops: event.target.value })} /></label></div>
              <div className="rounded-2xl bg-[#f5f7f2] p-4"><p className="text-sm font-semibold text-[#285d3d]">Alert thresholds</p><p className="mt-1 text-xs text-[#58705c]">A Telegram alert is sent only when the live two-day forecast crosses your thresholds.</p><div className="mt-3 grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium">Rain threshold (mm)<input className="mt-2 w-full rounded-xl border border-[#d5dfd2] bg-white px-4 py-3" min="0" max="500" step="0.1" type="number" value={form.alert_rain_mm} onChange={(event) => setForm({ ...form, alert_rain_mm: event.target.value })} /></label><label className="block text-sm font-medium">Wind threshold (km/h)<input className="mt-2 w-full rounded-xl border border-[#d5dfd2] bg-white px-4 py-3" min="0" max="300" step="0.1" type="number" value={form.alert_wind_kmh} onChange={(event) => setForm({ ...form, alert_wind_kmh: event.target.value })} /></label></div></div>
              <div className="flex flex-wrap items-center gap-3"><button className="rounded-xl bg-[#285d3d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1e4b30] disabled:cursor-not-allowed disabled:opacity-60" disabled={saving || loading} type="submit">{saving ? "Saving…" : "Save profile"}</button>{savedMessage && <p className="text-sm text-[#58705c]" role="status">{savedMessage}</p>}</div>
            </form>
          </div>

          <div className="rounded-[2rem] border border-[#dce4d8] bg-white p-5 shadow-sm sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-medium text-[#65806c]">Ask KisanPilot</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">What do you want to decide?</h2></div><button className="rounded-lg border border-[#b9ccb8] px-3 py-2 text-xs font-semibold text-[#285d3d] hover:bg-[#edf4e7]" onClick={startNewConversation} type="button">New conversation</button></div>{conversation.length > 0 && <p className="mt-3 text-xs text-[#819083]">Remembering the last {conversation.length} conversation messages.</p>}<form className="mt-6" onSubmit={submitQuestion}><textarea className="min-h-32 w-full resize-y rounded-2xl border border-[#d5dfd2] px-4 py-4 leading-6 outline-none placeholder:text-[#9aa79c] focus:border-[#477652] focus:ring-2 focus:ring-[#c9ddc4]" placeholder="Type a question about your crop or farm…" value={question} onChange={(event) => setQuestion(event.target.value)} /><div className="mt-4 flex flex-wrap items-center gap-3"><button className="rounded-xl border border-[#285d3d] px-4 py-3 text-sm font-semibold text-[#285d3d] transition hover:bg-[#edf4e7]" onClick={startVoiceInput} type="button">{listening ? "Listening…" : "Use voice"}</button><button className="rounded-xl bg-[#173b2b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#102b1e] disabled:cursor-wait disabled:opacity-60" disabled={asking} type="submit">{asking ? "Checking live sources…" : "Submit question"}</button>{questionMessage && <p className="max-w-md text-sm text-[#58705c]" role="status">{questionMessage}</p>}</div>{voiceMessage && <p className="mt-3 text-sm text-[#58705c]" role="status">{voiceMessage}</p>}</form>{answer && <StructuredAnswer answer={answer} trace={trace} onSpeak={speakAnswer} speaking={speaking} />}</div>
          {trace.length > 0 && <div className="rounded-[2rem] border border-[#dce4d8] bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-medium text-[#65806c]">Transparency</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Tool trace</h2></div><span className="rounded-full bg-[#edf4e7] px-3 py-1 text-xs font-medium text-[#476c4f]">{trace.length} events</span></div><div className="mt-6 space-y-3">{trace.map((event, index) => { const result = event.result && typeof event.result === "object" ? event.result as Record<string, unknown> : null; const source = typeof result?.source === "string" ? result.source : "Source returned by tool"; const fetchedAt = typeof result?.fetched_at === "string" ? result.fetched_at : event.fetched_at; return <div className="rounded-2xl border border-[#e4ebe1] p-4" key={`${event.type}-${index}`}><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-medium">{event.tool ?? "Tool"}</p><span className="text-xs font-medium uppercase tracking-wide text-[#65806c]">{event.type === "tool_call" ? "Requested" : "Result"}</span></div>{event.type === "tool_call" ? <p className="mt-2 break-words text-sm text-[#58705c]">Input: {formatTraceValue(event.input)}</p> : <><p className="mt-2 break-words text-sm text-[#58705c]">Source: {source}</p><p className="mt-1 text-xs text-[#819083]">Fetched: {fetchedAt ? new Date(fetchedAt).toLocaleString() : "Unavailable"}{result?.cached === true && ` · Cached${typeof result.cache_age_seconds === "number" ? ` · ${result.cache_age_seconds}s old` : ""}`}</p><p className="mt-2 break-words text-sm text-[#334c39]">{formatTraceValue(result?.data ?? result?.error ?? result)}</p></>}</div>; })}</div></div>}
          {profile && <MandiTrend state={form.state} district={form.district} commodity={form.crops.split(",")[0]?.trim() ?? ""} />}
          {profile && <DecisionSignals place={form.place_name} state={form.state} district={form.district} commodity={form.crops.split(",")[0]?.trim() ?? ""} />}
          {profile && deviceIdLabel && <AlertCheck deviceId={deviceIdLabel} rainThreshold={profile.alert_rain_mm ?? 20} windThreshold={profile.alert_wind_kmh ?? 40} />}
        </section>
      </div>
    </main>
  );
}

