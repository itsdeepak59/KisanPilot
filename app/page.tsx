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

export default function Home() {
  const deviceId = useRef("");
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [form, setForm] = useState(profileToForm(null));
  const [question, setQuestion] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [questionMessage, setQuestionMessage] = useState("");
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

  function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuestionMessage(question.trim() ? "Question captured. The live advisory connection will answer it in the next step." : "Write a question first.");
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

          <div className="rounded-[2rem] border border-[#dce4d8] bg-white p-6 shadow-sm sm:p-8"><p className="text-sm font-medium text-[#65806c]">Ask KisanPilot</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">What do you want to decide?</h2><form className="mt-6" onSubmit={submitQuestion}><textarea className="min-h-32 w-full resize-y rounded-2xl border border-[#d5dfd2] px-4 py-4 leading-6 outline-none placeholder:text-[#9aa79c] focus:border-[#477652] focus:ring-2 focus:ring-[#c9ddc4]" placeholder="Type a question about your crop or farm…" value={question} onChange={(event) => setQuestion(event.target.value)} /><div className="mt-4 flex flex-wrap items-center gap-3"><button className="rounded-xl bg-[#173b2b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#102b1e]" type="submit">Submit question</button>{questionMessage && <p className="max-w-md text-sm text-[#58705c]" role="status">{questionMessage}</p>}</div></form></div>
        </section>
      </div>
    </main>
  );
}

