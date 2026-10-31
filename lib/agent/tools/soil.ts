import { readCache, writeCache } from "@/lib/cache";
import { fetchJson } from "@/lib/agent/tools/http";
import type { ToolResult } from "@/lib/agent/tools/types";

const SOURCE = "ISRIC SoilGrids";
const CACHE_TTL_SECONDS = 30 * 24 * 60 * 60;
const DEPTH_LABEL = "0-5cm";

type SoilGridsResponse = {
  properties?: {
    layers?: Array<{
      name?: string;
      depths?: Array<{ label?: string; values?: { mean?: number | null } }>;
    }>;
  };
};

export type SoilProfile = {
  latitude: number;
  longitude: number;
  depth: string;
  ph: number | null;
  organic_carbon_dg_kg: number | null;
  sand_percent: number | null;
  silt_percent: number | null;
  clay_percent: number | null;
};

function layerMean(response: SoilGridsResponse, name: string): number | null | undefined {
  const layer = response.properties?.layers?.find((candidate) => candidate.name === name);
  const depth = layer?.depths?.find((candidate) => candidate.label === DEPTH_LABEL);
  return depth?.values?.mean;
}

function scaled(value: number | null | undefined, divisor: number): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value / divisor : null;
}

export async function getSoilProfile(latitude: number, longitude: number): Promise<ToolResult<SoilProfile>> {
  const fetchedAt = new Date().toISOString();
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return { ok: false, error: "Valid coordinates are required", source: SOURCE, fetched_at: fetchedAt };

  const cacheKey = `soil:${latitude.toFixed(4)}:${longitude.toFixed(4)}`;
  const url = new URL("https://rest.isric.org/soilgrids/v2.0/properties/query");
  url.search = new URLSearchParams([
    ["lon", String(longitude)],
    ["lat", String(latitude)],
    ["property", "phh2o"],
    ["property", "soc"],
    ["property", "sand"],
    ["property", "silt"],
    ["property", "clay"],
    ["depth", DEPTH_LABEL],
    ["value", "mean"],
  ]).toString();
  const live = await fetchJson<SoilGridsResponse>(url.toString());

  if (live.ok) {
    const data: SoilProfile = {
      latitude,
      longitude,
      depth: DEPTH_LABEL,
      ph: scaled(layerMean(live.data, "phh2o"), 10),
      organic_carbon_dg_kg: layerMean(live.data, "soc") ?? null,
      sand_percent: scaled(layerMean(live.data, "sand"), 10),
      silt_percent: scaled(layerMean(live.data, "silt"), 10),
      clay_percent: scaled(layerMean(live.data, "clay"), 10),
    };
    if (data.ph === null && data.organic_carbon_dg_kg === null && data.sand_percent === null && data.silt_percent === null && data.clay_percent === null) {
      return { ok: false, error: "SoilGrids returned no values for the requested depth", source: SOURCE, fetched_at: fetchedAt };
    }
    await writeCache(cacheKey, SOURCE, data, CACHE_TTL_SECONDS);
    return { ok: true, data, source: SOURCE, fetched_at: fetchedAt };
  }

  const cached = await readCache<SoilProfile>(cacheKey);
  if (cached) return { ok: true, data: cached.data, source: `${SOURCE} (cached)`, fetched_at: cached.fetched_at, cached: true, cache_age_seconds: cached.age_seconds };
  return { ok: false, error: `SoilGrids unavailable: ${live.error}`, source: SOURCE, fetched_at: fetchedAt };
}
