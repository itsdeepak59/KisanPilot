import { getWeatherForecast } from "@/lib/agent/tools/weather";
import { geocodeLocation } from "@/lib/agent/tools/geocode";
import { createServerSupabaseClient } from "@/lib/supabase";
import { sendTelegramMessage } from "@/lib/telegram";
import { withDatabaseRetry } from "@/lib/db";
import { findWeatherRisk } from "@/lib/alerts/evaluate";

type FarmerAlertRow = { id: string; lat: number | null; lon: number | null; place_name: string | null; telegram_chat_id: string | null; alert_rain_mm: number; alert_wind_kmh: number };

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization");
  return Boolean(secret && header === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  return runAlerts(request);
}

export async function POST(request: Request) {
  return runAlerts(request);
}

async function runAlerts(request: Request) {
  if (!isAuthorized(request)) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!process.env.TELEGRAM_BOT_TOKEN) return Response.json({ ok: false, error: "TELEGRAM_BOT_TOKEN is not configured" }, { status: 503 });

  try {
    const { data: farmers, error } = await withDatabaseRetry(() => createServerSupabaseClient().from("farmers").select("id,lat,lon,place_name,telegram_chat_id,alert_rain_mm,alert_wind_kmh").not("telegram_chat_id", "is", null).limit(100));
    if (error) throw error;
    const results: Array<{ farmer_id: string; sent: boolean; reason?: string }> = [];
    for (const farmer of (farmers ?? []) as FarmerAlertRow[]) {
      if (!farmer.telegram_chat_id) {
        results.push({ farmer_id: farmer.id, sent: false, reason: "Missing coordinates or chat link" });
        continue;
      }
      let latitude = farmer.lat;
      let longitude = farmer.lon;
      if ((latitude === null || longitude === null) && farmer.place_name) {
        const geocoded = await geocodeLocation(farmer.place_name);
        if (geocoded.ok) {
          latitude = geocoded.data.latitude;
          longitude = geocoded.data.longitude;
        }
      }
      if (latitude === null || longitude === null) {
        results.push({ farmer_id: farmer.id, sent: false, reason: "Missing coordinates or place name" });
        continue;
      }
      const weather = await getWeatherForecast(latitude, longitude, 2);
      if (!weather.ok) {
        results.push({ farmer_id: farmer.id, sent: false, reason: "Weather unavailable" });
        continue;
      }
      const risk = findWeatherRisk(weather.data.days, { rain_mm: farmer.alert_rain_mm ?? 20, wind_kmh: farmer.alert_wind_kmh ?? 40 });
      if (!risk) {
        results.push({ farmer_id: farmer.id, sent: false, reason: "No alert threshold reached" });
        continue;
      }
      const detail = risk.detail;
      const cacheNote = weather.cached ? ` Cached data is ${weather.cache_age_seconds ?? 0} seconds old.` : "";
      const message = `KisanPilot weather alert for ${risk.date}: ${detail}. Source: ${weather.source}, fetched ${weather.fetched_at}.${cacheNote}`;
      const sent = await sendTelegramMessage(farmer.telegram_chat_id, message);
      await withDatabaseRetry(() => createServerSupabaseClient().from("alerts").insert({ farmer_id: farmer.id, kind: "weather_risk", message, delivered: sent.ok }));
      results.push({ farmer_id: farmer.id, sent: sent.ok, ...(sent.ok ? {} : { reason: sent.error }) });
    }
    return Response.json({ ok: true, results });
  } catch {
    return Response.json({ ok: false, error: "Alert run is unavailable" }, { status: 503 });
  }
}
