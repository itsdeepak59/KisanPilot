import type { MandiPrice } from "@/lib/agent/tools/mandi";
import type { WeatherDay } from "@/lib/agent/tools/weather";

export const HARVEST_RAIN_MAX_MM = 2;
export const HARVEST_WIND_MAX_KMH = 30;
export const HARVEST_MAX_TEMP_C = 35;
export const MIN_MANDI_SAMPLES = 3;
export const SELL_PREMIUM_RATIO = 1.05;
export const HOLD_DISCOUNT_RATIO = 0.95;

export type HarvestSignal = {
  status: "favorable" | "limited" | "unavailable";
  dates: string[];
  rule: string;
};

export type WaterSignal = {
  rain_mm: number;
  et0_mm: number;
  balance_mm: number;
  status: "surplus" | "deficit" | "balanced" | "unavailable";
  rule: string;
};

export type SellHoldSignal = {
  signal: "sell" | "hold" | "monitor" | "insufficient_history";
  latest_modal_price: number | null;
  recent_average_modal_price: number | null;
  sample_size: number;
  rule: string;
};

export function computeHarvestSignal(days: WeatherDay[]): HarvestSignal {
  const eligible = days.filter((day) => day.rain_mm !== null && day.max_wind_kmh !== null && day.max_temperature_c !== null && day.rain_mm <= HARVEST_RAIN_MAX_MM && day.max_wind_kmh <= HARVEST_WIND_MAX_KMH && day.max_temperature_c <= HARVEST_MAX_TEMP_C);
  return {
    status: eligible.length > 0 ? "favorable" : days.length > 0 ? "limited" : "unavailable",
    dates: eligible.map((day) => day.date),
    rule: `Favorable when rain ≤ ${HARVEST_RAIN_MAX_MM} mm, max wind ≤ ${HARVEST_WIND_MAX_KMH} km/h, and max temperature ≤ ${HARVEST_MAX_TEMP_C}°C. This is a planning heuristic, not agronomic advice.`,
  };
}

export function computeWaterSignal(days: WeatherDay[]): WaterSignal {
  const usable = days.filter((day) => day.rain_mm !== null && day.et0_mm !== null);
  if (usable.length === 0) return { rain_mm: 0, et0_mm: 0, balance_mm: 0, status: "unavailable", rule: "Requires live or cached rain and ET0 for the forecast period." };
  const rain = usable.reduce((sum, day) => sum + (day.rain_mm ?? 0), 0);
  const et0 = usable.reduce((sum, day) => sum + (day.et0_mm ?? 0), 0);
  const balance = rain - et0;
  return { rain_mm: Number(rain.toFixed(1)), et0_mm: Number(et0.toFixed(1)), balance_mm: Number(balance.toFixed(1)), status: balance > 1 ? "surplus" : balance < -1 ? "deficit" : "balanced", rule: "Balance = forecast rain − forecast ET0 across the available forecast days; it is not an irrigation prescription." };
}

export function computeSellHoldSignal(records: MandiPrice[]): SellHoldSignal {
  const prices = records.map((record) => record.modal_price).filter((price): price is number => typeof price === "number" && Number.isFinite(price) && price >= 0);
  const latest = prices.at(-1) ?? null;
  const average = prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : null;
  const base = { latest_modal_price: latest, recent_average_modal_price: average === null ? null : Number(average.toFixed(2)), sample_size: prices.length, rule: `Requires at least ${MIN_MANDI_SAMPLES} retained live modal-price observations. Sell signal is latest ≥ ${Math.round((SELL_PREMIUM_RATIO - 1) * 100)}% above average; hold signal is latest ≤ ${Math.round((1 - HOLD_DISCOUNT_RATIO) * 100)}% below average.` };
  if (prices.length < MIN_MANDI_SAMPLES || latest === null || average === null || average === 0) return { ...base, signal: "insufficient_history" };
  return { ...base, signal: latest >= average * SELL_PREMIUM_RATIO ? "sell" : latest <= average * HOLD_DISCOUNT_RATIO ? "hold" : "monitor" };
}
