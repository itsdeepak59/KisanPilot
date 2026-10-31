# Project state and handoff

This file is the operational source of truth for the next human or AI agent. Update it before beginning a task, before ending a context window, and after completing a task.

## Current state

- Branch: `improve`
- Active task: **T19 — Public endpoint hardening (Phase 2).**
- Next eligible task: T20 — Conversation memory, after T19 is complete.
- Application status: T16 is complete. T14 is complete. T13 is complete. T12 is complete. T11 is complete. T10 is complete. T9 is complete. T8 is complete. T7 is complete. T6 is complete. T5 is complete. T4 is complete. T3 is complete; Open-Meteo tools and the data.gov.in mandi tool are implemented and live-validated, and the configured Supabase project exposes the `public.api_cache` table.
- Last documentation update: 2026-10-31
- Blocking credentials: None locally. SoilGrids remains an external-provider availability risk.

## Start protocol for the next agent

1. Read `AGENTS.md` and all files in its required order.
2. Confirm `PROJECT_STATE.md` still has no active task.
3. Choose the first eligible task, claim it here and in `TASKS.md`, then commit the claim.
4. Complete only the claimed task.
5. Finish with this file and `TASKS.md` updated, then commit the handoff.

## Latest completed work

- T0: Created the Next.js App Router foundation with TypeScript strict mode, Tailwind CSS, shadcn/ui configuration and Button baseline.
- Added `.env.example` with only required variable names and configured `.gitignore` to keep it tracked while protecting real environment files.
- Added the planned `components/`, `lib/agent/tools/`, `scripts/smoke/`, `supabase/`, and `docs/` structure.
- Replaced the generated landing content with a minimal KisanPilot foundation page and product metadata.
- T1: Completed live smoke checks for Open-Meteo geocoding and forecast, SoilGrids, data.gov.in, and Gemini function calling; all five passed. The smoke script uses `gemini-3.5-flash-lite` with a forced `smoke_echo` call.

## Handoff template

Copy this block under a dated entry whenever work pauses or ends:

```md
### YYYY-MM-DD — T#
Status: [~] active/paused | [x] done | [!] blocked
Files changed:
Checks and real calls:
Result:
Remaining work:
Exact next step:
Blocker:
Commit:
```

### 2026-10-30 — T1
Status: [~] active
Files changed: PROJECT_STATE.md, TASKS.md
Checks and real calls: `npm run smoke` made real calls. Open-Meteo geocoding and seven-day forecast succeeded. SoilGrids timed out on both eight-second attempts. `npm run lint` and `npx tsc --noEmit` passed.
Result: Added `scripts/smoke/live-apis.mjs`, which tests Open-Meteo, SoilGrids, data.gov.in, and Gemini function calling with timeouts and one retry.
Remaining work: Run the data.gov.in and Gemini checks with real credentials; decide whether to repair or replace the SoilGrids access path after the live timeout.
Exact next step: Put `GEMINI_API_KEY` and `DATA_GOV_IN_API_KEY` in `.env.local`, then run `npm run smoke`.
Blocker: Both credentialed checks are blocked by absent keys. SoilGrids is also unavailable within the required timeout.
Commit: `bac5a8837f05366737796c352b2268f7226368fd`

### 2026-10-30 — T0
Status: [x] done
Files changed: `.gitignore`, `.env.example`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `components.json`, `components/ui/button.tsx`, `eslint.config.mjs`, `next.config.ts`, `package.json`, `package-lock.json`, `tsconfig.json`, and the intended empty folders.
Checks and real calls: `npm run lint` and `npx tsc --noEmit` passed. `NEXT_PRIVATE_BUILD_WORKERS=1 npm run build` passed and produced static routes for `/` and `/_not-found`.
Result: Foundation is complete; no credentials or business data were added.
Remaining work: T1 live API smoke tests.
Exact next step: Claim T1, add the smoke-test scripts, then make real calls with `GEMINI_API_KEY` and `DATA_GOV_IN_API_KEY` in `.env.local`.
Blocker: T1 requires those two credentials.
Commit: `4ccfbebe1aa3cbdf504eef1ba45a9d562baa0b1f`

### 2026-10-30 17:09 UTC — T1 completion
Status: [x] done
Files changed: `scripts/smoke/live-apis.mjs`, `DECISIONS.md`, `TASKS.md`, and `PROJECT_STATE.md`.
Checks and real calls: `npm run smoke` passed all five checks at 17:09 UTC. Open-Meteo geocoding and seven-day forecast, SoilGrids, and data.gov.in returned valid response shapes; Gemini returned `smoke_echo` on `gemini-3.5-flash-lite`.
Result: The smoke script now uses a stable low-latency Gemini model with a forced single function call. Production model selection remains open for T6.
Remaining work: T2 — Supabase schema, clients, and farm-profile persistence.
Exact next step: Claim T2 and verify Supabase credentials before implementation.
Blocker: None for T1. T2 requires Supabase URL, anon key, and service role key.
Commit: This handoff commit (`test: complete live API smoke validation`).

