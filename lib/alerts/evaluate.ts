import type { WeatherDay } from "@/lib/agent/tools/weather";

export type AlertThresholds = { rain_mm: number; wind_kmh: number };
export type WeatherRisk = { date: string; detail: string; rain_mm: number | null; wind_kmh: number | null };

export function findWeatherRisk(days: WeatherDay[], thresholds: AlertThresholds): WeatherRisk | null {
  const risk = days.find((day) => (day.rain_mm ?? 0) >= thresholds.rain_mm || (day.max_wind_kmh ?? 0) >= thresholds.wind_kmh);
  if (!risk) return null;
  const detail = (risk.rain_mm ?? 0) >= thresholds.rain_mm ? `rain ${risk.rain_mm} mm` : `wind ${risk.max_wind_kmh} km/h`;
  return { date: risk.date, detail, rain_mm: risk.rain_mm, wind_kmh: risk.max_wind_kmh };
}
