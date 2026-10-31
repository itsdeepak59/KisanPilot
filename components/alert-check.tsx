"use client";

import { useEffect, useState } from "react";

type AlertRow = { kind: string; message: string; sent_at: string; delivered: boolean };

export function AlertCheck({ deviceId, rainThreshold, windThreshold }: { deviceId: string; rainThreshold: number; windThreshold: number }) {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<AlertRow[]>([]);
  const [checking, setChecking] = useState(false);

  async function loadHistory() {
    const response = await fetch(`/api/alerts/history?device_id=${encodeURIComponent(deviceId)}`);
    const result = await response.json() as { ok: boolean; data?: AlertRow[] };
    if (response.ok && result.ok) setHistory(result.data ?? []);
  }

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/alerts/history?device_id=${encodeURIComponent(deviceId)}`)
      .then(async (response) => { const result = await response.json() as { ok: boolean; data?: AlertRow[] }; if (!cancelled && response.ok && result.ok) setHistory(result.data ?? []); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [deviceId]);

  async function checkAlerts() {
    setChecking(true);
    try {
      const response = await fetch("/api/alerts/check", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ device_id: deviceId }) });
      const result = await response.json() as { ok: boolean; message?: string; sent?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error ?? "Alert check unavailable");
      setMessage(`${result.message ?? "Alert check complete"}${result.sent ? " Telegram message sent." : ""}`);
      await loadHistory();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Alert check unavailable"); } finally { setChecking(false); }
  }

  return <div className="rounded-[2rem] border border-[#dce4d8] bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-medium text-[#65806c]">Alerts</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Check live weather risk</h2></div><button className="rounded-xl bg-[#285d3d] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={checking} onClick={checkAlerts} type="button">{checking ? "Checking…" : "Check alerts now"}</button></div><p className="mt-3 text-sm text-[#58705c]">Rain ≥ {rainThreshold} mm or wind ≥ {windThreshold} km/h sends a Telegram message only when your linked chat has a real breach.</p>{message && <p className="mt-4 rounded-xl bg-[#f5f7f2] p-3 text-sm text-[#334c39]" role="status">{message}</p>}<div className="mt-5"><p className="text-xs font-semibold uppercase tracking-wide text-[#65806c]">Recent alert history</p>{history.length === 0 ? <p className="mt-2 text-sm text-[#58705c]">No recorded weather breaches yet.</p> : <div className="mt-2 space-y-2">{history.map((row, index) => <div className="rounded-xl border border-[#e4ebe1] p-3 text-sm" key={`${row.sent_at}-${index}`}><p className="text-[#334c39]">{row.message}</p><p className="mt-1 text-xs text-[#819083]">{new Date(row.sent_at).toLocaleString()} · {row.delivered ? "Delivered" : "Not delivered"}</p></div>)}</div>}</div></div>;
}
