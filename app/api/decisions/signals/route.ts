import { getDecisionSignals } from "@/lib/decision/service";
import { geocodeLocation } from "@/lib/agent/tools/geocode";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const place = params.get("place_name")?.trim() ?? "";
  const state = params.get("state")?.trim() ?? "";
  const district = params.get("district")?.trim() ?? "";
  const commodity = params.get("commodity")?.trim() ?? "";
  if (!place || !state || !district || !commodity) return Response.json({ ok: false, error: "Place, state, district, and crop are required" }, { status: 400 });
  const location = await geocodeLocation(place);
  if (!location.ok) return Response.json(location, { status: 503 });
  const result = await getDecisionSignals(location.data.latitude, location.data.longitude, state, district, commodity);
  return Response.json(result, { status: result.ok ? 200 : 503 });
}