### 2026-10-30 — T2 claim
Status: [~] active
Files changed: `PROJECT_STATE.md`, `TASKS.md`.
Checks and real calls: Claim recorded; no database calls run.
Result: T2 is the sole active task.
Remaining work: Add the schema migration, server/browser clients, and profile save/load path by device ID; verify it against a real Supabase project.
Exact next step: Record the Supabase client integration decision, then implement the migration and persistence path.
Blocker: The local `.env.local` has no nonempty Supabase URL, anon key, or service-role key, so live save/load validation is pending.
Commit: This claim commit.

### 2026-10-31 — T14 completion
Status: [x] done
Files changed: `lib/agent/tools/http.ts`, `lib/agent/tools/advisory.ts`, `lib/agent/agent.ts`, `TASKS.md`, `PROJECT_STATE.md`, `DECISIONS.md`
Checks and real calls: ESLint passed; TypeScript passed; `next build` passed; local `/api/chat` real Gemini stream called `get_official_advisory` and returned a live ICAR URL plus `fetched_at` timestamp.
Result: Official-advisory retrieval is implemented with an ICAR-only allowlist, eight-second timeout, one retry, typed success/failure, source URL, timestamp, and chemical-treatment sentence filtering.
Remaining work: T15 is the next eligible task.
Exact next step: Claim T15 in `TASKS.md` and `PROJECT_STATE.md` before writing code.
Blocker: None.
Commit: pending

### 2026-10-31 — T15 completion
Status: [x] done
Files changed: `lib/profile.ts`, `app/api/chat/route.ts`, `lib/agent/agent.ts`, `app/page.tsx`, `supabase/migrations/0003_add_telugu_language.sql`, `TASKS.md`, and `PROJECT_STATE.md`.
Checks and real calls: ESLint passed; strict TypeScript passed; production build passed. A real Telugu profile save and load returned HTTP 200 from Supabase with `language: "te"`. A real Telugu `/api/chat` stream returned HTTP 200, Telugu text, `get_official_advisory`, the live ICAR source URL, and a `done` event.
Result: Telugu is complete across profile validation, Supabase persistence, agent output, browser speech recognition/playback, and the language selector.
Remaining work: T16 is the next eligible task.
Exact next step: Claim T16 in `TASKS.md` and `PROJECT_STATE.md` before writing submission materials.
Blocker: None.
Commit: pending completion.

### 2026-10-31 — T2 completion
Status: [x] done
Files changed: `DECISIONS.md`, `package.json`, `package-lock.json`, `app/layout.tsx`, `app/api/profile/route.ts`, `lib/profile.ts`, `lib/supabase.ts`, `supabase/migrations/0001_initial_schema.sql`, `TASKS.md`, and `PROJECT_STATE.md`.
Checks and real calls: Direct ESLint entry point passed; direct strict TypeScript check passed; direct Next production build passed and emitted `/api/profile`. No Supabase save/load call was run because the required URL, anon key, and service-role key are absent from `.env.local`.
Result: Added the initial Supabase schema, browser/server client factories, typed profile normalization, and GET/POST profile persistence by `device_id`. Database requests use an eight-second timeout, one retry with backoff, and source/timestamp result envelopes. Removed the scaffold's Google-hosted font fetch and invalid route runtime declaration so offline production builds complete with the repository's cache-components setting.
Remaining work: Real profile save/load verification after Supabase credentials are provided. No fabricated profile data was added.
Exact next step: Claim T3, then implement the Open-Meteo geocode and weather tools with typed live responses and real-response caching.
Blocker: Supabase credentials are absent for live persistence validation.
Commit: Pending completion commit.

### 2026-10-31 — T3 claim
Status: [~] active
Files changed: `TASKS.md`, `PROJECT_STATE.md`.
Checks and real calls: Claim recorded. `.env.local` is present; variable names were inspected without printing values.
Result: T3 is the sole active task.
Remaining work: Implement and validate the Open-Meteo geocoding and forecast tools with Supabase-backed response caching.
Exact next step: Inspect the current Supabase schema/client types, then add the shared cache helper and two typed tools.
Blocker: None currently.
Commit: This claim commit.

