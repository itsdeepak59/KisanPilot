import { geocodeLocation } from "../../lib/agent/tools/geocode";
import { getMandiPrices } from "../../lib/agent/tools/mandi";
import { getSoilProfile } from "../../lib/agent/tools/soil";
import { getWeatherForecast } from "../../lib/agent/tools/weather";

type WarmInput = {
  place: string;
  state: string;
  district: string;
  crops: string[];
};

type WarmResult = {
  tool: string;
  ok: boolean;
  source: string;
  fetched_at: string;
  error?: string;
  cached?: boolean;
  record_count?: number;
};

function usage(): never {
  console.error("Usage: npm run warm -- --place <place> --state <state> --district <district> --crop <crop> [--crop <crop>]");
  process.exit(2);
}

function readArguments(args: string[]): WarmInput {
  const values = new Map<string, string[]>();
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (!argument.startsWith("--")) usage();
    const key = argument.slice(2);
    const value = args[index + 1];
    if (!value || value.startsWith("--")) usage();
    values.set(key, [...(values.get(key) ?? []), value.trim()]);
    index += 1;
  }

  const [place] = values.get("place") ?? [];
  const [state] = values.get("state") ?? [];
  const [district] = values.get("district") ?? [];
  const crops = values.get("crop")?.filter(Boolean) ?? [];
  if (!place || !state || !district || crops.length === 0) usage();
  if (place.length > 200 || state.length > 120 || district.length > 120 || crops.some((crop) => crop.length > 120)) usage();
  return { place, state, district, crops };
}

function summarize(tool: string, result: { ok: boolean; source: string; fetched_at: string; error?: string; cached?: boolean }, recordCount?: number): WarmResult {
  return {
    tool,
    ok: result.ok,
    source: result.source,
    fetched_at: result.fetched_at,
    ...(result.ok ? {} : { error: result.error ?? "Unknown error" }),
    ...(result.cached ? { cached: true } : {}),
    ...(typeof recordCount === "number" ? { record_count: recordCount } : {}),
  };
}

const input = readArguments(process.argv.slice(2));
const geocode = await geocodeLocation(input.place);
const results: WarmResult[] = [summarize("geocode", geocode)];

if (geocode.ok) {
  const [weather, soil, ...mandiResults] = await Promise.all([
    getWeatherForecast(geocode.data.latitude, geocode.data.longitude, 7),
    getSoilProfile(geocode.data.latitude, geocode.data.longitude),
    ...input.crops.map((crop) => getMandiPrices(input.state, input.district, crop)),
  ]);
  results.push(summarize("weather", weather), summarize("soil", soil));
  mandiResults.forEach((mandi, index) => results.push(summarize(`mandi:${input.crops[index]}`, mandi, mandi.ok ? mandi.data.records.length : undefined)));
}

console.log(JSON.stringify({ input: { place: input.place, state: input.state, district: input.district, crops: input.crops }, results }, null, 2));

if (results.some((result) => !result.ok)) process.exitCode = 1;
