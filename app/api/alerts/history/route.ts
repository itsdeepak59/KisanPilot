import { createServerSupabaseClient } from "@/lib/supabase";
import { withDatabaseRetry } from "@/lib/db";

export async function GET(request: Request) {
  const deviceId = new URL(request.url).searchParams.get("device_id")?.trim() ?? "";
  if (!deviceId || deviceId.length > 128) return Response.json({ ok: false, error: "A valid device_id is required" }, { status: 400 });
  try {
    const client = createServerSupabaseClient();
    const farmer = await withDatabaseRetry(() => client.from("farmers").select("id").eq("device_id", deviceId).maybeSingle());
    const farmerId = farmer.data?.id;
    if (farmer.error || !farmerId) return Response.json({ ok: false, error: "Farm profile was not found" }, { status: 404 });
    const result = await withDatabaseRetry(() => client.from("alerts").select("kind,message,sent_at,delivered").eq("farmer_id", farmerId).order("sent_at", { ascending: false }).limit(10));
    if (result.error) return Response.json({ ok: false, error: "Alert history is unavailable" }, { status: 503 });
    return Response.json({ ok: true, data: result.data ?? [], source: "KisanPilot alert history", fetched_at: new Date().toISOString() });
  } catch { return Response.json({ ok: false, error: "Alert history is unavailable" }, { status: 503 }); }
}
