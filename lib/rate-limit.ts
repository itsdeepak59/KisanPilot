type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

type RateLimitEntry = {
  requests: number[];
};

const entries = new Map<string, RateLimitEntry>();

export const CHAT_RATE_LIMIT = 8;
export const CHAT_RATE_LIMIT_WINDOW_MS = 60_000;

function activeRequests(entry: RateLimitEntry, now: number): number[] {
  return entry.requests.filter((timestamp) => timestamp > now - CHAT_RATE_LIMIT_WINDOW_MS);
}

export function getRequestIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function limitChatRequest(identifiers: string[], now = Date.now()): RateLimitResult {
  const keys = [...new Set(identifiers.filter(Boolean))];
  const activeByKey = keys.map((key) => ({ key, requests: activeRequests(entries.get(key) ?? { requests: [] }, now) }));
  const blocked = activeByKey.find(({ requests }) => requests.length >= CHAT_RATE_LIMIT);

  if (blocked) {
    const oldestRequest = blocked.requests[0] ?? now;
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((oldestRequest + CHAT_RATE_LIMIT_WINDOW_MS - now) / 1_000)) };
  }

  for (const { key, requests } of activeByKey) entries.set(key, { requests: [...requests, now] });
  return { ok: true };
}
