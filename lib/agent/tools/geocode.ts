import { readCache, writeCache } from "@/lib/cache";
import { fetchJson } from "@/lib/agent/tools/http";
import type { ToolResult } from "@/lib/agent/tools/types";

const SOURCE = "Open-Meteo Geocoding";
const CACHE_TTL_SECONDS = 86_400;

type GeocodeResponse = {
  results?: Array<{
    name?: string;
    latitude?: number;
    longitude?: number;
    admin1?: string;
    admin2?: string;
    country?: string;
  }>;
};

export type GeocodedLocation = {
  name: string;
  latitude: number;
  longitude: number;
  state: string | null;
  district: string | null;
  country: string | null;
};

export async function geocodeLocation(query: string): Promise<ToolResult<GeocodedLocation>> {
  const normalizedQuery = query.trim();
  const fetchedAt = new Date().toISOString();
  if (!normalizedQuery) return { ok: false, error: "Location is required", source: SOURCE, fetched_at: fetchedAt };
  if (normalizedQuery.length > 200) return { ok: false, error: "Location is too long", source: SOURCE, fetched_at: fetchedAt };

  const cacheKey = `geocode:${normalizedQuery.toLowerCase()}`;
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.search = new URLSearchParams({ name: normalizedQuery, count: "1", language: "en", format: "json" }).toString();
  const live = await fetchJson<GeocodeResponse>(url.toString());

  if (live.ok) {
    const place = live.data.results?.[0];
    if (!place || typeof place.latitude !== "number" || typeof place.longitude !== "number" || !place.name) {
      return { ok: false, error: "Location was not found", source: SOURCE, fetched_at: fetchedAt };
    }
    const data: GeocodedLocation = {
      name: place.name,
      latitude: place.latitude,
      longitude: place.longitude,
      state: place.admin1 ?? null,
      district: place.admin2 ?? null,
      country: place.country ?? null,
    };
    await writeCache(cacheKey, SOURCE, data, CACHE_TTL_SECONDS);
    return { ok: true, data, source: SOURCE, fetched_at: fetchedAt };
  }

  const cached = await readCache<GeocodedLocation>(cacheKey);
  if (cached) return { ok: true, data: cached.data, source: `${SOURCE} (cached)`, fetched_at: cached.fetched_at, cached: true, cache_age_seconds: cached.age_seconds };
  return { ok: false, error: `Live geocoding unavailable: ${live.error}`, source: SOURCE, fetched_at: fetchedAt };
}
