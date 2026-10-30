KisanPilot — Project Brief (working name)

Hackathon: Forge by NxtWave (48h) Track: Theme 2 — Climate, Resource Infrastructure & Global Supply Resilience Problem we chose: "Multilingual Agritech & Resource Advisory Assistant" — built as an AGENT, not a chatbot.

One-line pitch

A voice-first, multilingual AI agent that gives a farmer a dated, sourced, crop-level action plan ("harvest by Thursday before the rain, sell at X mandi where the price is Y") by calling LIVE weather, mandi-price and soil APIs, and warns them proactively on Telegram when conditions change.

Problem

Small farmers decide when to sow, irrigate, spray, harvest and sell using fragmented, delayed, English-only information spread across weather portals, mandi price sites and soil data sources. Wrong timing means crop loss or selling at a bad price.

Users
Primary: small/marginal farmers (voice, local language, low literacy, phone only)
Secondary: FPO / agri extension workers advising many farmers
Solution
Farmer speaks or types a question in Hindi / English / one regional language, with their location and crop.
The agent PLANS and calls tools: geocode -> weather forecast -> mandi prices -> soil profile.
It reasons over the live results and returns an action plan with sources and timestamps, in the farmer's language (text + spoken).
A saved farm profile lets a scheduled job re-check conditions and push a Telegram alert when risk changes.
Core features (MAX 3 — anything else goes in STRETCH)
F1: Voice/text advisory agent with multi-step tool calling (live data only)
F2: Farm profile + proactive Telegram alerts (agent runs unprompted)
F3: Transparency panel: shows every tool call, source, timestamp, and "I don't know" guardrails
STRETCH (only after F1-F3 are stable and deployed)
Price trend chart (real data, last N days from the mandi API)
RAG over official advisories (IMD agromet bulletins / ICAR / state agri dept PDFs) with source citations
Second regional language
Out of scope
Login/passwords, payments, marketplace, chemical dosage advice, hardware/IoT, satellite imagery
Real data sources (NO DUMMY DATA — see rules)
Open-Meteo Geocoding + Forecast API (live weather)
data.gov.in "Current daily price of various commodities from various markets (Mandi)" (needs free API key)
ISRIC SoilGrids REST API (soil properties); NASA POWER as climate fallback
Gemini API (reasoning, translation, tool calling) Verify each in Task T0 before building on it.
Hackathon rules we must obey (non-negotiable)
No hardcoded/static/mock data anywhere in the app. Every number shown must come from a live API or the DB populated by real use. Caching REAL API responses with timestamps is allowed.
Boilerplate and libraries allowed, but all core logic, agent workflows and AI integration are built during the event.
Every teammate must be able to explain the code, data flow and AI logic.
Live demo must run without crashing. Pre-recorded video must never be presented as the live app.
Submission: problem statement, solution + architecture, live URL, 2-3 min demo video (end-to-end, shows tool use), public GitHub repo (README with setup + architecture diagram), 5-7 slide deck.
Rubric mapping (100 pts)
Technical depth (20): custom agent loop with tools, caching, error handling, modular code
AI reasoning & agentic execution (25): multi-step tool calls, self-correction on failures, source attribution, guardrails
Relevance, impact, USP (25): decision agent (not a chatbot), live local data, voice + regional language, proactive alerts
Live demo & robustness (30): deploy early, graceful failures, edge cases, test on phone, nothing hardcoded
Demo script (3 min)
Open the live URL on a phone. Set location + crop.
Ask by voice in Hindi. Show the tool-trace panel: geocode -> weather -> mandi -> soil.
Show the spoken + written answer with sources and timestamps.
Edge case: unknown village or crop with no mandi data today -> graceful message, no crash.
Click "Run alert check" -> Telegram message arrives on the phone.
Show README architecture diagram and repo.
