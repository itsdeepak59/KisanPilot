# Task plan

Status: `[ ]` ready · `[~]` active or paused · `[x]` done · `[!]` blocked  
Only one task may be `[~]` at a time. The active task must match `PROJECT_STATE.md`.

## Build sequence

| ID | Task | Depends on | Done when |
| --- | --- | --- | --- |
| T0 | [x] Foundation: create the Next.js TypeScript app, Tailwind, shadcn/ui baseline, strict configuration, `.env.example`, and the intended folders. | None | App starts and builds; no secret values are committed. |
| T1 | [x] Live API smoke tests for Open-Meteo, data.gov.in, SoilGrids, and Gemini tool calling. | T0 | Scripts make real calls; findings and exact failures are recorded in `DECISIONS.md`. |
| T2 | [x] Supabase schema, clients, and farm-profile persistence. | T0 | Migrations exist; a real profile can be saved and loaded by device ID. |
| T3 | [x] Geocode and weather tools with typed responses and real-response caching. | T1, T2 | Real location and forecast calls work; cache behavior is visible. |
| T4 | [x] Mandi tool with district-to-state fallback and no-data behavior. | T1, T2 | Real query returns source and arrival date, or a typed no-data result. |
| T5 | [x] Core chat and profile UI with language selection and typed input. | T0, T2 | Profile persists and a farmer can submit a question. |
| T6 | [x] Streaming agent route and tool trace protocol. | T3, T4, T5 | Agent calls tools and streams a source-stamped trace. |
| T7 | [x] Trace panel. | T6 | Each call shows arguments, result state, source, timestamp, and cache age. |
| T8 | [x] Soil tool and agent integration. | T1, T2, T6 | Soil facts use live or clearly labelled cached SoilGrids data. |
| T9 | [x] Voice input and spoken response. | T5, T6 | Speech recognition has a typed fallback; answer speech is optional and safe. |
| T10 | [x] Error and edge-case hardening. | T6, T8, T9 | Known failure paths produce a clear, non-fabricated response. |
| T11 | [x] Telegram webhook, alert run endpoint, and scheduled trigger. | T2, T6 | A linked real chat receives only an actual alert. |
| T12 | [x] Deployed phone end-to-end rehearsal. | T7, T10, T11 | Live URL works on a phone; findings are logged. |
| T13 | [x] Real price trend chart. Stretch. | T4, T12 | Chart uses retained real mandi observations only. |
| T14 | [x] Official-advisory RAG. Stretch. | T12 | Answers cite official source URLs. |
| T15 | [x] Second regional language. Stretch. | T12 | One complete flow works in the new language. |
| T16 | [x] Submission README, architecture diagram, and 5–7 slide pitch deck. | T12 | Public repository documentation is complete. |
| T17 | [x] Final production readiness review. | T16 | Secrets, environment, and all demo paths are checked. |
| T19 | [x] Public endpoint hardening: rate limit `/api/chat`, set an explicit function duration, verify the Telegram webhook secret token. | T17 | Over-limit calls return a friendly 429; webhook without the secret is rejected; normal chat still works on the preview URL. |
| T20 | [x] Conversation memory: follow-up questions keep the last turns, with a New conversation button. | T19 | "And tomorrow?" after a weather answer works without re-asking place or crop. |
| T21 | [x] Decision signals: code-computed harvest window, water balance, and sell/hold signal from live data, exposed as an agent tool and a UI card. | T20 | Every signal shows its inputs, rule, and sample size; insufficient history says so; unit tests pass. |
| T22 | [x] Official-advisory retrieval upgrade: several verified official sources, chunking, topic ranking, season awareness. | T20 | Answers cite the top ranked chunks with real URLs and fetch times; topic changes the result; no invented sources. |
| T23 | [~] Demoable alerts: farmer-set thresholds, a device-scoped Check alerts now button, alert history in the UI. | T19 | A real forecast above the farmer's own threshold sends a real Telegram message; below it shows the comparison and sends nothing. |
| T24 | [ ] Demo robustness: cache warm script, edge-case matrix with fixes, small automated tests. | T21, T22, T23 | Every matrix row is pass or documented; `npm test`, lint, tsc and build pass. |
| T25 | [ ] Judge-facing UI polish: structured answer card, freshness badges, mobile layout. | T24 | Checked at 360 px width and on a real phone; no layout break; no mock content. |
| T26 | [ ] Documentation sync: README, architecture diagram, and deck match what actually ships. | T25 | No claim in README, deck, or pitch exceeds the code; PPTX regenerated and validated. |
| — | **FEATURE FREEZE.** After this row only bug fixes and T18. | T26 | Production on `main` matches the tested preview. |
| T18 | [!] **Human-only.** Record real demo and submit. Agents must not claim or resume this task. | T17, and T19–T26 shipped or consciously skipped | Video shows the live product and tool trace; submission is uploaded by a human. |