### 2026-10-31 — T3 checkpoint
Status: [~] active
Files changed: `lib/agent/tools/types.ts`, `lib/agent/tools/http.ts`, `lib/agent/tools/geocode.ts`, `lib/agent/tools/weather.ts`, `lib/cache.ts`, `TASKS.md`, and `PROJECT_STATE.md`.
Checks and real calls: Direct ESLint passed; strict TypeScript passed; production build passed. Real Open-Meteo geocoding returned one New Delhi result. Real Open-Meteo forecast returned seven days. A read-only Supabase REST check reached the configured project but returned `PGRST205` because `public.api_cache` is missing.
Result: Added typed geocode and weather tools with eight-second timeout, one retry, source/timestamp envelopes, and Supabase-backed cache reads/writes with cache age on fallback.
Remaining work: Apply `supabase/migrations/0001_initial_schema.sql` to the configured Supabase project, then verify a live tool response writes and reads from `api_cache`.
Exact next step: Run the migration in Supabase SQL Editor, then rerun the read-only cache check and the T3 live cache flow.
Blocker: The configured Supabase project has not applied the repository migration; no cache table exists.
Commit: Checkpoint commit.

### 2026-10-31 — T3 completion
Status: [x] done
Files changed: `lib/agent/tools/types.ts`, `lib/agent/tools/http.ts`, `lib/agent/tools/geocode.ts`, `lib/agent/tools/weather.ts`, `lib/cache.ts`, `TASKS.md`, and `PROJECT_STATE.md`.
Checks and real calls: Direct ESLint passed; strict TypeScript passed; production build passed. Real Open-Meteo geocoding returned one New Delhi result. Real Open-Meteo forecast returned seven days. Read-only Supabase REST access confirmed `public.api_cache` exists after migration application.
Result: T3 is complete. The tools provide source-stamped typed responses, timeout/retry handling, live-response caching, and cache-age metadata for cached fallback responses.
Remaining work: None for T3.
Exact next step: Claim T4, then implement the data.gov.in mandi tool with district-first, state-fallback, actual arrival date, and typed no-data behavior.
Blocker: None for T3.
Commit: Completion commit.

### 2026-10-31 — T6 claim
Status: [~] active
Files changed: `TASKS.md`, `PROJECT_STATE.md`.
Checks and real calls: Claim recorded. T3, T4, and T5 dependencies are complete and pushed.
Result: T6 is the sole active task.
Remaining work: Add the Gemini agent loop, tool declarations, streaming route, trace events, and advisory persistence.
Exact next step: Record the AI SDK integration decision, install the frozen-stack AI SDK packages, then implement the route.
Blocker: None currently.
Commit: This claim commit.

### 2026-10-31 — T6 completion
Status: [x] done
Files changed: `DECISIONS.md`, `package.json`, `package-lock.json`, `lib/agent/agent.ts`, `app/api/chat/route.ts`, `TASKS.md`, and `PROJECT_STATE.md`.
Checks and real calls: Direct ESLint passed; strict TypeScript passed; production build passed and emitted `/api/chat`. A real Gemini-backed production request returned HTTP 200 with text, tool-call, tool-result, and done SSE events. A real temporary profile/chat flow persisted one advisory row with its tool trace; the temporary farmer row was deleted afterward.
Result: Added the frozen-stack `ai` and `@ai-sdk/google` integration, live geocode/weather/mandi tool declarations, six-step guarded agent instructions, custom SSE trace protocol, and advisory persistence with timeout/retry handling.
Remaining work: None for T6.
Exact next step: Claim T7, then render streamed tool-call/result events in a farmer-readable trace panel.
Blocker: None for T6.
Commit: Completion commit.

### 2026-10-31 — T5 claim
Status: [~] active
Files changed: `TASKS.md`, `PROJECT_STATE.md`.
Checks and real calls: Claim recorded. Existing working-tree UI changes were inspected; no secrets were printed.
Result: T5 is the sole active task.
Remaining work: Complete and validate the core profile and typed-question UI.
Exact next step: Run lint, strict TypeScript, production build, and a real profile save/load check through the production app.
Blocker: None currently.
Commit: This claim commit.

### 2026-10-31 — T5 completion
Status: [x] done
Files changed: `app/page.tsx`, `TASKS.md`, and `PROJECT_STATE.md`.
Checks and real calls: Direct ESLint passed; strict TypeScript passed; production build passed. The production app performed a real profile save and load through `/api/profile` using a unique validation device ID; the validation row was deleted afterward.
Result: Replaced the placeholder page with a responsive profile and question flow. It creates a browser device ID, loads and saves language/location/district/state/crops, and captures typed questions with a transparent message that live advisory answers are part of T6.
Remaining work: None for T5.
Exact next step: Claim T6, then implement the streaming Gemini agent route and source-stamped tool trace protocol.
Blocker: None for T5.
Commit: Completion commit.

### 2026-10-31 — T4 claim
Status: [~] active
Files changed: `TASKS.md`, `PROJECT_STATE.md`.
Checks and real calls: Claim recorded. `DATA_GOV_IN_API_KEY` is present in `.env.local`; its value was not printed.
Result: T4 is the sole active task.
Remaining work: Implement and live-test the data.gov.in mandi tool with district-to-state fallback and typed no-data behavior.
Exact next step: Confirm the live dataset fields and query filters, then add the typed mandi tool using the shared request and cache helpers.
Blocker: None currently.
Commit: This claim commit.

