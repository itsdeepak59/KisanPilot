Architecture
Stack (frozen — see DECISIONS.md before changing)
Next.js (App Router, TypeScript strict) + Tailwind + shadcn/ui
Vercel AI SDK (ai, @ai-sdk/google) for streaming + tool calling with Gemini (use the current Gemini Flash model from AI Studio)
Supabase (Postgres) for farmer profiles, advisory logs, API cache, alerts
Telegram Bot API for proactive alerts
Browser Web Speech API for voice input (SpeechRecognition) and output (speechSynthesis); typed input is the fallback
Deploy: Vercel. Secrets in env vars only.
Folder structure
/app
  /page.tsx                 # main chat + voice UI
  /api/chat/route.ts        # agent endpoint (streams)
  /api/profile/route.ts     # save/load farm profile
  /api/alerts/run/route.ts  # runs alert check (also called by cron + demo button)
  /api/telegram/route.ts    # Telegram webhook (links chat_id to profile)
/lib
  /agent/agent.ts           # system prompt + tool wiring + loop settings
  /agent/tools/             # one file per tool (geocode, weather, mandi, soil)
  /cache.ts                 # Supabase api_cache read/write with TTL
  /supabase.ts
  /i18n.ts                  # language codes: hi-IN, en-IN, + 1 regional
/components                 # UI (chat, trace panel, profile form)
/scripts/smoke              # T0 API smoke tests (real calls)
/docs                       # diagram, notes
Data model (Supabase)
farmers(id uuid pk, device_id text, language text, lat float8, lon float8, place_name text, state text, district text, crops text[], telegram_chat_id text null, created_at)
advisories(id, farmer_id, question text, answer text, tool_trace jsonb, created_at)
api_cache(key text pk, source text, payload jsonb, fetched_at timestamptz, ttl_seconds int)
alerts(id, farmer_id, kind text, message text, sent_at, delivered bool) No login in MVP: identify a farmer by a device_id stored in the browser.
Agent tools (each returns { ok, data, source, fetched_at } or { ok:false, error })
geocode_location(query) -> lat, lon, state, district [Open-Meteo geocoding]
get_weather_forecast(lat, lon, days<=7) -> daily rain, temp max/min, wind, ET0 [Open-Meteo forecast]
get_mandi_prices(state, district?, commodity) -> market, min/max/modal price, arrival_date [data.gov.in]
If no rows for district: widen to state, and always report the arrival_date actually returned.
If still empty: return ok:false with reason "no data" (agent must say so, never guess)
get_soil_profile(lat, lon) -> pH, organic carbon, sand/silt/clay [SoilGrids; cache 30 days; slow/rate-limited]
(STRETCH) search_advisory_documents(query) -> passages + source URLs
Agent loop
streamText with tools, maxSteps ~6, temperature low.
System prompt rules: (1) use tools for every factual number; (2) never invent prices/weather/soil values; (3) cite source + timestamp for each fact; (4) answer in the farmer's language; (5) if a tool fails, say what is missing and continue with what you have; (6) if crop or location is missing, ask ONE clarifying question; (7) no pesticide/chemical dosage — refer to the local KVK / agriculture officer; (8) end with 2-4 concrete dated actions.
Every tool call and result is streamed to the UI trace panel and saved in advisories.tool_trace.
Proactive alerts
/api/alerts/run: for each farmer with telegram_chat_id, run the agent with an internal prompt ("Any weather or price risk in the next 48h for their crops? Reply ALERT: <msg> or OK"), send Telegram message only if ALERT. Triggered by a scheduled job (GitHub Actions cron or Vercel Cron) and by a demo button.
Reliability
Cache every API response in api_cache with fetched_at; serve cached data (clearly labelled with its age) if the live call fails.
Timeouts (8s) + one retry with backoff on every external call. Handle Gemini rate limits with retry.
Edge cases to test: unknown place, ambiguous place name, crop not in mandi data, API down, empty/garbled voice input, mixed-language input, off-topic question, very long question.
Env vars (names only; values in .env.local and Vercel, NEVER committed)

GEMINI_API_KEY, DATA_GOV_IN_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, TELEGRAM_BOT_TOKEN, CRON_SECRET
