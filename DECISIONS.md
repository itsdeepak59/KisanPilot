# Decisions and API findings

Do not reverse or materially change a decision without adding a dated entry with the reason and impact.

## Locked decisions

- **D8 — 2026-10-31:** Use `@supabase/supabase-js` directly for the MVP's browser and server clients. The browser client uses the public URL and anon key for future client-safe reads; profile API routes use a separately constructed service-role client for controlled persistence. No auth is introduced, so the API validates the browser `device_id` and only upserts or reads that profile.
- **D1 — 2026-10-30:** Build Theme 2 agritech as a tool-calling decision agent. Live public data supports the required agent behavior and a reliable demo.
- **D2 — 2026-10-30:** Exclude browser agents for government portals, emergency logistics swarms, and hardware grid control. These paths depend on fragile or unavailable data sources.
- **D3 — 2026-10-30:** Use TypeScript and Next.js for both UI and agent work. No separate Python service.
- **D4 — 2026-10-30:** Use browser `device_id` instead of login for the MVP.
- **D5 — 2026-10-30:** Use browser speech APIs with typed input as the complete fallback.
- **D6 — 2026-10-30:** If the mandi source fails live validation, stop the dependent work and ask the human lead whether to repair it or pivot.
- **D7 — 2026-10-30:** This repository uses one active AI agent at a time. `PROJECT_STATE.md` records the active task and required handoff so a later agent resumes precisely.

## API findings

### 2026-10-30 15:57 UTC — Open-Meteo geocoding

- Endpoint: `https://geocoding-api.open-meteo.com/v1/search` with New Delhi, India.
- Result: success. The returned location included latitude, longitude, country, timezone, and administrative levels through `admin3`.
- Finding: the live response omits any administrative field that is unavailable, so later parsing must treat these fields as optional.
- Impact: does not block T3.

### 2026-10-30 15:57 UTC — Open-Meteo forecast

- Endpoint: `https://api.open-meteo.com/v1/forecast` with a seven-day New Delhi request.
- Result: success. The daily response returned `rain_sum`, `temperature_2m_min`, `temperature_2m_max`, `wind_speed_10m_max`, and `et0_fao_evapotranspiration` for seven dates.
- Finding: the requested ET0 field is available in the live daily response.
- Impact: does not block T3.

### 2026-10-30 15:57 UTC — ISRIC SoilGrids

- Endpoint: `https://rest.isric.org/soilgrids/v2.0/properties/query` for pH at 0–5 cm near New Delhi.
- Result: failed. Both attempts were aborted after the required eight-second timeout.
- Finding: the v2 service did not respond inside the product timeout during this check. The service documentation also describes v2 as beta and limits callers to five requests per minute.
- Impact: blocks a successful T1 validation of SoilGrids and must be resolved before dependent soil work starts.

### 2026-10-30 15:57 UTC — data.gov.in mandi API

- Endpoint prepared: `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070`.
- Result: not called because `DATA_GOV_IN_API_KEY` is absent from `.env.local`.
- Impact: blocks the credentialed portion of T1 and later mandi work.

### 2026-10-30 15:57 UTC — Google Gemini function calling

- Operation prepared: `generateContent` using a one-function declaration and an expected function call.
- Result: not called because `GEMINI_API_KEY` is absent from `.env.local`.
- Impact: blocks the credentialed portion of T1 and later agent work.

The smoke script is `scripts/smoke/live-apis.mjs`. It enforces an eight-second timeout, one retry with a 500 ms backoff, and does not print credential values.

### 2026-10-30 17:09 UTC — Credentialed live smoke follow-up

- Open-Meteo geocoding: success. The response included administrative fields through `admin3`.
- Open-Meteo forecast: success. The seven-day response included rainfall, minimum and maximum temperature, wind, and ET0.
- ISRIC SoilGrids: success. The pH query returned one layer within the script timeout.
- data.gov.in mandi API: success. The records array contained one record.
- Gemini function calling:
  - `gemini-2.5-flash` returned HTTP 404 because it is unavailable to new users.
  - `gemini-3.8-flash` exceeded both eight-second attempts, including with low thinking and a forced function call.
  - `gemini-3.5-flash-lite` returned the expected `smoke_echo` function call with a bounded output and forced-function configuration.
- Finding: keep `gemini-3.5-flash-lite` in the smoke test for its low-latency function-call check; select the production model separately for T6.
- Impact: T1 is complete. The four data-source checks and Gemini function-calling check all pass.
- References: [Gemini 3.5 Flash-Lite model](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite) and [Gemini function-calling guide](https://ai.google.dev/gemini-api/docs/generate-content/function-calling).

