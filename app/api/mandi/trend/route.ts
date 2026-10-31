import { withDatabaseRetry } from "@/lib/db";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const state = params.get("state")?.trim() ?? "";
  const district = params.get("district")?.trim() ?? "";
  const commodity = params.get("commodity")?.trim() ?? "";
  if (!state || !district || !commodity) return Response.json({ ok: false, error: "State, district, and commodity are required" }, { status: 400 });

  try {
    const result = await withDatabaseRetry(() => createServerSupabaseClient().from("mandi_observations").select("arrival_date,market,min_price,max_price,modal_price,observed_at").eq("state", state).eq("district", district).eq("commodity", commodity).order("observed_at", { ascending: true }).limit(30));
    if (result.error) return Response.json({ ok: false, error: "Mandi history is unavailable" }, { status: 503 });
    return Response.json({ ok: true, data: result.data ?? [], source: "KisanPilot retained data.gov.in observations", fetched_at: new Date().toISOString() });
  } catch {
    return Response.json({ ok: false, error: "Mandi history is unavailable" }, { status: 503 });
  }
}
