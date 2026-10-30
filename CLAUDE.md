# KisanPilot agent operating protocol

This repository is shared by one human team and exactly one active AI coding agent at a time. Do not start a second agent, spawn subagents, or make parallel changes.

## Read before touching code

Read these files in order:

1. `README.md`
2. `PROJECT.md`
3. `ARCHITECTURE.md`
4. `PROJECT_STATE.md`
5. `TASKS.md`
6. `DECISIONS.md`

`PROJECT_STATE.md` is the source of truth for what is currently happening. `TASKS.md` is the source of truth for the task plan.

## Choose work without asking the human

1. Pull the current `main` branch and inspect `git status`.
2. If `PROJECT_STATE.md` names an active task, resume only that task.
3. If no task is active, choose the first unchecked task in `TASKS.md` whose dependencies are complete.
4. Mark that one task `[~]` and update the active-task block in `PROJECT_STATE.md` before writing feature code. Commit this claim.
5. Work on only the claimed task. Do not begin another task after it.
6. When done, mark it `[x]`, update the handoff block in `PROJECT_STATE.md` and task notes, then commit the completed work.
7. If the context window is ending, stop safely: leave the task `[~]`, record exact changed files, last command result, remaining step, and blockers in `PROJECT_STATE.md`, then commit the checkpoint.

A task marked `[~]` belongs to the next agent as a continuation, never as a reason to restart or refactor it.

## Non-negotiable product rules

- Use live APIs or data created by real use. Never add mock, placeholder, sample, demo, or hardcoded business data to app code.
- Do not invent weather, mandi prices, soil values, dates, sources, or API responses.
- Use the frozen stack in `ARCHITECTURE.md`. Record any dependency or stack change in `DECISIONS.md` before making it.
- Keep TypeScript strict. Each external call needs an 8-second timeout, one retry with backoff, `try/catch`, and a typed result: `{ ok, data, source, fetched_at }` or `{ ok: false, error, source, fetched_at }`.
- Never log, commit, paste, or expose secret values. Keep `.env.local` untracked and use only the variable names in `.env.example`.
- Preserve the existing folder structure and use small focused functions. Add comments only when they explain why a non-obvious choice exists.
- Do not provide pesticide or chemical dosage. Direct users to local KVK or agriculture officers for that advice.
- Every user-facing factual claim needs a source and timestamp. If data is unavailable, say what is missing.

## Completion gate for every task

Before a task is marked complete:

1. Run the smallest relevant checks already configured by the repository.
2. Test the changed flow with a real call or real database action when credentials are available.
3. Update `TASKS.md` and `PROJECT_STATE.md` with files changed, verification, remaining risk, and the exact next task.
4. Make one conventional commit. Do not leave unrelated changes behind.

If a required credential, service, or product decision is absent, complete everything that does not need it, checkpoint the exact blocker, and ask one precise question. Do not substitute fake data or a fake success path.

This file is intentionally identical in `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md`.
