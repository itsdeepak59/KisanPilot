"use client";

import { useEffect, useState } from "react";

type Signals = { harvest: { status: string; dates: string[]; rule: string }; water: { status: string; rain_mm: number; et0_mm: number; balance_mm: number; rule: string }; sell_hold: { signal: string; latest_modal_price: number | null; recent_average_modal_price: number | null; sample_size: number; rule: string } };

export function DecisionSignals({ place, state, district, commodity }: { place: string; state: string; district: string; commodity: string }) {
  const [signals, setSignals] = useState<Signals | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!place || !state || !district || !commodity) return;
    fetch(`/api/decisions/signals?place_name=${encodeURIComponent(place)}&state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&commodity=${encodeURIComponent(commodity)}`)
      .then(async (response) => { const result = await response.json() as { ok: boolean; data?: Signals; error?: string }; if (!response.ok || !result.ok || !result.data) throw new Error(result.error ?? "Decision signals unavailable"); setSignals(result.data); setMessage(""); })
      .catch((error: unknown) => { setSignals(null); setMessage(error instanceof Error ? error.message : "Decision signals unavailable"); });
  }, [commodity, district, place, state]);
  return <div className="rounded-[2rem] border border-[#dce4d8] bg-white p-6 shadow-sm sm:p-8"><p className="text-sm font-medium text-[#65806c]">Decision signals</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Transparent planning heuristics</h2>{message ? <p className="mt-4 text-sm text-[#58705c]">{message}</p> : !signals ? <p className="mt-4 text-sm text-[#58705c]">Save location, district, state, and crop to calculate signals from live data.</p> : <div className="mt-6 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-[#f5f7f2] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#65806c]">Harvest window</p><p className="mt-2 font-semibold">{signals.harvest.status}</p><p className="mt-1 text-sm text-[#58705c]">{signals.harvest.dates.length ? signals.harvest.dates.join(", ") : "No qualifying dates"}</p></div><div className="rounded-2xl bg-[#f5f7f2] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#65806c]">Water balance</p><p className="mt-2 font-semibold">{signals.water.status} · {signals.water.balance_mm} mm</p><p className="mt-1 text-sm text-[#58705c]">Rain {signals.water.rain_mm} mm · ET0 {signals.water.et0_mm} mm</p></div><div className="rounded-2xl bg-[#f5f7f2] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#65806c]">Sell / hold</p><p className="mt-2 font-semibold">{signals.sell_hold.signal.replaceAll("_", " ")}</p><p className="mt-1 text-sm text-[#58705c]">{signals.sell_hold.sample_size} retained price samples</p></div></div>}<p className="mt-4 text-xs text-[#819083]">These are transparent heuristics from live forecast and retained mandi observations, not agronomic advice.</p></div>;
}
