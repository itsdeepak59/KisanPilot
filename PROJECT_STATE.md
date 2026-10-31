# Project state and handoff

This file is the operational source of truth for the next human or AI agent. Update it before beginning a task, before ending a context window, and after completing a task.

## Current state

- Branch: `main`
- Active task: **T3 — Geocode and weather tools with typed responses and real-response caching**
- Next eligible task: none while T3 is active
- Application status: T3 is active. T2 is complete; its Supabase save/load path can now be verified against the credentials in `.env.local`.
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
