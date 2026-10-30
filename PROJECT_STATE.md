# Project state and handoff

This file is the operational source of truth for the next human or AI agent. Update it before beginning a task, before ending a context window, and after completing a task.

## Current state

- Branch: `main`
- Active task: **T0 — Foundation**
- Next eligible task: none while T0 is active
- Application status: T0 is in progress: establishing the Next.js TypeScript foundation, Tailwind, shadcn/ui baseline, strict configuration, environment template, and intended folders.
- Last documentation update: 2026-10-30
- Blocking credentials: none for T0. T1 will require real `GEMINI_API_KEY` and `DATA_GOV_IN_API_KEY`; Supabase and Telegram values are needed only when their dependent tasks begin.

## Start protocol for the next agent

1. Read `AGENTS.md` and all files in its required order.
2. Confirm `PROJECT_STATE.md` still has no active task.
3. Mark T0 `[~]` here and in `TASKS.md`, then commit the claim.
4. Complete only T0. Do not start T1 in the same session.
5. Finish with this file and `TASKS.md` updated, then commit the handoff.

## Latest completed work

- Repository documentation redesigned for sequential, single-agent delivery.
- Added an explicit project-state ledger, task dependencies, completion gates, and reusable handoff prompts.
- No application dependencies, source code, database schema, or credentials have been added.

## Handoff template

Copy this block under a dated entry whenever work pauses or ends:

```md
### YYYY-MM-DD — T#
Status: [~] active/paused | [x] done | [!] blocked
Files changed:
Checks and real calls:
Result:
Remaining work:
Exact next step:
Blocker:
Commit:
```

### 2026-10-30 — T0
Status: [~] active
Files changed: PROJECT_STATE.md, TASKS.md
Checks and real calls: Read README.md, PROJECT.md, ARCHITECTURE.md, PROJECT_STATE.md, TASKS.md, and DECISIONS.md. Confirmed no active task and T0 is the first eligible task.
Result: Claimed T0.
Remaining work: Create and verify the foundation scaffold.
Exact next step: Initialize the Next.js application with strict TypeScript and Tailwind, then add the required folders and environment template.
Blocker: None.
Commit: pending
