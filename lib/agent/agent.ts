import { jsonSchema, stepCountIs, streamText, tool } from "ai";
import { createGoogle } from "@ai-sdk/google";

import { geocodeLocation } from "@/lib/agent/tools/geocode";
import { getMandiPrices } from "@/lib/agent/tools/mandi";
import { getWeatherForecast } from "@/lib/agent/tools/weather";
import { getSoilProfile } from "@/lib/agent/tools/soil";
import { getOfficialAdvisory } from "@/lib/agent/tools/advisory";
import type { ConversationMessage } from "@/lib/conversation";
import { getDecisionSignals } from "@/lib/decision/service";

type GeocodeInput = { query: string };
type WeatherInput = { latitude: number; longitude: number; days?: number };
type MandiInput = { state: string; district: string; commodity: string };
type SoilInput = { latitude: number; longitude: number };
type AdvisoryInput = { topic: string };
type DecisionInput = { latitude: number; longitude: number; state: string; district: string; commodity: string };

const geocodeInput = jsonSchema<GeocodeInput>({
  type: "object",
  properties: { query: { type: "string", description: "Village, town, district, or city to locate" } },
  required: ["query"],
  additionalProperties: false,
});

const weatherInput = jsonSchema<WeatherInput>({
  type: "object",
  properties: {
    latitude: { type: "number", description: "Latitude from geocoding" },
    longitude: { type: "number", description: "Longitude from geocoding" },
    days: { type: "number", description: "Forecast days, from 1 to 7" },
  },
  required: ["latitude", "longitude"],
  additionalProperties: false,
});

const mandiInput = jsonSchema<MandiInput>({
  type: "object",
  properties: {
    state: { type: "string", description: "Indian state" },
    district: { type: "string", description: "Indian district" },
    commodity: { type: "string", description: "Commodity name" },
  },
  required: ["state", "district", "commodity"],
  additionalProperties: false,
});

const soilInput = jsonSchema<SoilInput>({
  type: "object",
  properties: {
    latitude: { type: "number", description: "Latitude from geocoding" },
    longitude: { type: "number", description: "Longitude from geocoding" },
  },
  required: ["latitude", "longitude"],
  additionalProperties: false,
});

const advisoryInput = jsonSchema<AdvisoryInput>({
  type: "object",
  properties: { topic: { type: "string", description: "Crop, season, or farm topic for an official advisory" } },
  required: ["topic"],
  additionalProperties: false,
});

const decisionInput = jsonSchema<DecisionInput>({
  type: "object",
  properties: {
    latitude: { type: "number" }, longitude: { type: "number" }, state: { type: "string" }, district: { type: "string" }, commodity: { type: "string" },
  },
  required: ["latitude", "longitude", "state", "district", "commodity"],
  additionalProperties: false,
});

export const farmTools = {
  geocode_location: tool({
    description: "Find a real location and its administrative details using Open-Meteo.",
    inputSchema: geocodeInput,
    execute: async ({ query }: GeocodeInput) => geocodeLocation(query),
  }),
  get_weather_forecast: tool({
    description: "Get a real forecast with rain, temperature, wind, and ET0 from Open-Meteo.",
    inputSchema: weatherInput,
    execute: async ({ latitude, longitude, days }: WeatherInput) => getWeatherForecast(latitude, longitude, days),
  }),
  get_mandi_prices: tool({
    description: "Get real mandi prices with arrival dates from data.gov.in.",
    inputSchema: mandiInput,
    execute: async ({ state, district, commodity }: MandiInput) => getMandiPrices(state, district, commodity),
  }),
  get_soil_profile: tool({
    description: "Get real soil pH, organic carbon, sand, silt, and clay from SoilGrids for the 0-5cm depth.",
    inputSchema: soilInput,
    execute: async ({ latitude, longitude }: SoilInput) => getSoilProfile(latitude, longitude),
  }),
  get_official_advisory: tool({
    description: "Retrieve a live official ICAR farmer advisory page. Use it for advisory guidance and cite its returned URL and timestamp.",
    inputSchema: advisoryInput,
    execute: async ({ topic }: AdvisoryInput) => getOfficialAdvisory(topic),
  }),
  get_decision_signals: tool({
    description: "Compute transparent harvest-weather, seven-day water-balance, and mandi sell/hold signals from live inputs. Show each returned rule and sample size; never present these heuristics as agronomic advice.",
    inputSchema: decisionInput,
    execute: async ({ latitude, longitude, state, district, commodity }: DecisionInput) => getDecisionSignals(latitude, longitude, state, district, commodity),
  }),
};

export function runFarmAgent(question: string, language: "en" | "hi" | "te", context: string, history: ConversationMessage[] = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  return streamText({
    model: createGoogle({ apiKey })("gemini-3.5-flash-lite"),
    system: `You are KisanPilot, a cautious farm decision agent. Answer in ${language === "hi" ? "Hindi" : language === "te" ? "Telugu" : "English"}. ${context}

Call live tools for every weather, location, soil, mandi, price, date, advisory, or other factual claim. Use get_official_advisory for crop or seasonal guidance and cite its returned URL and fetched_at timestamp. Never invent values, dates, sources, or API results. If location or crop is missing, ask one concise clarifying question. Continue with available data when a tool fails and clearly name missing data. Never provide pesticide or chemical dosage; direct the farmer to a local KVK or agriculture officer instead. End a useful answer with two to four concrete actions that include dates only when those dates come from tool data.`,
    messages: [...history, { role: "user" as const, content: question }],
    tools: farmTools,
    stopWhen: stepCountIs(6),
    maxRetries: 1,
  });
}
