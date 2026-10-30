# KisanPilot

A voice-first, multilingual agritech decision agent for small farmers. It uses live weather, mandi-price, and soil data to produce sourced, dated crop actions and can send proactive Telegram alerts.

## Start here

Any AI agent with repository access must follow [AGENTS.md](AGENTS.md). It will read the project state, resume the active task if one exists, or claim the next unblocked task.

- [Project brief](PROJECT.md)
- [Architecture](ARCHITECTURE.md)
- [Live project state and handoff](PROJECT_STATE.md)
- [Task plan](TASKS.md)
- [Decisions and API findings](DECISIONS.md)
- [Prompts for agents without repository access](HANDOFF_PROMPTS.md)

## Product promise

KisanPilot is an agent, not a generic chat interface. For every factual answer, it must call live tools, reveal the source and timestamp, and say when data is unavailable. It must never fabricate crop, weather, soil, or market facts.

## Stack

Next.js App Router, TypeScript, Tailwind, shadcn/ui, Vercel AI SDK with Gemini, Supabase, Telegram Bot API, and browser speech APIs. See [ARCHITECTURE.md](ARCHITECTURE.md) for the frozen design.

## Local setup

The first implementation task creates the app scaffold. After it is complete:

1. Copy `.env.example` to `.env.local`.
2. Add real service credentials only to `.env.local`.
3. Follow the commands and verification notes recorded in `PROJECT_STATE.md`.

Do not commit `.env.local` or any credential.
