type TraceEvent = {
  type: string;
  tool?: string;
  result?: unknown;
  fetched_at?: string;
};

type SourceChip = {
  source: string;
  fetchedAt?: string;
  state: "live" | "cached" | "unavailable";
  age?: number;
};

function resultRecord(event: TraceEvent): Record<string, unknown> | null {
  return event.result && typeof event.result === "object" ? event.result as Record<string, unknown> : null;
}

function sourceChips(trace: TraceEvent[]): SourceChip[] {
  const seen = new Set<string>();
  return trace.flatMap((event) => {
    if (event.type !== "tool_result") return [];
    const result = resultRecord(event);
    if (!result) return [];
    const source = typeof result.source === "string" ? result.source : "";
    if (!source || seen.has(source)) return [];
    seen.add(source);
    const fetchedAt = typeof result.fetched_at === "string" ? result.fetched_at : event.fetched_at;
    const state = result.ok === false ? "unavailable" : result.cached === true ? "cached" : "live";
    return [{
      source,
      fetchedAt,
      state,
      age: typeof result.cache_age_seconds === "number" ? result.cache_age_seconds : undefined,
    }];
  });
}

function answerSections(answer: string) {
  const paragraphs = answer.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  const summary = paragraphs[0] ?? answer.trim();
  const actions = answer.split("\n")
    .map((line) => line.trim())
    .filter((line) => /^(?:[-*•]|\d+[.)])\s+/.test(line) && /\d{1,2}[/-]\d{1,2}|\b(?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(line))
    .slice(0, 4);
  return { summary, actions };
}

function sourceLabel(source: string): string {
  try {
    return new URL(source).hostname.replace(/^www\./, "");
  } catch {
    return source;
  }
}

export function StructuredAnswer({ answer, trace, onSpeak, speaking }: { answer: string; trace: TraceEvent[]; onSpeak: () => void; speaking: boolean }) {
  const { summary, actions } = answerSections(answer);
  const sources = sourceChips(trace);
  return (
    <section className="mt-7 overflow-hidden rounded-3xl border border-[#cfe0c9] bg-white shadow-sm" aria-label="Structured live answer">
      <div className="border-b border-[#e3ebe0] bg-[#edf6e9] px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#52765a]">Live answer</p>
            <p className="mt-1 text-sm text-[#5d7462]">Grounded in the sources shown below</p>
          </div>
          <button className="rounded-lg border border-[#a9c3a6] bg-white px-3 py-2 text-xs font-semibold text-[#285d3d] hover:bg-[#f7fbf5]" onClick={onSpeak} type="button">{speaking ? "Speaking…" : "Read aloud"}</button>
        </div>
      </div>
      <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#65806c]">Summary</p>
          <p className="mt-2 whitespace-pre-wrap leading-7 text-[#26382b]">{summary}</p>
        </div>
        {actions.length > 0 && <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#65806c]">Dated actions from this answer</p>
          <ul className="mt-3 space-y-2">
            {actions.map((action, index) => <li className="rounded-xl bg-[#f5f7f2] px-4 py-3 text-sm leading-6 text-[#334c39]" key={`${action}-${index}`}>{action.replace(/^(?:[-*•]|\d+[.)])\s+/, "")}</li>)}
          </ul>
        </div>}
        <details className="group">
          <summary className="cursor-pointer text-sm font-semibold text-[#285d3d]">Show full answer</summary>
          <p className="mt-3 whitespace-pre-wrap border-l-2 border-[#c9ddc4] pl-4 text-sm leading-7 text-[#405846]">{answer}</p>
        </details>
        {sources.length > 0 && <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#65806c]">Source freshness</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {sources.map((item) => <div className="min-w-0 rounded-xl border border-[#e1e9df] px-3 py-3" key={item.source}>
              <div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold text-[#334c39]">{sourceLabel(item.source)}</span><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${item.state === "live" ? "bg-[#e5f4e5] text-[#2c7140]" : item.state === "cached" ? "bg-[#fff3d8] text-[#8a651d]" : "bg-[#fde8e7] text-[#a4423e]"}`}>{item.state === "cached" && item.age !== undefined ? `Cached · ${Math.max(1, Math.round(item.age / 60))}m` : item.state}</span></div>
              <p className="mt-1 truncate text-xs text-[#819083]" title={item.source}>{item.fetchedAt ? new Date(item.fetchedAt).toLocaleString() : "Timestamp unavailable"}</p>
            </div>)}
          </div>
        </div>}
      </div>
    </section>
  );
}