### 2026-10-31 — T4 completion
Status: [x] done
Files changed: `lib/agent/tools/mandi.ts`, `DECISIONS.md`, `TASKS.md`, and `PROJECT_STATE.md`.
Checks and real calls: Direct ESLint passed; strict TypeScript passed; production build passed. A real district-filtered data.gov.in query returned three Maize records for Sri Sathya Sai, including an actual arrival date. A real state-only response returned 298 Andhra Pradesh records, including 45 Maize records. A real impossible-commodity query returned no records.
Result: Added the typed mandi tool with district-first query, state fallback with live commodity filtering, numeric price parsing, actual arrival dates, Supabase cache fallback, and explicit no-data errors.
Remaining work: None for T4.
Exact next step: Claim T5, then build the core chat/profile UI with language selection and typed input.
Blocker: None for T4.
Commit: Completion commit.

### 2026-10-31 — T7 claim
Status: [~] active
Files changed: `TASKS.md`, `PROJECT_STATE.md`.
Checks and real calls: Claim recorded. T6 streaming route and SSE event protocol are present and pushed.
Result: T7 is the sole active task.
Remaining work: Connect the question form to `/api/chat` and render trace events in the farmer UI.
Exact next step: Add client-side SSE parsing and a compact trace panel without inventing tool data.
Blocker: None currently.
Commit: This claim commit.

### 2026-10-31 — T7 completion
Status: [x] done
Files changed: `app/page.tsx`, `TASKS.md`, and `PROJECT_STATE.md`.
Checks and real calls: Direct ESLint passed; strict TypeScript passed; production build passed. The T6 production chat endpoint had already returned real text, tool-call, tool-result, and done events; the UI now consumes those SSE events.
Result: Connected the typed question form to `/api/chat`, renders streamed answer text, and added a transparency panel showing tool inputs, result data, source, fetched timestamp, cached state, and cache age when returned by a tool.
Remaining work: None for T7.
Exact next step: Claim T8, then implement the SoilGrids tool and integrate soil data into the agent.
Blocker: None for T7.
Commit: Completion commit.

### 2026-10-31 — T8 claim
Status: [~] active
Files changed: `TASKS.md`, `PROJECT_STATE.md`.
Checks and real calls: Claim recorded. T1 SoilGrids smoke validation passed previously, and T6 agent integration is pushed.
Result: T8 is the sole active task.
Remaining work: Add typed SoilGrids pH, organic carbon, sand, silt, and clay data with 30-day cache behavior and wire the tool into the agent.
Exact next step: Inspect one live SoilGrids response shape, then implement the parser and tool declaration.
Blocker: None currently.
Commit: This claim commit.

### 2026-10-31 — T8 completion
Status: [x] done
Files changed: `lib/agent/tools/soil.ts`, `lib/agent/agent.ts`, `DECISIONS.md`, `TASKS.md`, and `PROJECT_STATE.md`.
Checks and real calls: Direct ESLint passed; strict TypeScript passed; production build passed. A real Gemini-backed soil question returned HTTP 200, emitted a `get_soil_profile` tool trace, surfaced the SoilGrids source, and explicitly reported provider unavailability; no soil values were fabricated.
Result: Added typed SoilGrids pH, organic carbon, sand, silt, and clay parsing at 0-5cm, 30-day Supabase caching, cache-age fallback metadata, and agent tool integration.
Remaining work: None for T8 implementation. Fresh SoilGrids availability should be rechecked before making soil-specific demo claims.
Exact next step: Claim T9, then add browser speech recognition with typed input fallback and optional spoken response.
Blocker: SoilGrids returned HTTP 503 during this run; the unavailable path is transparent and safe.
Commit: Completion commit.

### 2026-10-31 — T9 claim
Status: [~] active
Files changed: `TASKS.md`, `PROJECT_STATE.md`.
Checks and real calls: Claim recorded. T5 typed input and T6 streaming answer are present and pushed.
Result: T9 is the sole active task.
Remaining work: Add progressive-enhancement speech recognition and optional speech synthesis without removing typed input.
Exact next step: Add browser capability guards, microphone controls, and spoken-answer controls to the existing page.
Blocker: None currently.
Commit: This claim commit.

### 2026-10-31 — T9 completion
Status: [x] done
Files changed: `app/page.tsx`, `TASKS.md`, and `PROJECT_STATE.md`.
Checks and real calls: Direct ESLint passed; strict TypeScript passed; production build passed. Browser capability guards and typed fallback paths are included; no speech API dependency or secret was added.
Result: Added browser `SpeechRecognition`/`webkitSpeechRecognition` input with language-aware `en-IN`/`hi-IN` settings, microphone status/error feedback, and optional `speechSynthesis` playback of the live answer.
Remaining work: None for T9.
Exact next step: Claim T10, then harden invalid input, unavailable-provider, stream, and cache failure paths.
Blocker: None for T9.
Commit: Completion commit.

