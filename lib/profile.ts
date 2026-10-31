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
  };
}
