const TIMEOUT_MS = 8_000;
const RETRY_DELAY_MS = 500;

async function fetchJson(url, init = {}) {
  let lastError;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(payload)}`);
      }

      return payload;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
}

function result(name, details) {
  return { name, fetched_at: new Date().toISOString(), ...details };
}

async function checkOpenMeteoGeocoding() {
  const url =
    "https://geocoding-api.open-meteo.com/v1/search?name=New%20Delhi&count=1&language=en&format=json";
  const payload = await fetchJson(url);
  const match = payload.results?.[0];

  if (!match?.latitude || !match?.longitude) {
    throw new Error("Response did not contain a geocoded location.");
  }

  return result("open-meteo-geocoding", {
    ok: true,
    source: "Open-Meteo Geocoding API",
    response_shape: Object.keys(match).sort(),
  });
}

async function checkOpenMeteoForecast() {
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&daily=rain_sum,temperature_2m_min,temperature_2m_max,wind_speed_10m_max,et0_fao_evapotranspiration&forecast_days=7&timezone=Asia%2FKolkata";
  const payload = await fetchJson(url);
  const daily = payload.daily;

  if (!daily?.time?.length || !daily.et0_fao_evapotranspiration?.length) {
    throw new Error("Response did not contain the requested daily forecast fields.");
  }

  return result("open-meteo-forecast", {
    ok: true,
    source: "Open-Meteo Forecast API",
    forecast_days: daily.time.length,
    response_shape: Object.keys(daily).sort(),
  });
}

async function checkSoilGrids() {
  const url =
    "https://rest.isric.org/soilgrids/v2.0/properties/query?lat=28.6139&lon=77.2090&property=phh2o&depth=0-5cm&value=mean";
  const payload = await fetchJson(url);
  const layers = payload.properties?.layers;

  if (!Array.isArray(layers) || layers.length === 0) {
    throw new Error("Response did not contain SoilGrids property layers.");
  }

  return result("soilgrids", {
    ok: true,
    source: "ISRIC SoilGrids REST API",
    layer_count: layers.length,
    response_shape: Object.keys(payload).sort(),
  });
}

async function checkDataGov() {
  const key = process.env.DATA_GOV_IN_API_KEY;

  if (!key) {
    return result("data-gov-in-mandi", {
      ok: false,
      source: "data.gov.in Mandi API",
      error: "DATA_GOV_IN_API_KEY is not set.",
    });
  }

  const url = new URL(
    "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
  );
  url.searchParams.set("api-key", key);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const payload = await fetchJson(url);

  if (!Array.isArray(payload.records)) {
    throw new Error("Response did not contain a records array.");
  }

  return result("data-gov-in-mandi", {
    ok: true,
    source: "data.gov.in Mandi API",
    record_count: payload.records.length,
    response_shape: Object.keys(payload).sort(),
  });
}

async function checkGeminiToolCalling() {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    return result("gemini-tool-calling", {
      ok: false,
      source: "Google Gemini API",
      error: "GEMINI_API_KEY is not set.",
    });
  }

  const model = "gemini-2.5-flash";
  const url = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
  );
  url.searchParams.set("key", key);
  const payload = await fetchJson(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: "Call smoke_echo with city New Delhi." }] }],
      tools: [
        {
          functionDeclarations: [
            {
              name: "smoke_echo",
              description: "Echoes a city for smoke-test validation.",
              parameters: {
                type: "OBJECT",
                properties: { city: { type: "STRING" } },
                required: ["city"],
              },
            },
          ],
        },
      ],
    }),
  });
  const parts = payload.candidates?.[0]?.content?.parts ?? [];
  const functionCall = parts.find((part) => part.functionCall)?.functionCall;

  if (functionCall?.name !== "smoke_echo") {
    throw new Error("Gemini response did not contain the expected function call.");
  }

  return result("gemini-tool-calling", {
    ok: true,
    source: "Google Gemini API",
    model,
    function_name: functionCall.name,
  });
}

const checks = [
  ["open-meteo-geocoding", checkOpenMeteoGeocoding],
  ["open-meteo-forecast", checkOpenMeteoForecast],
  ["soilgrids", checkSoilGrids],
  ["data-gov-in-mandi", checkDataGov],
  ["gemini-tool-calling", checkGeminiToolCalling],
];

const outcomes = await Promise.all(
  checks.map(async ([name, check]) => {
    try {
      return await check();
    } catch (error) {
      return result(name, {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  })
);

console.log(JSON.stringify(outcomes, null, 2));

if (outcomes.some((outcome) => !outcome.ok)) {
  process.exitCode = 1;
}