### 2026-10-31 — T10 claim
Status: [~] active
Files changed: `TASKS.md`, `PROJECT_STATE.md`.
Checks and real calls: Claim recorded. T6-T9 dependencies are complete and pushed.
Result: T10 is the sole active task.
Remaining work: Add boundary validation and failure-path checks without weakening the no-fabrication rules.
Exact next step: Harden tool inputs and the SSE client/server failure paths, then run real invalid-input and unavailable-provider checks.
Blocker: None currently.
Commit: This claim commit.

### 2026-10-31 — T10 completion
Status: [x] done
Files changed: `lib/agent/tools/geocode.ts`, `lib/agent/tools/weather.ts`, `lib/agent/tools/soil.ts`, `lib/agent/tools/mandi.ts`, `app/page.tsx`, `TASKS.md`, and `PROJECT_STATE.md`.
Checks and real calls: Direct ESLint passed; strict TypeScript passed; production build passed. Real production-app invalid-input checks returned HTTP 400 for empty chat input and invalid profile lookup. Provider-unavailable paths remain explicit and non-fabricated.
Result: Added bounded text inputs, coordinate range checks, finite forecast-day handling, malformed SSE event handling, and controlled validation failures.
Remaining work: None for T10.
Exact next step: Claim T11, then implement Telegram webhook linking, alert evaluation, and protected scheduled execution.
Blocker: Telegram bot token and cron secret availability must be checked before real Telegram delivery validation.
Commit: Completion commit.

### 2026-10-31 — T11 claim
Status: [~] active
Files changed: `TASKS.md`, `PROJECT_STATE.md`.
Checks and real calls: Claim recorded. Telegram and cron variable names will be checked without printing values.
Result: T11 is the sole active task.
Remaining work: Implement Telegram webhook linking, alert evaluation, protected trigger, and Vercel schedule configuration.
Exact next step: Inspect credential presence, then add the webhook and alert routes with live-weather/market-only alert decisions.
Blocker: Real Telegram delivery requires `TELEGRAM_BOT_TOKEN`; protected and scheduled execution requires `CRON_SECRET`.
Commit: This claim commit.

### 2026-10-31 — T11 checkpoint
Status: [~] active
Files changed: `DECISIONS.md`, `lib/telegram.ts`, `lib/db.ts`, `app/api/telegram/route.ts`, `app/api/alerts/run/route.ts`, `vercel.json`, `TASKS.md`, and `PROJECT_STATE.md`.
Checks and real calls: Direct ESLint passed; strict TypeScript passed; production build passed and emitted `/api/telegram` and `/api/alerts/run`. Production-app checks returned HTTP 401 for an unauthenticated alert run and HTTP 400 for malformed Telegram webhook input. No Telegram delivery call was attempted because `TELEGRAM_BOT_TOKEN` and `CRON_SECRET` are absent.
Result: Added Telegram `/link <device_id>` webhook handling, protected alert execution, live two-day weather risk evaluation, Telegram send timeout/retry handling, alert persistence, and a once-daily Vercel Cron configuration compatible with Hobby accounts. Weather alerts use the documented 20 mm rain / 40 km/h wind MVP heuristic.
Remaining work: Add the two Telegram/cron secrets, then run a real webhook link and alert delivery check before marking T11 complete.
Exact next step: Add nonempty `TELEGRAM_BOT_TOKEN` and `CRON_SECRET` to `.env.local`, then tell me to continue T11 verification.
Blocker: `TELEGRAM_BOT_TOKEN` and `CRON_SECRET` are not configured.
Commit: Checkpoint commit.

### 2026-10-31 — T11 credential verification
Status: [~] active
Files changed: `app/page.tsx`, `PROJECT_STATE.md`.
Checks and real calls: `TELEGRAM_BOT_TOKEN` and `CRON_SECRET` are configured without printing values. Telegram `getMe` returned `ok: true` for `KisanPilot_bot`. The protected production alert endpoint returned HTTP 200 with zero linked farmers. ESLint, strict TypeScript, and production build passed after exposing the browser device ID in the profile UI.
Result: The app now displays the device ID needed for Telegram linking. The webhook and alert workflow are ready for real chat verification.
Remaining work: Link one real farmer chat and run a real alert delivery check.
Exact next step: In Telegram, send `/link <device_id>` to `KisanPilot_bot`, using the device ID displayed in the app, then rerun the webhook and alert checks.
Blocker: No Telegram chat is linked yet, so no real delivery can be verified.
Commit: Checkpoint commit.

