# KisanPilot pitch deck

This seven-slide narrative matches the submission deck. Statements describe the implemented product and recorded verification only.

## 1. KisanPilot

**Live farm decisions, in the farmer's language**

Voice-first decision support for small and marginal farmers. KisanPilot brings live weather, mandi, soil, and official-advisory sources into one traceable conversation.

Forge by NxtWave · Theme 2: Climate, Resource Infrastructure & Global Supply Resilience

## 2. The decision gap

Farmers need weather, market, soil, and seasonal guidance to make time-sensitive choices. These sources sit in separate systems and may be difficult to use in the farmer's preferred language. An answer without a source or timestamp does not make that decision safer.

## 3. The product

KisanPilot starts with a lightweight browser-linked farm profile, then accepts a typed or spoken question in English, Hindi, or Telugu. The farmer receives a written answer, optional spoken playback, and a tool trace that identifies what the system actually checked.

## 4. Live-data agent

Gemini can call five typed tools during a streaming answer:

- Open-Meteo geocoding and forecast
- data.gov.in mandi prices with arrival dates
- ISRIC SoilGrids soil profile
- An allowlisted ICAR farmer advisory page

Every external tool has an eight-second timeout, one retry with backoff, typed result envelopes, and source timestamps. Missing data remains visible. The agent does not invent a substitute value.

## 5. Transparency farmers can inspect

The application streams tool calls and results beside the answer. The trace presents inputs, source, fetched time, result state, and cache age when a valid cached response is used. Successful live mandi records also form a retained-price trend, with an explicit no-history state when data is not available.

## 6. Proactive support

A saved profile can link to Telegram using `/link <device_id>`. Vercel Cron runs the protected alert route daily. The route evaluates the next two days of live weather and sends a Telegram message only when the documented rainfall or wind threshold is met. No fabricated alert is sent when the condition does not occur.

## 7. Demo and next proof points

**Live demo flow**

1. Save a farm profile and choose a language.
2. Ask a crop question by voice or text.
3. Inspect the live answer, sources, timestamps, and tool trace.
4. Show the retained mandi trend when live observations exist.
5. Link Telegram and show the protected alert check.

**Current evidence**

Recorded project checks include live Open-Meteo, data.gov.in, SoilGrids, Gemini tool-calling, Supabase persistence, a Telugu chat flow, official ICAR retrieval, deployed streaming chat, and Telegram webhook linkage. See `PROJECT_STATE.md` for dated outcomes and known provider risks.
