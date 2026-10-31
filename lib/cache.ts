import { createServerSupabaseClient } from "@/lib/supabase";

type CacheRecord = {
  payload: unknown;
  fetched_at: string;
  ttl_seconds: number;
};

const CACHE_TIMEOUT_MS = 8_000;

async function withDatabaseTimeout<T>(operation: () => PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<{ data: T | null; error: { message: string } | null }> {
  let lastError = "Cache request failed";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await Promise.race([
        operation(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Cache request timed out")), CACHE_TIMEOUT_MS)),
      ]);
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  return { data: null, error: { message: lastError } };
}

export async function readCache<T>(key: string): Promise<{ data: T; fetched_at: string; age_seconds: number } | null> {
  try {
    const { data, error } = await withDatabaseTimeout(() => createServerSupabaseClient().from("api_cache").select("payload, fetched_at, ttl_seconds").eq("key", key).maybeSingle());
    if (error || !data) return null;

    const record = data as CacheRecord;
    const ageSeconds = Math.max(0, Math.floor((Date.now() - Date.parse(record.fetched_at)) / 1000));
    if (!Number.isFinite(ageSeconds) || ageSeconds > record.ttl_seconds) return null;
    return { data: record.payload as T, fetched_at: record.fetched_at, age_seconds: ageSeconds };
  } catch {
    return null;
  }
}

export async function writeCache(key: string, source: string, payload: unknown, ttlSeconds: number): Promise<void> {
  try {
    await withDatabaseTimeout(() => createServerSupabaseClient().from("api_cache").upsert({
      key,
      source,
      payload,
      fetched_at: new Date().toISOString(),
      ttl_seconds: ttlSeconds,
    }));
  } catch {
    // A cache outage must not turn a successful live data response into a failure.
  }
}
