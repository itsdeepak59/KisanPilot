Decisions (do not undo without writing why)
D1: Theme 2, Agritech & Resource Advisory, built as a tool-calling agent. Reason: every input can come from live free APIs (rule: no dummy data), clear agentic behaviour for the 25-pt pillar, and easy to demo live (30-pt pillar).
D2: Rejected: browser agent on gov portals (fragile live, CAPTCHAs, risky to submit real applications); emergency logistics swarm (needs supplier inventory APIs that don't exist publicly -> would force mock data = disqualification); hardware grid controller.
D3: Single language stack: TypeScript/Next.js for UI and agent. No separate Python service.
D4: No login in MVP; device_id identifies a farmer.
D5: Voice via browser Web Speech API; typed input always available.
D6: Pivot if mandi API fails the T0 smoke test: ask the lead (Theme 1 civic grievance triage is the fallback).
API quirks discovered (fill in during T0)