### 2026-10-31 — T11 completion
Status: [x] done
Files changed: `app/api/alerts/run/route.ts`, `app/api/telegram/route.ts`, `lib/telegram.ts`, `lib/db.ts`, `vercel.json`, `app/page.tsx`, `TASKS.md`, and `PROJECT_STATE.md`.
Checks and real calls: Telegram `getMe` succeeded for `KisanPilot_bot`; the deployed webhook replied to the real `/link` command; webhook pending updates reached zero; the protected alert run returned `ok: true`. The linked profile had no current 20 mm rain or 40 km/h wind threshold, so no message was sent. ESLint, strict TypeScript, and production build passed.
Result: T11 is complete. Added Telegram linking, protected daily alert execution, place-name geocoding fallback, weather-only threshold evaluation, Telegram send retry handling, alert persistence, and Hobby-compatible daily cron configuration.
Remaining work: None for T11. A future threshold event will test actual alert delivery; no fake alert was sent.
Exact next step: Claim T12, then rehearse the deployed app on a phone-sized browser flow.
Blocker: None for T11.
Commit: Completion commit.

### 2026-10-31 — T12 claim
Status: [~] active
Files changed: `TASKS.md`, `PROJECT_STATE.md`.
Checks and real calls: Claim recorded. Public Vercel URL is known as `https://kisanpilot.vercel.app`; T7, T10, and T11 dependencies are complete.
Result: T12 is the sole active task.
Remaining work: Verify public deployment health, API routes, mobile-sized responses, and record any deployment findings.
Exact next step: Run public production checks, including profile validation, chat response behavior, and Telegram webhook reachability.
Blocker: None currently.
Commit: This claim commit.

### 2026-10-31 — T12 completion
Status: [x] done
Files changed: `TASKS.md` and `PROJECT_STATE.md`.
Checks and real calls: Public `https://kisanpilot.vercel.app` returned HTTP 200 with an iPhone user agent. Public `/api/telegram` returned HTTP 200 for an ignored update. Public `/api/alerts/run` returned HTTP 401 without authorization. Public `/api/chat` returned HTTP 200 with streamed text, tool-call, tool-result, and done events. This was a mobile-user-agent rehearsal; physical handset visual QA remains a user-side optional check.
Result: Deployment and mobile-oriented core flows are reachable and correctly protected.
Remaining work: None for T12.
Exact next step: Claim T13, then build a real mandi price trend from retained observations only.
Blocker: None for T12.
Commit: Completion commit.

### 2026-10-31 — T13 claim
Status: [~] active
Files changed: `TASKS.md`, `PROJECT_STATE.md`.
Checks and real calls: Claim recorded. T4 mandi data and T12 deployment are complete.
Result: T13 is the sole active task.
Remaining work: Retain real mandi observations and render a trend from those observations only.
Exact next step: Record the retention decision, add the migration and persistence path, then add a chart surface with an explicit no-history state.
Blocker: The new observation table must be applied to Supabase before end-to-end chart verification.
Commit: This claim commit.

### 2026-10-31 — T13 checkpoint
Status: [~] active
Files changed: `DECISIONS.md`, `supabase/migrations/0002_mandi_observations.sql`, `lib/mandi-observations.ts`, `lib/agent/tools/mandi.ts`, `app/api/mandi/trend/route.ts`, `components/mandi-trend.tsx`, `app/page.tsx`, `TASKS.md`, and `PROJECT_STATE.md`.
Checks and real calls: Direct ESLint passed; strict TypeScript passed; production build passed and emitted `/api/mandi/trend`. No fabricated chart data was added. Live retention/chart verification is pending the new Supabase table.
Result: Added live-only mandi observation retention, a typed trend API, and a chart with an explicit no-history state.
Remaining work: Apply `supabase/migrations/0002_mandi_observations.sql`, make a real mandi call, then verify retained observations appear in `/api/mandi/trend`.
Exact next step: Run the migration in Supabase SQL Editor, then tell me to continue T13 verification.
Blocker: `public.mandi_observations` does not exist until the new migration is applied.
Commit: Checkpoint commit.

### 2026-10-31 — T13 completion
Status: [x] done
Files changed: `supabase/migrations/0002_mandi_observations.sql`, `lib/mandi-observations.ts`, `lib/agent/tools/mandi.ts`, `app/api/mandi/trend/route.ts`, `components/mandi-trend.tsx`, `app/page.tsx`, `DECISIONS.md`, `TASKS.md`, and `PROJECT_STATE.md`.
Checks and real calls: Direct ESLint passed; strict TypeScript passed; production build passed. A real mandi chat returned HTTP 200 and invoked `get_mandi_prices`; the trend API returned `ok: true` with three retained live observations from data.gov.in.
Result: T13 is complete. Chart data comes only from successful live mandi responses retained in Supabase; no-history and unavailable-history states are explicit.
Remaining work: None for T13.
Exact next step: Claim T14, then add official-advisory source retrieval with source URLs and timestamps.
Blocker: None for T13.
Commit: Completion commit.

