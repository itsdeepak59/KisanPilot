"use client";

import { useEffect, useState } from "react";

type MandiObservation = { arrival_date: string; market: string; modal_price: number | null; observed_at: string };

export function MandiTrend({ state, district, commodity }: { state: string; district: string; commodity: string }) {
  const [observations, setObservations] = useState<MandiObservation[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!state || !district || !commodity) {
      return;
    }
    fetch(`/api/mandi/trend?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&commodity=${encodeURIComponent(commodity)}`)
      .then(async (response) => {
        const result = (await response.json()) as { ok: boolean; data?: MandiObservation[]; error?: string };
        if (!response.ok || !result.ok) throw new Error(result.error ?? "Mandi history unavailable");
        setObservations(result.data ?? []);
        setMessage("");
      })
      .catch((error: unknown) => {
        setObservations([]);
        setMessage(error instanceof Error ? error.message : "Mandi history unavailable");
      });
  }, [commodity, district, state]);

  const values = observations.map((observation) => observation.modal_price).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const maximum = Math.max(...values, 0);

  return <div className="rounded-[2rem] border border-[#dce4d8] bg-white p-6 shadow-sm sm:p-8"><p className="text-sm font-medium text-[#65806c]">Mandi history</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Retained live observations</h2>{!state || !district || !commodity ? <p className="mt-4 text-sm text-[#58705c]">Save a state, district, and crop to view retained mandi history.</p> : message ? <p className="mt-4 text-sm text-[#58705c]">{message}</p> : observations.length < 2 ? <p className="mt-4 text-sm text-[#58705c]">Not enough retained observations for a trend yet. New chart points appear only after successful live mandi calls.</p> : <div className="mt-6 space-y-3">{observations.map((observation, index) => { const value = observation.modal_price; const width = value && maximum ? `${Math.max(4, (value / maximum) * 100)}%` : "4%"; return <div key={`${observation.observed_at}-${index}`}><div className="flex justify-between gap-3 text-xs text-[#58705c]"><span>{observation.arrival_date} · {observation.market}</span><span>{value === null ? "No modal price" : value}</span></div><div className="mt-1 h-2 rounded-full bg-[#edf4e7]"><div className="h-2 rounded-full bg-[#477652]" style={{ width }} /></div></div>; })}</div>}</div>;
}
