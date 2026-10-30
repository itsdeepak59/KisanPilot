Instructions for any AI coding agent working on this repo

(Codex reads AGENTS.md, Claude Code reads CLAUDE.md, Gemini CLI reads GEMINI.md — they are identical copies.)

Read first, in this order
PROJECT.md 2. ARCHITECTURE.md 3. TASKS.md 4. DECISIONS.md
Rules
Do ONLY the task you were given (a T-number from TASKS.md). Do not refactor or touch unrelated files.
NO dummy, hardcoded, mock or placeholder data in app code. Real APIs/DB only. This is a disqualification rule.
Do not add dependencies or change the stack without writing the reason in DECISIONS.md.
TypeScript strict. Small functions. Every external call has a timeout, a try/catch and a typed result {ok, data|error, source, fetched_at}.
Never print, log or commit secrets. Use the env var names in ARCHITECTURE.md. Keep .env.local out of git.
Write short comments explaining WHY, because both humans must explain every file to judges.
Match the existing file structure and naming. Keep UI consistent with shadcn/ui + Tailwind.
Before finishing: run build/typecheck, test the feature with a real call, then update TASKS.md (mark status + 2-3 lines of notes: files changed, how to test, known issues) and give a conventional commit message.
If something is ambiguous, ask the human. Do not guess requirements.
If you are about to run out of context/limit: stop, update TASKS.md notes with exactly where you are, and tell the human what to commit.
