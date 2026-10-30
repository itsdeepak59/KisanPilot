TASKS (update after EVERY finished task; commit with it)

Owners: A = backend/agent person, B = frontend/voice/alerts/pitch person. Status legend: [ ] todo, [~] in progress, [x] done. Hour marks are hours since hackathon start; adjust but keep the order.

Hour 0-2 (both)
 T0 (A+B): Smoke-test every API with real calls in /scripts/smoke: Open-Meteo geocode+forecast, data.gov.in mandi (get API key), SoilGrids, Gemini tool calling. Write results + quirks in DECISIONS.md. If mandi or soil fails, tell the lead immediately (pivot options exist).
 T0b (B): Create Supabase tables from ARCHITECTURE.md; set env vars locally and on Vercel; confirm deploy works.
Hour 2-8
 T1 (A): tools: geocode_location + get_weather_forecast with cache + typed results
 T2 (A): tool: get_mandi_prices with district->state fallback and "no data" handling
 T3 (B): chat UI shell (shadcn), language selector, profile form (location + crops) saved to Supabase
 T4 (A): /api/chat agent route with streaming and multi-step tool calling, tool trace in stream
 T5 (B): trace panel UI showing each tool call, source, timestamp
Hour 8-16
 T6 (A): tool: get_soil_profile with long cache + timeout handling
 T7 (B): voice input (Web Speech API) + spoken answer, typed fallback
 T8 (A): error handling pass: every tool failure produces a graceful agent reply
 T9 (B): Telegram bot + /api/telegram webhook linking chat_id to farm profile
 T10 (A): /api/alerts/run + scheduled trigger + demo button
Hour 16-20
 T11 (both): end-to-end on the DEPLOYED URL from a phone; fix what breaks; first full demo rehearsal
Sleep in shifts after this.
Hour 26-38 (stretch + hardening)
 T12: edge-case test list from ARCHITECTURE.md (log results here)
 T13 (STRETCH): price trend chart from real mandi data
 T14 (STRETCH): RAG over official advisories with citations
 T15: second regional language
Hour 38+ (FEATURE FREEZE at hour 38)
 T16 (B): pitch deck 5-7 slides; README with setup + architecture diagram
 T17 (A): final bug fixes only; verify env vars in Vercel; check public repo has no secrets
 T18 (both): record the 2-3 min demo video of the REAL running app; rehearse pitch 3x; submit 1 hour early
Notes / current status for the next agent

(Whoever finishes a task writes 2-3 lines here: what was done, files touched, what is next, known issues.)
