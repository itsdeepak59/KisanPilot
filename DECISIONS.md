# Decisions and API findings

Do not reverse or materially change a decision without adding a dated entry with the reason and impact.

## Locked decisions

- **D9 — 2026-10-31:** Add `ai` and `@ai-sdk/google` for the T6 streaming agent route, using the existing `GEMINI_API_KEY` server-side only. The route will expose only the repository's live data tools, cap the agent at six steps, and emit a typed trace for tool calls/results.
- **D10 — 2026-10-31:** The first alert heuristic sends a weather alert when a live two-day forecast reports daily rain of at least 20 mm or maximum wind of at least 40 km/h. The message includes the actual date, value, source time, and cached status when applicable; it is a transparent MVP heuristic, not agronomic advice.
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

### 2026-10-31 — data.gov.in mandi tool

- Endpoint: `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070`.
- Live fields: `state`, `district`, `market`, `commodity`, `variety`, `grade`, `arrival_date`, `min_price`, `max_price`, and `modal_price`.
- Result: a real Andhra Pradesh / Sri Sathya Sai / Maize district query returned three records, including arrival date `31/10/2026`.
- Finding: the API returned zero records when state and commodity filters were combined, even though the state-only response contained 298 records and 45 Maize records. The tool therefore queries district plus commodity first; on fallback it queries the state and filters the live records by commodity in typed code.
- Impact: T4 is not blocked. No-data remains explicit when neither live query nor timestamped cache has records.

### 2026-10-31 — SoilGrids tool integration

- Endpoint: `https://rest.isric.org/soilgrids/v2.0/properties/query` with `phh2o`, `soc`, `sand`, `silt`, and `clay` at `0-5cm`.
- Result: the provider returned HTTP 503 during the T8 live parser check and the real agent soil question. The agent returned HTTP 200 and surfaced the SoilGrids source and unavailable state without inventing soil values.
- Implementation: SoilGrids values are typed, pH and texture values are normalized to documented display units, successful responses are cached for 30 days, and cached responses are visibly marked with age.
- Impact: T8 is complete in code and integration; fresh SoilGrids availability remains an external service risk and must be rechecked before demo claims about soil facts.

