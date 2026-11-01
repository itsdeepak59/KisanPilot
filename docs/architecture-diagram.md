# KisanPilot architecture

This diagram describes the implemented request, data, and alert paths. It contains no assumed or sample farm data.

```mermaid
flowchart TB
  Browser[Farmer browser\nText or voice\nEnglish, Hindi, Telugu]
  UI[Next.js client\nProfile, structured answer, source trace, trends]
  Browser --> UI

  ProfileAPI[/api/profile/]
  ChatAPI[/api/chat/\nServer-Sent Events]
  TrendAPI[/api/mandi/trend/]
  UI --> ProfileAPI
  UI --> ChatAPI
  UI --> TrendAPI

  ProfileAPI <--> Farmers[(Supabase farmers)]
  ChatAPI --> Agent[Gemini streaming agent\nMax six tool steps]
  ChatAPI --> Advisories[(Supabase advisories)]
  TrendAPI <--> Observations[(Supabase mandi_observations)]

  Agent --> Geocode[Open-Meteo geocoding]
  Agent --> Forecast[Open-Meteo forecast]
  Agent --> Prices[data.gov.in mandi API]
  Agent --> Soil[ISRIC SoilGrids]
  Agent --> Advisory[ICAR and IMD advisory retrieval]
  Agent --> IMD[IMD crop advisory]
  Agent --> Signals[Decision signals\nweather, water, mandi history]
  Agent <--> Cache[(Supabase api_cache)]
  Prices --> Observations

  Cron[Vercel Cron] --> Alerts[/api/alerts/run/]
  Alerts --> Forecast
  Alerts --> Telegram[Telegram Bot API]
  Telegram --> Webhook[/api/telegram/]
  Webhook <--> Farmers
  Alerts --> AlertLog[(Supabase alerts)]
```

## Request flow

1. The browser creates a local `device_id`, saves a farmer profile through `/api/profile`, and sends the selected language and question to `/api/chat`.
2. The chat route streams text plus tool-call and tool-result events to the browser. It persists an advisory only when the device ID maps to a saved farmer profile.
3. Gemini selects from six typed live-data tools: geocoding, forecast, mandi prices, soil profile, official advisory retrieval, and transparent decision signals. The agent is limited to six steps.
4. Each tool returns either a typed success or error envelope with source and `fetched_at`. It uses an eight-second timeout, one retry with backoff, and `try/catch` handling.
5. The UI renders a structured answer summary, dated action lines when returned, source-freshness badges, and the exact trace. Successful mandi calls retain live observations for the trend endpoint.

## Alert flow

1. Vercel Cron invokes `/api/alerts/run` daily.
2. The route loads profiles linked to a Telegram chat, fetches a live two-day weather forecast, and evaluates the documented MVP threshold.
3. It sends a Telegram message only when the live forecast meets the threshold. It stores the delivery record in `alerts`.
4. `/api/telegram` accepts `/link <device_id>` to associate a Telegram chat with an existing browser profile.

## Source and cache rules

- Open-Meteo provides geocoding and forecast data.
- data.gov.in provides mandi records and their actual arrival dates.
- ISRIC SoilGrids provides 0–5 cm soil properties when available.
- Official advisory retrieval uses three verified pages from ICAR and IMD, ranks readable matches by topic and season, and preserves each source URL and fetch time.
- Supabase caches successful source responses. A cached fallback preserves the original fetch time and exposes cache age to the farmer.
- If a source cannot provide data, KisanPilot reports the missing source rather than synthesizing facts.

For source choices, schemas, and product constraints, see [ARCHITECTURE.md](../ARCHITECTURE.md) and [DECISIONS.md](../DECISIONS.md).
