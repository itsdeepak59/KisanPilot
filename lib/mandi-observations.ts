import { withDatabaseRetry } from "@/lib/db";
import type { MandiPrice } from "@/lib/agent/tools/mandi";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function retainMandiObservations(records: MandiPrice[]): Promise<void> {
  if (records.length === 0) return;
  try {
    await withDatabaseRetry(() => createServerSupabaseClient().from("mandi_observations").insert(records.map((record) => ({ ...record, observed_at: new Date().toISOString() }))));
  } catch {
    // A missing or unavailable history table must not hide a successful live price response.
  }
}
