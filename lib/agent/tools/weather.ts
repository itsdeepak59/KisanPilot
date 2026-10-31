import { readCache, writeCache } from "@/lib/cache";
import { fetchJson } from "@/lib/agent/tools/http";
import type { ToolResult } from "@/lib/agent/tools/types";

const SOURCE = "Open-Meteo Forecast";
const CACHE_TTL_SECONDS = 1_800;

type WeatherResponse = {
  daily?: {
    time?: string[];
    rain_sum?: Array<number | null>;
    temperature_2m_min?: Array<number | null>;
    temperature_2m_max?: Array<number | null>;
    wind_speed_10m_max?: Array<number | null>;
    et0_fao_evapotranspiration?: Array<number | null>;
  };
};

export type WeatherDay = {
  date: string;
  rain_mm: number | null;
  min_temperature_c: number | null;
  max_temperature_c: number | null;
  max_wind_kmh: number | null;
  et0_mm: number | null;
};

export type WeatherForecast = { latitude: number; longitude: number; days: WeatherDay[] };

export async function getWeatherForecast(latitude: number, longitude: number, requestedDays = 7): Promise<ToolResult<WeatherForecast>> {
  const fetchedAt = new Date().toISOString();
  const days = Number.isFinite(requestedDays) ? Math.min(7, Math.max(1, Math.floor(requestedDays))) : 7;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return { ok: false, error: "Valid coordinates are required", source: SOURCE, fetched_at: fetchedAt };

  const cacheKey = `weather:${latitude.toFixed(4)}:${longitude.toFixed(4)}:${days}`;
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude), forecast_days: String(days), timezone: "auto", daily: "rain_sum,temperature_2m_min,temperature_2m_max,wind_speed_10m_max,et0_fao_evapotranspiration" }).toString();
  const live = await fetchJson<WeatherResponse>(url.toString());

  if (live.ok) {
    const daily = live.data.daily;
    if (!daily?.time || !daily.rain_sum || !daily.temperature_2m_min || !daily.temperature_2m_max || !daily.wind_speed_10m_max || !daily.et0_fao_evapotranspiration) {
      return { ok: false, error: "Weather response was incomplete", source: SOURCE, fetched_at: fetchedAt };
    }
    const data: WeatherForecast = {
      latitude,
      longitude,
      days: daily.time.map((date, index) => ({
        date,
        rain_mm: daily.rain_sum?.[index] ?? null,
        min_temperature_c: daily.temperature_2m_min?.[index] ?? null,
        max_temperature_c: daily.temperature_2m_max?.[index] ?? null,
        max_wind_kmh: daily.wind_speed_10m_max?.[index] ?? null,
        et0_mm: daily.et0_fao_evapotranspiration?.[index] ?? null,
      })),
    };
    await writeCache(cacheKey, SOURCE, data, CACHE_TTL_SECONDS);
    return { ok: true, data, source: SOURCE, fetched_at: fetchedAt };
  }

  const cached = await readCache<WeatherForecast>(cacheKey);
  if (cached) return { ok: true, data: cached.data, source: `${SOURCE} (cached)`, fetched_at: cached.fetched_at, cached: true, cache_age_seconds: cached.age_seconds };
  return { ok: false, error: `Live weather unavailable: ${live.error}`, source: SOURCE, fetched_at: fetchedAt };
}
