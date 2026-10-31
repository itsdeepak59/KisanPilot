import { getRequestIp, limitRequest } from "@/lib/rate-limit";
import { getWeatherForecast } from "@/lib/agent/tools/weather";
import { geocodeLocation } from "@/lib/agent/tools/geocode";
import { findWeatherRisk } from "@/lib/alerts/evaluate";
import { createServerSupabaseClient } from "@/lib/supabase";
import { sendTelegramMessage } from "@/lib/telegram";
import { withDatabaseRetry } from "@/lib/db";

export async function POST(request: Request) {
  let input: { device_id?: unknown };
  try { input = await request.json() as { device_id?: unknown }; } catch { return Response.json({ ok: false, error: "Invalid request body" }, { status: 400 }); }
  const deviceId = typeof input.device_id === "string" ? input.device_id.trim() : "";
  if (!deviceId || deviceId.length > 128) return Response.json({ ok: false, error: "A valid device_id is required" }, { status: 400 });
  const rate = limitRequest([`alert-ip:${getRequestIp(request)}`, `alert-device:${deviceId}`], 3);
  if (!rate.ok) return Response.json({ ok: false, error: "Too many alert checks. Please wait a minute and try again." }, { status: 429, headers: { "retry-after": String(rate.retryAfterSeconds) } });
  try {
    const client = createServerSupabaseClient();
    const farmerResult = await withDatabaseRetry(() => client.from("farmers").select("id,lat,lon,place_name,telegram_chat_id,alert_rain_mm,alert_wind_kmh").eq("device_id", deviceId).maybeSingle());
    if (farmerResult.error || !farmerResult.data) return Response.json({ ok: false, error: "Farm profile was not found" }, { status: 404 });
    const farmer = farmerResult.data;
    let latitude = farmer.lat;
    let longitude = farmer.lon;
    if ((latitude === null || longitude === null) && farmer.place_name) { const location = await geocodeLocation(farmer.place_name); if (location.ok) { latitude = location.data.latitude; longitude = location.data.longitude; } }
    if (latitude === null || longitude === null) return Response.json({ ok: false, error: "Save a location before checking alerts" }, { status: 400 });
    const thresholds = { rain_mm: farmer.alert_rain_mm ?? 20, wind_kmh: farmer.alert_wind_kmh ?? 40 };
    const weather = await getWeatherForecast(latitude, longitude, 2);
    if (!weather.ok) return Response.json({ ok: false, error: "Weather unavailable", source: weather.source, fetched_at: weather.fetched_at }, { status: 503 });
    const risk = findWeatherRisk(weather.data.days, thresholds);
    let sent = false;
    let message = "No alert threshold reached.";
    if (risk) {
      message = `KisanPilot weather alert for ${risk.date}: ${risk.detail}. Source: ${weather.source}, fetched ${weather.fetched_at}.`;
      if (farmer.telegram_chat_id) { const telegram = await sendTelegramMessage(farmer.telegram_chat_id, message); sent = telegram.ok; }
      await withDatabaseRetry(() => client.from("alerts").insert({ farmer_id: farmer.id, kind: "weather_risk", message, delivered: sent }));
    }
    return Response.json({ ok: true, breach: Boolean(risk), sent, message, thresholds, forecast: weather.data.days, source: weather.source, fetched_at: weather.fetched_at });
  } catch { return Response.json({ ok: false, error: "Alert check is unavailable" }, { status: 503 }); }
}
