import { readCache, writeCache } from "@/lib/cache";
import { fetchJson } from "@/lib/agent/tools/http";
import type { ToolResult } from "@/lib/agent/tools/types";

const SOURCE = "data.gov.in mandi prices";
const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const CACHE_TTL_SECONDS = 1_800;

type MandiApiResponse = {
  records?: Array<Record<string, unknown>>;
};

export type MandiPrice = {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string | null;
  grade: string | null;
  arrival_date: string;
  min_price: number | null;
  max_price: number | null;
  modal_price: number | null;
};

export type MandiPrices = {
  state: string;
  district: string | null;
  commodity: string;
  scope: "district" | "state";
  records: MandiPrice[];
};

function asText(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const text = String(value).trim();
  return text || null;
}

function asPrice(value: unknown): number | null {
  const number = typeof value === "number" ? value : Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : null;
}

function parseRecord(record: Record<string, unknown>): MandiPrice | null {
  const state = asText(record.state);
  const district = asText(record.district);
  const market = asText(record.market);
  const commodity = asText(record.commodity);
  const arrivalDate = asText(record.arrival_date);
  if (!state || !district || !market || !commodity || !arrivalDate) return null;

  return {
    state,
    district,
    market,
    commodity,
    variety: asText(record.variety),
    grade: asText(record.grade),
    arrival_date: arrivalDate,
    min_price: asPrice(record.min_price),
    max_price: asPrice(record.max_price),
    modal_price: asPrice(record.modal_price),
  };
}

function buildUrl(apiKey: string, state: string, district: string | null, commodity: string | null): string {
  const url = new URL(`https://api.data.gov.in/resource/${RESOURCE_ID}`);
  url.search = new URLSearchParams({
    "api-key": apiKey,
    format: "json",
    limit: district ? "100" : "1000",
    "filters[state]": state,
    ...(district ? { "filters[district]": district } : {}),
    ...(commodity ? { "filters[commodity]": commodity } : {}),
  }).toString();
  return url.toString();
}

async function queryMandi(apiKey: string, state: string, district: string | null, commodity: string): Promise<{ ok: true; records: MandiPrice[] } | { ok: false; error: string }> {
  const response = await fetchJson<MandiApiResponse>(buildUrl(apiKey, state, district, district ? commodity : null));
  if (!response.ok) return response;
  const records = (response.data.records ?? []).map(parseRecord).filter((record): record is MandiPrice => record !== null);
  const matchingRecords = district ? records : records.filter((record) => record.commodity.toLowerCase() === commodity.toLowerCase());
  return { ok: true, records: matchingRecords };
}

export async function getMandiPrices(state: string, district: string, commodity: string): Promise<ToolResult<MandiPrices>> {
  const fetchedAt = new Date().toISOString();
  const normalizedState = state.trim();
  const normalizedDistrict = district.trim();
  const normalizedCommodity = commodity.trim();
  const apiKey = process.env.DATA_GOV_IN_API_KEY;
  if (!apiKey) return { ok: false, error: "DATA_GOV_IN_API_KEY is not configured", source: SOURCE, fetched_at: fetchedAt };
  if (!normalizedState || !normalizedDistrict || !normalizedCommodity) return { ok: false, error: "State, district, and commodity are required", source: SOURCE, fetched_at: fetchedAt };

  const districtKey = `mandi:${normalizedState.toLowerCase()}:${normalizedDistrict.toLowerCase()}:${normalizedCommodity.toLowerCase()}:district`;
  const districtResult = await queryMandi(apiKey, normalizedState, normalizedDistrict, normalizedCommodity);
  if (districtResult.ok && districtResult.records.length > 0) {
    const data: MandiPrices = { state: normalizedState, district: normalizedDistrict, commodity: normalizedCommodity, scope: "district", records: districtResult.records };
    await writeCache(districtKey, SOURCE, data, CACHE_TTL_SECONDS);
    return { ok: true, data, source: SOURCE, fetched_at: fetchedAt };
  }

  const stateKey = `mandi:${normalizedState.toLowerCase()}:${normalizedCommodity.toLowerCase()}:state`;
  const stateResult = await queryMandi(apiKey, normalizedState, null, normalizedCommodity);
  if (stateResult.ok && stateResult.records.length > 0) {
    const data: MandiPrices = { state: normalizedState, district: null, commodity: normalizedCommodity, scope: "state", records: stateResult.records };
    await writeCache(stateKey, SOURCE, data, CACHE_TTL_SECONDS);
    return { ok: true, data, source: SOURCE, fetched_at: fetchedAt };
  }

  const cached = await readCache<MandiPrices>(districtKey) ?? await readCache<MandiPrices>(stateKey);
  if (cached) return { ok: true, data: cached.data, source: `${SOURCE} (cached)`, fetched_at: cached.fetched_at, cached: true, cache_age_seconds: cached.age_seconds };

  const queryError = !districtResult.ok ? districtResult.error : !stateResult.ok ? stateResult.error : "No mandi records matched the requested location and commodity";
  return { ok: false, error: queryError, source: SOURCE, fetched_at: fetchedAt };
}