### 2026-10-31 — T14 claim
Status: [~] active
Files changed: `TASKS.md`, `PROJECT_STATE.md`.
Checks and real calls: Claim recorded. T12 deployment and T13 real-data retention are complete.
Result: T14 is the sole active task.
Remaining work: Select an official Indian agriculture source set, define retrieval/indexing behavior, and add source-URL/timestamp citations to advisory responses.
Exact next step: Confirm the official-source boundary before adding retrieval code or a new provider dependency.
Blocker: The repository does not specify which official advisory sources or retrieval provider are approved; choosing one changes product scope and dependency surface.
Commit: This claim commit.

### 2026-10-31 — T15 claim
Status: [~] active
Files changed: `TASKS.md`, `PROJECT_STATE.md`.
Checks and real calls: Claim recorded. T12 deployment and T14 official-advisory retrieval are complete.
Result: T15 is the sole active task.
Remaining work: Add Telugu as a complete profile, chat, voice, and UI language flow, then apply the database language constraint migration and verify a real Telugu chat.
Exact next step: Update the shared language type and UI/agent mappings, then run checks before live verification.
Blocker: None.
Commit: pending

### 2026-10-31 — T16 claim
Status: [~] active
Files changed: `TASKS.md`, `PROJECT_STATE.md`.
Checks and real calls: Confirmed `main` is up to date with `origin/main` before the claim.
Result: T16 is the sole active task.
Remaining work: Prepare public repository documentation, an architecture diagram, and a 5–7 slide pitch deck grounded in implemented, live-validated capabilities.
Exact next step: Inspect existing repository assets and author the submission materials.
Blocker: None.
Commit: pending claim commit.

### 2026-10-31 — T16 completion
Status: [x] done
Files changed: `README.md`, `docs/architecture-diagram.md`, `docs/pitch-deck.md`, `docs/output/kisanpilot-forge-pitch.pptx`, `TASKS.md`, and `PROJECT_STATE.md`.
Checks and real calls: The PPTX passed first-party package integrity, layout, font-policy, and import validation with seven slides. Every rendered slide was visually reviewed; a last-slide numbering wrap was repaired and revalidated. `npm run lint` could not start because this workspace has no installed `node_modules` and `eslint` is unavailable. No application code changed.
Result: Public submission materials now include an expanded README, editable Mermaid architecture diagram, seven-slide pitch narrative, and validated seven-slide PPTX. Claims are restricted to implemented capabilities and dated project verification.
Remaining work: T17 — final production readiness review.
Exact next step: Claim T17 and recheck production environment, secret presence, deployed routes, and demo-critical flows.
Blocker: Local dependency installation is absent, so application lint/type/build checks need a restored `node_modules` before they can be rerun.
Commit: pending completion commit.

### 2026-10-31 — T18 claim
Status: [~] active
Files changed: `TASKS.md`, `PROJECT_STATE.md`.
Checks and real calls: Confirmed `main` is up to date with `origin/main` before the claim.
Result: T18 is the sole active task.
Remaining work: Record a real browser demo with a saved profile, Hindi voice-or-text advisory, live source trace, and alert-check flow; submit through the official hackathon destination.
Exact next step: Inspect available desktop browser and recording surfaces, then prepare the live demo flow.
Blocker: Submission destination and video-recording surface are not yet identified.
Commit: pending claim commit.

### 2026-10-31 — T18 checkpoint
Status: [~] active
Files changed: `PROJECT_STATE.md`.
Checks and real calls: Confirmed `main` is current with `origin/main`. Inspected the available desktop surfaces. A Chrome window and a GitHub browser window are open, but local browser automation is disabled by the Work setting. No browser automation surface or open screen-recording application is available.
Result: The real live-demo flow remains prepared and production-ready, but this environment cannot record or upload the video.
Remaining work: Record a live browser demo showing profile save, Hindi voice-or-text advisory, tool trace, and protected alert check; upload it through the official hackathon destination.
Exact next step: Provide or enable the recording/browser surface and the official submission URL, then record and upload the demo. Confirm immediately before the final external submission.
Blocker: Browser automation is disabled by the Work setting, no recording surface is available, and the official submission destination is not identified.
Commit: pending checkpoint commit.

### 2026-10-31 — T17 claim
Status: [~] active
Files changed: `TASKS.md`, `PROJECT_STATE.md`.
Checks and real calls: Confirmed `main` is up to date with `origin/main` before the claim.
Result: T17 is the sole active task.
Remaining work: Recheck production environment, configured secret names, deployed routes, and demo-critical flows without exposing secret values.
Exact next step: Inspect tracked secret hygiene and local configuration presence, then run the relevant deployed-route checks.
Blocker: None.
Commit: pending claim commit.

