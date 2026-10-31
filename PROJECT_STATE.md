# Project state and handoff

This file is the operational source of truth for the next human or AI agent. Update it before beginning a task, before ending a context window, and after completing a task.

## Current state

- Branch: `main`
- Active task: **T8 — Soil tool and agent integration**
- Next eligible task: none while T8 is active
- Application status: T8 is active. T7 is complete. T6 is complete. T5 is complete. T4 is complete. T3 is complete; Open-Meteo tools and the data.gov.in mandi tool are implemented and live-validated, and the configured Supabase project exposes the `public.api_cache` table.
- Last documentation update: 2026-10-31
- Blocking credentials: T2 requires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`; Telegram and cron values are needed for T11.

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
