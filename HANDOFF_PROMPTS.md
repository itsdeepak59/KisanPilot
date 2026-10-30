# Handoff prompts

With repository access, the agent instructions should be sufficient. Use these only when you need to start a new agent or ask an agent without access.

## Start or resume a repository agent

```text
Read AGENTS.md and follow it exactly. Read the required project files, inspect PROJECT_STATE.md, pull main, and check git status. Resume the active task if one exists; otherwise claim the first eligible task from TASKS.md. Work as the only active agent. Commit a checkpoint before your context ends. Do not start a second task.
```

## Continue an interrupted task

```text
You are taking over an existing KisanPilot task. Read AGENTS.md, PROJECT_STATE.md, TASKS.md, DECISIONS.md, and only the files named in the latest handoff. Resume the active task from the exact next step. Keep its status [~] until it is actually complete. Do not redo completed work or begin another task.
```

## Ask an agent without repository access

```text
You are helping build KisanPilot, a voice-first multilingual agritech decision agent. Follow these rules: live API and real database data only; no mock, sample, placeholder, or invented values; no chemical dosage advice; TypeScript strict; every external call needs timeout, retry, try/catch, and typed result; do not add dependencies without a dated decision.

Task: [T# and title]
Project state: [paste current PROJECT_STATE.md entry]
Relevant architecture: [paste only relevant ARCHITECTURE.md section]
Relevant code: [paste files]

Return only the smallest changed files with paths, a short verification plan, and a conventional commit message. Do not alter unrelated files.
```

## Debug a real failure

```text
KisanPilot task: [T#]
Expected behavior: [expected]
Actual behavior: [actual]
Full error: [paste]
Relevant files: [paste]

Find the smallest safe fix. State the cause in two sentences, return only changed files, and provide the exact verification step. Preserve live-data rules and do not rewrite unrelated code.
```

## Checkpoint before an agent limit

```text
Do not start new work. Update PROJECT_STATE.md and TASKS.md now with the exact files changed, commands and results, uncommitted changes, remaining work, blocker, and the next command. Commit this checkpoint using a conventional message, then stop.
```
