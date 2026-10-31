import { getWeatherForecast } from "@/lib/agent/tools/weather";
import { createServerSupabaseClient } from "@/lib/supabase";
import { sendTelegramMessage } from "@/lib/telegram";
import { withDatabaseRetry } from "@/lib/db";

const RAIN_ALERT_MM = 20;
const WIND_ALERT_KMH = 40;

type FarmerAlertRow = { id: string; lat: number | null; lon: number | null; telegram_chat_id: string | null };

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
    const { data: farmers, error } = await withDatabaseRetry(() => createServerSupabaseClient().from("farmers").select("id,lat,lon,telegram_chat_id").not("telegram_chat_id", "is", null).limit(100));
    if (error) throw error;
    const results: Array<{ farmer_id: string; sent: boolean; reason?: string }> = [];
    for (const farmer of (farmers ?? []) as FarmerAlertRow[]) {
      if (farmer.lat === null || farmer.lon === null || !farmer.telegram_chat_id) {
        results.push({ farmer_id: farmer.id, sent: false, reason: "Missing coordinates or chat link" });
        continue;
      }
      const weather = await getWeatherForecast(farmer.lat, farmer.lon, 2);
      if (!weather.ok) {
        results.push({ farmer_id: farmer.id, sent: false, reason: "Weather unavailable" });
        continue;
      }
      const risk = weather.data.days.find((day) => (day.rain_mm ?? 0) >= RAIN_ALERT_MM || (day.max_wind_kmh ?? 0) >= WIND_ALERT_KMH);
      if (!risk) {
        results.push({ farmer_id: farmer.id, sent: false, reason: "No alert threshold reached" });
        continue;
      }
      const detail = (risk.rain_mm ?? 0) >= RAIN_ALERT_MM ? `rain ${risk.rain_mm} mm` : `wind ${risk.max_wind_kmh} km/h`;
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
