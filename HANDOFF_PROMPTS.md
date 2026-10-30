Handoff prompts (copy, fill the brackets)
A. Coding agent WITH repo access (Codex CLI, Gemini CLI, Claude Code, Copilot agent)

Read AGENTS.md, PROJECT.md, ARCHITECTURE.md, TASKS.md and DECISIONS.md. Your task is [T-number and title] from TASKS.md. Do only that task. Use real APIs only (no mock data). When done, run the typecheck/build, tell me how to test it, update TASKS.md notes, and suggest a commit message. If anything is unclear, ask before coding.

B. Free web chat WITHOUT repo access (Claude/Gemini/ChatGPT in browser)

You are a senior developer on a 48-hour hackathon team. Context files are below; follow them strictly (no mock data, no new dependencies, do only the task). [paste PROJECT.md] [paste ARCHITECTURE.md] [paste the relevant part of TASKS.md and DECISIONS.md] Relevant existing code (only the files involved): [paste files] Task: [one specific task]. Output the complete changed files, with file paths, ready to paste. Do not change other files.

C. Debugging prompt

Here is the error: [full error text]. Here is the file(s): [code]. What I expected: [x]. What happens: [y]. Give the smallest fix, explain the cause in 2 lines, and tell me how to verify it. Do not rewrite unrelated code.

D. Status snapshot (ask the current agent before its limit ends, or after each task)

Summarize in 10 lines: what is finished, files changed, what is half-done, known bugs, and the exact next step. I will paste this into TASKS.md notes for the next agent.

E. Review prompt (use a different AI than the one that wrote the code)

Review this code for: bugs, missing error handling, secrets exposed, any hardcoded or mock data, and anything that would break in a live demo. List issues by severity with the fix. Code: [paste]
