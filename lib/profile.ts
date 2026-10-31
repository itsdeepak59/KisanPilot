export const PROFILE_LANGUAGES = ["en", "hi", "te"] as const;

export type ProfileLanguage = (typeof PROFILE_LANGUAGES)[number];

export type FarmerProfile = {
  id: string;
  device_id: string;
  language: ProfileLanguage;
  lat: number | null;
  lon: number | null;
  place_name: string | null;
  state: string | null;
  district: string | null;
  crops: string[];
  telegram_chat_id: string | null;
  alert_rain_mm: number;
  alert_wind_kmh: number;
  alert_price_drop_pct: number | null;
  created_at: string;
};

export type FarmerProfileInput = {
  device_id: string;
  language: ProfileLanguage;
  lat?: number | null;
  lon?: number | null;
  place_name?: string | null;
  state?: string | null;
  district?: string | null;
  crops?: string[];
  alert_rain_mm?: number;
  alert_wind_kmh?: number;
  alert_price_drop_pct?: number | null;
};

export function isProfileLanguage(value: unknown): value is ProfileLanguage {
  return typeof value === "string" && PROFILE_LANGUAGES.includes(value as ProfileLanguage);
}

export function normalizeProfileInput(value: unknown): FarmerProfileInput | null {
  if (!value || typeof value !== "object") return null;

  const input = value as Record<string, unknown>;
  const deviceId = typeof input.device_id === "string" ? input.device_id.trim() : "";
  if (!deviceId || deviceId.length > 128 || !isProfileLanguage(input.language)) return null;

  const crops = Array.isArray(input.crops)
    ? input.crops.filter((crop): crop is string => typeof crop === "string").map((crop) => crop.trim()).filter(Boolean).slice(0, 12)
    : [];

  const numberOrNull = (candidate: unknown) => (typeof candidate === "number" && Number.isFinite(candidate) ? candidate : null);
  const threshold = (candidate: unknown, fallback: number, maximum: number) => {
    const value = numberOrNull(candidate);
    return value !== null && value >= 0 && value <= maximum ? value : fallback;
  };
  const stringOrNull = (candidate: unknown, maxLength: number) => {
    if (candidate === null || candidate === undefined) return null;
    if (typeof candidate !== "string") return null;
    const normalized = candidate.trim();
    return normalized ? normalized.slice(0, maxLength) : null;
  };

  return {
    device_id: deviceId,
    language: input.language,
    lat: numberOrNull(input.lat),
    lon: numberOrNull(input.lon),
    place_name: stringOrNull(input.place_name, 200),
    state: stringOrNull(input.state, 120),
    district: stringOrNull(input.district, 120),
    crops,
    alert_rain_mm: threshold(input.alert_rain_mm, 20, 500),
    alert_wind_kmh: threshold(input.alert_wind_kmh, 40, 300),
    alert_price_drop_pct: threshold(input.alert_price_drop_pct, 0, 100) || null,
  };
}
