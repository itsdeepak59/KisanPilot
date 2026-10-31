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
| T5 | [ ] Core chat and profile UI with language selection and typed input. | T0, T2 | Profile persists and a farmer can submit a question. |
| T6 | [ ] Streaming agent route and tool trace protocol. | T3, T4, T5 | Agent calls tools and streams a source-stamped trace. |
| T7 | [ ] Trace panel. | T6 | Each call shows arguments, result state, source, timestamp, and cache age. |
| T8 | [ ] Soil tool and agent integration. | T1, T2, T6 | Soil facts use live or clearly labelled cached SoilGrids data. |
| T9 | [ ] Voice input and spoken response. | T5, T6 | Speech recognition has a typed fallback; answer speech is optional and safe. |
| T10 | [ ] Error and edge-case hardening. | T6, T8, T9 | Known failure paths produce a clear, non-fabricated response. |
| T11 | [ ] Telegram webhook, alert run endpoint, and scheduled trigger. | T2, T6 | A linked real chat receives only an actual alert. |
| T12 | [ ] Deployed phone end-to-end rehearsal. | T7, T10, T11 | Live URL works on a phone; findings are logged. |
| T13 | [ ] Real price trend chart. Stretch. | T4, T12 | Chart uses retained real mandi observations only. |
| T14 | [ ] Official-advisory RAG. Stretch. | T12 | Answers cite official source URLs. |
| T15 | [ ] Second regional language. Stretch. | T12 | One complete flow works in the new language. |
| T16 | [ ] Submission README, architecture diagram, and 5–7 slide pitch deck. | T12 | Public repository documentation is complete. |
| T17 | [ ] Final production readiness review. | T16 | Secrets, environment, and all demo paths are checked. |
| T18 | [ ] Record real demo and submit. | T17 | Video shows the live product and tool trace. |

## Current task notes

T4 is complete. The data.gov.in mandi tool performs district-first and state-level fallback queries, returns actual arrival dates, caches live responses, and emits typed no-data errors. T5 is the next eligible task.

## Required note format

After every checkpoint, add an entry to `PROJECT_STATE.md`:

- Files changed
- Checks or real calls run and result
- What remains
- Exact next command or implementation step
- Blocker, if any