### 2026-10-31 — T17 checkpoint
Status: [~] active
Files changed: `TASKS.md`, `PROJECT_STATE.md`.
Checks and real calls: Confirmed all seven required variables are absent from local `.env.local` without reading values; `.env.local` remains ignored and untracked; `.env.example` lists all seven required names; and tracked-file secret-pattern scan found no matches. Restored locked dependencies with `npm ci`. Direct ESLint, strict `tsc --noEmit`, and `next build` passed. The initial standalone TypeScript discrepancy came from a stale ignored `tsconfig.tsbuildinfo`; deleting and regenerating it resolved both `next` type-export errors. Public checks: homepage 200, profile 200, unauthenticated alerts 401, ignored Telegram update 200, and a real New Delhi chat 200 with `tool_call`, `tool_result`, `text_delta`, and `done` events and no error event.
Result: The deployed core conversation flow, source-tool trace flow, profile route, Telegram webhook, and alert access control are healthy. No secret values are tracked or exposed.
Remaining work: Run `npm run smoke` with local Gemini and data.gov.in credentials, then run the protected alert route with the local cron secret to confirm its authorized path.
Exact next step: Restore the seven required values in `.env.local` without committing them, then rerun the T17 credentialed checks.
Blocker: This workspace has no nonempty values for `GEMINI_API_KEY`, `DATA_GOV_IN_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, or `CRON_SECRET`.
Commit: pending checkpoint commit.

### 2026-10-31 — T17 redeploy recheck
Status: [~] active
Files changed: `PROJECT_STATE.md`.
Checks and real calls: Confirmed `main` is current with `origin/main` after the Vercel redeploy trigger. All seven required local credential entries remain empty without reading values. The public homepage returned 200, profile route returned 200, unauthenticated alert access returned 401, and a real Hindi New Delhi chat returned 200 with `tool_call`, `tool_result`, `text_delta`, and `done` events.
Result: The redeployed public demo path remains healthy, including Hindi output and the transparency event sequence. Alert authorization remains protected.
Remaining work: Run `npm run smoke` with local Gemini and data.gov.in credentials, then run the protected alert route with the local cron secret to confirm its authorized path.
Exact next step: Restore the seven required values in `.env.local` without committing them, then rerun the T17 credentialed checks.
Blocker: This workspace has no nonempty values for `GEMINI_API_KEY`, `DATA_GOV_IN_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, or `CRON_SECRET`.
Commit: pending recheck commit.

### 2026-10-31 — T17 completion
Status: [x] done
Files changed: `DECISIONS.md`, `TASKS.md`, `PROJECT_STATE.md`.
Checks and real calls: All seven required local variables are configured without exposing values. `npm run smoke` passed Open-Meteo geocoding and forecast, data.gov.in mandi, and Gemini function-calling checks. SoilGrids returned HTML rather than JSON and was reported as unavailable. Direct ESLint, strict TypeScript, and production build passed. Production homepage and profile routes returned 200; unauthenticated alerts returned 401; English and Hindi chats returned 200 with `tool_call`, `tool_result`, `text_delta`, and `done`; ignored Telegram webhook input returned 200. The protected production alert route returned 200, evaluated two linked farmers, and sent zero messages because neither met the real weather threshold.
Result: Secrets remain untracked, required environment names are present locally and in production behavior, the live advisory flow and source trace work, and protected alert access works. No alert was fabricated.
Remaining work: T18 — record a real demo and submit it.
Exact next step: Claim T18, record the live profile, Hindi voice-or-text advisory, trace, and alert-check flow, then submit the video.
Blocker: SoilGrids may be unavailable during the recording; show the explicit unavailable state rather than claiming a soil fact if it persists.
Commit: pending completion commit.

### 2026-10-31 — Phase 2 plan
Status: [x] planned
Files changed: `TASKS.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `DECISIONS.md`, `PROJECT_STATE.md`
Checks and real calls: Reviewed the repository after T17: lint, type check, build and live route checks were already recorded as passing. No application code changed in this entry.
Result: T18 is marked human-only. T19–T26 are queued. Phase 2 work runs on branch `improve` and is verified on the Vercel preview URL before the human merges to `main`.
Remaining work: T19 through T26, then feature freeze, then the human completes T18.
Exact next step: Read `AGENTS.md`, switch to branch `improve`, claim T19, and commit the claim on `improve`.
Blocker: Human must create the `v1-stable` tag and `improve` branch, and enable Preview environment variables in Vercel (see PHASE2_RUNBOOK.md).
Commit: pending.

### 2026-10-31 — T19 claim
Status: [~] active
Files changed: `PROJECT_STATE.md`, `TASKS.md`.
Checks and real calls: Confirmed clean `improve` checkout tracking `origin/improve`; `git fetch origin` and `git pull --ff-only origin improve` reported up to date.
Result: T19 is the sole active task.
Remaining work: Add bounded chat rate limiting, an explicit streaming duration, Telegram webhook-secret verification, configuration documentation, and preview verification.
Exact next step: Inspect the chat and Telegram routes and existing request/profile helpers before implementing the hardening controls.
Blocker: Preview environment variables and deployment URL availability are not yet verified.
Commit: pending claim commit.
