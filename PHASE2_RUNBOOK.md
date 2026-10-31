# PHASE2_RUNBOOK.md — what YOU do (the agents read AGENTS.md and TASKS.md)

## 0. Safety first (10 minutes)
1. Your zip contained `.env.local` (I did not open it). Treat those keys as exposed to anyone who has the zip. Never zip a project with `.env.local` again; share code only through git. After the hackathon, regenerate the Gemini, data.gov.in, Supabase service-role, Telegram and CRON keys, and update Vercel.
2. Make a rollback point and a work branch:
```
git checkout main
git pull
git tag v1-stable
git push origin v1-stable
git checkout -b improve
git push -u origin improve
```
3. In Vercel -> your project -> Settings -> Environment Variables: make sure all seven variables are enabled for **Preview** as well as Production. Without this, the preview URL of branch `improve` cannot call Gemini or Supabase.
4. Know your emergency exit: in Vercel -> Deployments, you can re-promote an older good deployment to production. Or run `git revert` on `main`.

## 1. Install this update
Copy the files from this zip into your repo root (overwrite AGENTS.md, CLAUDE.md, GEMINI.md, TASKS.md, PROJECT_STATE.md, DECISIONS.md), then:
```
git add -A
git commit -m "docs: add phase 2 plan"
git push
```
Make sure you are on branch `improve` when you do this (`git branch` shows it).

## 2. Run the agents (same as before)
Open one agent in the project folder and type:  `Read AGENTS.md and continue.`
It will switch to `improve`, claim T19, work, test, update PROJECT_STATE.md and commit. When its limit ends, open the next agent and type the same line. Your teammate's first time on the branch: `git fetch` then `git checkout improve`.

## 3. Human steps agents will ask for
- Apply new SQL from `supabase/migrations/` in Supabase -> SQL Editor (agent gives the exact file).
- Add `TELEGRAM_WEBHOOK_SECRET` in Vercel, then register the webhook with the secret (do this in your browser, never paste the token into a chat):
  `https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://kisanpilot.vercel.app/api/telegram&secret_token=<YOUR_SECRET>`
- Re-link Telegram with `/link <device_id>` if the profile table changes.

## 4. Ship in small steps, not at the end
After T19 + T23 pass on the preview URL (open it on your phone), merge:
```
git checkout main
git pull
git merge improve
git push
git checkout improve
```
Then open the production URL and test one full question. Repeat after T21/T22, and after T26. If something breaks, roll back in Vercel first, then fix on `improve`.

## 5. Priorities if time is short
Must: T19, T23, T24 (live demo is 30 of 100 points). Should: T20, T21, T22 (agentic depth is 25 points and technical depth 20). Nice: T25. Always finish T26, because overclaiming in the README or deck costs more than a missing feature.

## 6. Freeze and T18 (you, not the agents)
Set a freeze time tonight. After it, no new features. Tomorrow: 
1. Run `npm run warm` (once T24 exists) so SoilGrids/mandi/weather caches hold real data for your demo place, then rehearse once.
2. Fresh browser profile on your phone and laptop: open the production URL, save a profile, ask in Hindi (voice and text), show the trace panel, run Check alerts now, show the Telegram message.
3. Record 2-3 minutes of the REAL running app (OBS, Loom, or the built-in recorder). Do not present the video as the live app in judging.
4. Check the submission template: problem statement, solution + architecture, live URL, demo video link, public repo with README, 5-7 slide deck link. Open the repo in a private window to confirm it is public and has no secrets.
5. Submit at least an hour early.
