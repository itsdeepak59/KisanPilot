# KisanPilot project brief

## Goal

Build a voice-first, multilingual decision agent for small and marginal farmers. A farmer asks a crop and location question by voice or text. KisanPilot calls live tools for geocoding, weather, mandi prices, and soil; then returns a dated action plan in the farmer's language with sources and timestamps. A saved profile enables proactive Telegram alerts when risk changes.

## Hackathon context

Forge by NxtWave, 48-hour hackathon  
Theme 2: Climate, Resource Infrastructure & Global Supply Resilience

## Problem

Farmers must combine fragmented, delayed, and often English-only information to decide when to sow, irrigate, harvest, and sell. Bad timing can cause crop loss or a poor selling price.

## Users

- Primary: small and marginal farmers using phones, voice, and local languages.
- Secondary: FPO and agricultural extension workers who advise farmers.

## Core features

1. Voice and text advisory agent with multi-step live tool calling.
2. Farm profile and proactive Telegram alerts.
3. Transparency panel showing each tool call, source, timestamp, cached-data status, and uncertainty.

## Scope

The MVP supports Hindi and English, plus one regional language after the core flow is stable.

Out of scope: login and passwords, payments, marketplace flows, chemical dosage advice, IoT or hardware, and satellite imagery.

## Data sources

- Open-Meteo geocoding and forecast APIs for location and weather.
- data.gov.in mandi dataset for commodity prices.
- ISRIC SoilGrids for soil profile data; NASA POWER is a climate fallback.
- Gemini API for reasoning, translation, and tool calling.

Every displayed business fact must come from a live API or a timestamped cache of a live response. Database records must come from real product use.

## Demo outcome

On a phone, a farmer sets a location and crop, asks in Hindi by voice, and receives a spoken and written action plan. The user can see the geocode, weather, mandi, and soil tool trace with timestamps. The demo also shows a graceful unavailable-data response and a real Telegram alert check.

## Scoring focus

- Technical depth: modular tools, custom agent loop, caching, and fault handling.
- AI execution: multi-step tool use, recovery from failures, citations, and guardrails.
- Relevance: practical farmer decisions, local language, and proactive alerts.
- Reliability: a deployed flow that handles realistic edge cases without fabricated results.
