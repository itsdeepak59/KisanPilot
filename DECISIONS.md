# Decisions and API findings

Do not reverse or materially change a decision without adding a dated entry with the reason and impact.

## Locked decisions

- **D1 — 2026-10-30:** Build Theme 2 agritech as a tool-calling decision agent. Live public data supports the required agent behavior and a reliable demo.
- **D2 — 2026-10-30:** Exclude browser agents for government portals, emergency logistics swarms, and hardware grid control. These paths depend on fragile or unavailable data sources.
- **D3 — 2026-10-30:** Use TypeScript and Next.js for both UI and agent work. No separate Python service.
- **D4 — 2026-10-30:** Use browser `device_id` instead of login for the MVP.
- **D5 — 2026-10-30:** Use browser speech APIs with typed input as the complete fallback.
- **D6 — 2026-10-30:** If the mandi source fails live validation, stop the dependent work and ask the human lead whether to repair it or pivot.
- **D7 — 2026-10-30:** This repository uses one active AI agent at a time. `PROJECT_STATE.md` records the active task and required handoff so a later agent resumes precisely.

## API findings

T1 has not run yet. Record each real smoke-test result here with:

- Date and time
- Endpoint or SDK operation tested
- Success or failure
- Response-shape or rate-limit quirks
- Required code workaround
- Whether the result blocks a later task
