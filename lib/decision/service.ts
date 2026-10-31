import { getMandiPrices } from "@/lib/agent/tools/mandi";
import { getWeatherForecast } from "@/lib/agent/tools/weather";
import type { ToolResult } from "@/lib/agent/tools/types";
import { computeHarvestSignal, computeSellHoldSignal, computeWaterSignal, type HarvestSignal, type SellHoldSignal, type WaterSignal } from "@/lib/decision/signals";

export type DecisionSignals = {
  harvest: HarvestSignal;
  water: WaterSignal;
  sell_hold: SellHoldSignal;
  inputs: { weather_source: string; mandi_source: string; weather_fetched_at: string; mandi_fetched_at: string };
};

export async function getDecisionSignals(latitude: number, longitude: number, state: string, district: string, commodity: string): Promise<ToolResult<DecisionSignals>> {
  const fetchedAt = new Date().toISOString();
  const [weather, mandi] = await Promise.all([getWeatherForecast(latitude, longitude, 7), getMandiPrices(state, district, commodity)]);
  if (!weather.ok && !mandi.ok) return { ok: false, error: `Decision inputs unavailable: ${weather.error}; ${mandi.error}`, source: "KisanPilot decision signals", fetched_at: fetchedAt };
  const weatherDays = weather.ok ? weather.data.days : [];
  const mandiRecords = mandi.ok ? mandi.data.records : [];
  return { ok: true, data: { harvest: computeHarvestSignal(weatherDays), water: computeWaterSignal(weatherDays), sell_hold: computeSellHoldSignal(mandiRecords), inputs: { weather_source: weather.source, mandi_source: mandi.source, weather_fetched_at: weather.fetched_at, mandi_fetched_at: mandi.fetched_at } }, source: "KisanPilot decision signals", fetched_at: fetchedAt };
}
