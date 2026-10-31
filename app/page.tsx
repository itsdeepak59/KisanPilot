"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { FarmerProfile, ProfileLanguage } from "@/lib/profile";

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
  };
}

type TraceEvent = {
  type: string;
  tool?: string;
  input?: unknown;
  result?: unknown;
  fetched_at?: string;
};

function formatTraceValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return "Unavailable";
  }
}

export default function Home() {
  const deviceId = useRef("");
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [form, setForm] = useState(profileToForm(null));
  const [question, setQuestion] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [questionMessage, setQuestionMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [trace, setTrace] = useState<TraceEvent[]>([]);
  const [asking, setAsking] = useState(false);
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
      .finally(() => setLoading(false));
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
        }),
      });
      if (!response.ok || !response.body) throw new Error("The advisory service is unavailable.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const chunk = await reader.read();
        buffer += decoder.decode(chunk.value ?? new Uint8Array(), { stream: !chunk.done });
        const messages = buffer.split("\n\n");
        buffer = messages.pop() ?? "";
        for (const message of messages) {
          const line = message.split("\n").find((item) => item.startsWith("data: "));
          if (!line) continue;
          const event = JSON.parse(line.slice(6)) as TraceEvent & { text?: string; error?: string };
          if (event.type === "text_delta" && event.text) setAnswer((current) => current + event.text);
          if (event.type === "tool_call" || event.type === "tool_result") setTrace((current) => [...current, event]);
          if (event.type === "error") throw new Error(event.error ?? "The advisory service is unavailable.");
          if (event.type === "done") setQuestionMessage("Answer grounded in the trace below.");
        }
        if (chunk.done) break;
      }
    } catch (error) {
      setQuestionMessage(error instanceof Error ? error.message : "The advisory service is unavailable.");
    } finally {
      setAsking(false);
    }
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
            <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-medium text-[#65806c]">Your farm profile</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Start with your context</h2></div><span className="rounded-full bg-[#edf4e7] px-3 py-1 text-xs font-medium text-[#476c4f]">{loading ? "Loading" : profile ? "Saved" : "New profile"}</span></div>
            <form className="mt-7 space-y-5" onSubmit={saveProfile}>
              <label className="block text-sm font-medium">Language<select className="mt-2 w-full rounded-xl border border-[#d5dfd2] bg-white px-4 py-3 outline-none focus:border-[#477652] focus:ring-2 focus:ring-[#c9ddc4]" value={form.language} onChange={(event) => setForm({ ...form, language: event.target.value as ProfileLanguage })}><option value="en">English</option><option value="hi">हिन्दी</option></select></label>
              <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-medium">Village or town<input className="mt-2 w-full rounded-xl border border-[#d5dfd2] px-4 py-3 outline-none placeholder:text-[#9aa79c] focus:border-[#477652] focus:ring-2 focus:ring-[#c9ddc4]" placeholder="Enter your location" value={form.place_name} onChange={(event) => setForm({ ...form, place_name: event.target.value })} /></label><label className="block text-sm font-medium">District<input className="mt-2 w-full rounded-xl border border-[#d5dfd2] px-4 py-3 outline-none placeholder:text-[#9aa79c] focus:border-[#477652] focus:ring-2 focus:ring-[#c9ddc4]" placeholder="Enter district" value={form.district} onChange={(event) => setForm({ ...form, district: event.target.value })} /></label></div>
              <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-medium">State<input className="mt-2 w-full rounded-xl border border-[#d5dfd2] px-4 py-3 outline-none placeholder:text-[#9aa79c] focus:border-[#477652] focus:ring-2 focus:ring-[#c9ddc4]" placeholder="Enter state" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} /></label><label className="block text-sm font-medium">Crops<input className="mt-2 w-full rounded-xl border border-[#d5dfd2] px-4 py-3 outline-none placeholder:text-[#9aa79c] focus:border-[#477652] focus:ring-2 focus:ring-[#c9ddc4]" placeholder="Comma-separated crops" value={form.crops} onChange={(event) => setForm({ ...form, crops: event.target.value })} /></label></div>
              <div className="flex flex-wrap items-center gap-3"><button className="rounded-xl bg-[#285d3d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1e4b30] disabled:cursor-not-allowed disabled:opacity-60" disabled={saving || loading} type="submit">{saving ? "Saving…" : "Save profile"}</button>{savedMessage && <p className="text-sm text-[#58705c]" role="status">{savedMessage}</p>}</div>
            </form>
          </div>

          <div className="rounded-[2rem] border border-[#dce4d8] bg-white p-6 shadow-sm sm:p-8"><p className="text-sm font-medium text-[#65806c]">Ask KisanPilot</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">What do you want to decide?</h2><form className="mt-6" onSubmit={submitQuestion}><textarea className="min-h-32 w-full resize-y rounded-2xl border border-[#d5dfd2] px-4 py-4 leading-6 outline-none placeholder:text-[#9aa79c] focus:border-[#477652] focus:ring-2 focus:ring-[#c9ddc4]" placeholder="Type a question about your crop or farm…" value={question} onChange={(event) => setQuestion(event.target.value)} /><div className="mt-4 flex flex-wrap items-center gap-3"><button className="rounded-xl bg-[#173b2b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#102b1e] disabled:cursor-wait disabled:opacity-60" disabled={asking} type="submit">{asking ? "Checking live sources…" : "Submit question"}</button>{questionMessage && <p className="max-w-md text-sm text-[#58705c]" role="status">{questionMessage}</p>}</div></form>{answer && <div className="mt-7 rounded-2xl bg-[#f5f7f2] p-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#65806c]">Live answer</p><p className="mt-3 whitespace-pre-wrap leading-7 text-[#26382b]">{answer}</p></div>}</div>
          {trace.length > 0 && <div className="rounded-[2rem] border border-[#dce4d8] bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-medium text-[#65806c]">Transparency</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Tool trace</h2></div><span className="rounded-full bg-[#edf4e7] px-3 py-1 text-xs font-medium text-[#476c4f]">{trace.length} events</span></div><div className="mt-6 space-y-3">{trace.map((event, index) => { const result = event.result && typeof event.result === "object" ? event.result as Record<string, unknown> : null; const source = typeof result?.source === "string" ? result.source : "Source returned by tool"; const fetchedAt = typeof result?.fetched_at === "string" ? result.fetched_at : event.fetched_at; return <div className="rounded-2xl border border-[#e4ebe1] p-4" key={`${event.type}-${index}`}><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-medium">{event.tool ?? "Tool"}</p><span className="text-xs font-medium uppercase tracking-wide text-[#65806c]">{event.type === "tool_call" ? "Requested" : "Result"}</span></div>{event.type === "tool_call" ? <p className="mt-2 break-words text-sm text-[#58705c]">Input: {formatTraceValue(event.input)}</p> : <><p className="mt-2 break-words text-sm text-[#58705c]">Source: {source}</p><p className="mt-1 text-xs text-[#819083]">Fetched: {fetchedAt ? new Date(fetchedAt).toLocaleString() : "Unavailable"}{result?.cached === true && ` · Cached${typeof result.cache_age_seconds === "number" ? ` · ${result.cache_age_seconds}s old` : ""}`}</p><p className="mt-2 break-words text-sm text-[#334c39]">{formatTraceValue(result?.data ?? result?.error ?? result)}</p></>}</div>; })}</div></div>}
        </section>
      </div>
    </main>
  );
}