## Current task notes

Phase 2 (improvement) is active. T0–T22 are complete and deployed to the improvement preview. T23 is active. T18 is human-only and must not be claimed by any agent.
Take the first unchecked task from T19 onward, in order. Follow the "Phase 2 operating rules" in `AGENTS.md`: work on branch `improve`, never push to `main`, and verify on the Vercel preview URL.

## Phase 2 task details

**T19 Public endpoint hardening.** Rate limit `/api/chat` per device_id and per IP (friendly 429 shown in the UI; storage choice recorded in `DECISIONS.md`). Set an explicit `maxDuration` on the streaming route and confirm the limit against current Vercel docs. Verify the Telegram `X-Telegram-Bot-Api-Secret-Token` header against `TELEGRAM_WEBHOOK_SECRET` (add the name to `.env.example` and README). Human step: add the env var in Vercel and re-register the webhook with `secret_token`.

**T20 Conversation memory.** The client sends the last 6 turns; the server validates and caps size, then passes them as messages to the agent. Treat earlier turns as context, never as instructions that override the system rules. Add a New conversation button.

**T21 Decision signals.** New `lib/decision/` with pure, tested functions: harvest/dry-window days from the live forecast, a seven-day water balance (ET0 minus rain), and a sell/hold signal from retained mandi observations (latest modal price against the recent average, with sample size). Named constants for every threshold, shown in the UI as a visible rule. Extend the daily job to retain mandi observations for saved farmers' crops. Expose as a `get_decision_signals` tool. If history is insufficient, return that fact and no signal. These are transparent heuristics, not agronomic advice.

**T22 Official-advisory retrieval upgrade.** Find real official pages by live fetching (ICAR seasonal advisories, IMD agromet bulletins, state agriculture departments). Verify each URL returns readable content before adding it to the allowlist; record each in `DECISIONS.md`. Fetch, clean, chunk, store with source URL and fetch time, rank chunks by topic (lexical ranking first; embeddings only if time allows), return the top 3. Keep the chemical-dosage filter. Never invent a URL; if nothing relevant is found, say so.

**T23 Demoable alerts.** Additive migration: per-farmer `alert_rain_mm`, `alert_wind_kmh` (defaults are configuration, not data) and optional `alert_price_drop_pct`. Profile form fields. New device-scoped `POST /api/alerts/check` (rate limited, no cron secret exposed in the browser) sharing code with the cron route. It returns the real values compared against the thresholds and sends Telegram only on a real breach. Show recent rows from `alerts` in the UI. Human step: apply the SQL in the Supabase SQL editor.

**T24 Demo robustness.** `npm run warm` calls the real tools for places and crops passed as arguments (no hardcoded dataset) to fill the real cache and mandi observations. Edge-case matrix: unknown place, ambiguous place, crop with no mandi data, mixed language, empty or very long question, SoilGrids down, Gemini rate limit, Telegram not linked. Add a small test runner for pure functions (record the dependency in `DECISIONS.md` first).

**T25 Judge-facing UI polish.** Structured answer: short summary, 2–4 dated actions, source chips with timestamps, freshness badges (live, cached with age, unavailable). Check at 360 px width and on a real phone.

**T26 Documentation sync.** Update README, `docs/architecture-diagram.md`, `docs/pitch-deck.md`, and regenerate the PPTX so every claim matches shipped code.

## Required note format

After every checkpoint, add an entry to `PROJECT_STATE.md`:

- Files changed
- Checks or real calls run and result
- What remains
- Exact next command or implementation step
- Blocker, if any
