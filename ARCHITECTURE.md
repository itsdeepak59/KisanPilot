# Architecture

## Frozen stack

- Next.js App Router with TypeScript strict mode
- Tailwind CSS and shadcn/ui
- Vercel AI SDK: `ai` and `@ai-sdk/google`
- Gemini Flash model selected from current Google AI Studio availability
- Supabase Postgres
- Telegram Bot API
- Browser Web Speech API for recognition and speech synthesis
- Vercel deployment and scheduled jobs

Write a dated entry in `DECISIONS.md` before changing this stack or adding a dependency.

## Repository layout

```text
app/
  page.tsx                    main chat, voice, and profile experience
  api/chat/route.ts           streaming agent endpoint
  api/profile/route.ts        profile read and save
  api/alerts/run/route.ts     alert check, cron, and demo trigger
  api/telegram/route.ts       Telegram webhook
components/                   chat, trace panel, profile form
lib/
  agent/agent.ts              agent prompt, loop, and tool wiring
  agent/tools/                one file per external data tool
  cache.ts                    Supabase cache read/write and TTL handling
  supabase.ts                 server and browser clients
  i18n.ts                     language definitions
scripts/smoke/                live API smoke tests
supabase/                     schema migrations
docs/                         diagrams and supporting notes
```

## Data model

```text
farmers(
  id uuid primary key,
  device_id text unique,
  language text,
  lat float8,
  lon float8,
  place_name text,
  state text,
  district text,
  crops text[],
  telegram_chat_id text null,
  created_at timestamptz
)

advisories(
  id uuid primary key,
  farmer_id uuid,
  question text,
  answer text,
  tool_trace jsonb,
  created_at timestamptz
)

api_cache(
  key text primary key,
  source text,
  payload jsonb,
  fetched_at timestamptz,
  ttl_seconds int
)

alerts(
  id uuid primary key,
  farmer_id uuid,
  kind text,
  message text,
  sent_at timestamptz,
  delivered boolean
)
```

No login is needed for the MVP. The browser creates and persists a `device_id`.

## Tool contract

Every tool returns either:

```ts
{ ok: true, data, source, fetched_at }
{ ok: false, error, source, fetched_at }
```

Every external request uses an 8-second timeout, one retry with backoff, and `try/catch`.

| Tool | Live source | Required behavior |
| --- | --- | --- |
| `geocode_location(query)` | Open-Meteo | Return latitude, longitude, state, and district. |
| `get_weather_forecast(lat, lon, days)` | Open-Meteo | Support at most seven days; return rain, min/max temperature, wind, and ET0. |
| `get_mandi_prices(state, district, commodity)` | data.gov.in | Try district first, then state; always return the actual arrival date. Return `no data` if empty. |
| `get_soil_profile(lat, lon)` | SoilGrids | Return pH, organic carbon, sand, silt, and clay; cache for 30 days. |

Cache real API responses with `fetched_at`. If a live call fails, cached data may be used only when its age is shown to the farmer.

## Agent behavior

The chat endpoint uses `streamText`, the tools above, low temperature, and at most six steps.

The system prompt must:

1. Call tools for factual claims.
2. Never invent values, dates, prices, or sources.
3. Answer in the selected farmer language.
4. Ask one clarifying question when crop or location is missing.
5. Continue with available data when a tool fails and clearly name the missing data.
6. Avoid chemical dosage advice and refer users to a KVK or agriculture officer.
7. End with two to four concrete, dated actions.

Stream every tool call and result to the trace panel and save the trace in `advisories.tool_trace`.

## Alerts

`/api/alerts/run` loads farmers with a Telegram chat ID, checks the next 48 hours for weather or market risk, and sends a message only for an `ALERT` result. It runs through Vercel Cron and a protected demo trigger. The Telegram webhook links a chat ID to a farm profile.

## Required environment variables

```text
GEMINI_API_KEY
DATA_GOV_IN_API_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
TELEGRAM_BOT_TOKEN
CRON_SECRET
```

Only names belong in the repository. Values belong in `.env.local` and Vercel.
