import { NextResponse } from "next/server";

import { normalizeProfileInput } from "@/lib/profile";
import { createServerSupabaseClient } from "@/lib/supabase";

const SOURCE = "Supabase";
const TIMEOUT_MS = 8_000;

type DatabaseResult<T> =
  | { ok: true; data: T; source: string; fetched_at: string }
  | { ok: false; error: string; source: string; fetched_at: string };

async function runDatabaseQuery<T>(query: () => Promise<{ data: T | null; error: { message: string } | null }>): Promise<DatabaseResult<T>> {
  let lastError = "Database request failed";

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const fetchedAt = new Date().toISOString();
    try {
      const result = await Promise.race([
        query(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Database request timed out")), TIMEOUT_MS)),
      ]);

      if (!result.error) {
        return { ok: true, data: result.data as T, source: SOURCE, fetched_at: fetchedAt };
      }
      lastError = result.error.message;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Database request failed";
    }

    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return { ok: false, error: lastError, source: SOURCE, fetched_at: new Date().toISOString() };
}

export async function GET(request: Request) {
  const deviceId = new URL(request.url).searchParams.get("device_id")?.trim();
  if (!deviceId || deviceId.length > 128) {
    return NextResponse.json({ ok: false, error: "A valid device_id is required" }, { status: 400 });
  }

  try {
    const result = await runDatabaseQuery(async () => createServerSupabaseClient().from("farmers").select("*").eq("device_id", deviceId).maybeSingle());
    if (!result.ok) return NextResponse.json(result, { status: 503 });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Profile load failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ ok: false, error: "Profile could not be loaded" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let input: ReturnType<typeof normalizeProfileInput>;
  try {
    input = normalizeProfileInput(await request.json());
  } catch {
    input = null;
  }

  if (!input) {
    return NextResponse.json({ ok: false, error: "Invalid profile" }, { status: 400 });
  }

  try {
    const result = await runDatabaseQuery(async () => createServerSupabaseClient()
      .from("farmers")
      .upsert(input, { onConflict: "device_id" })
      .select("*")
      .single());
    if (!result.ok) return NextResponse.json(result, { status: 503 });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Profile save failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ ok: false, error: "Profile could not be saved" }, { status: 503 });
  }
}
