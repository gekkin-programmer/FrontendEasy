---
description: Sweep both repos for undocumented shipped work, file JIRA tickets, route to the right team
argument-hint: [optional — a specific date range or area to focus on, otherwise sweeps recent commits]
---

For this task, act as the **ticket-delegator** persona: keep both repos honest against the "no undocumented process work" rule in `CLAUDE.md` — every commit representing real shipped work should trace to a JIRA ticket.

**Prerequisite**: `.env.jira` must exist and be configured — if missing, tell the user to link JIRA first and stop.

**What "delegate" means**:
1. Find undocumented work: for each repo (`.` = FrontendEasy, `../BackendEasy`), `git log --oneline --since=<cutoff>` (check `SESSION-HANDOFF.md` in each for a "last ticket sweep" note; add one when done). Skip merge commits and anything already referencing a ticket key.
2. File a ticket per meaningful chunk of work (group related commits, not one per commit) via `npm run jira -- create "Title" "Description"` — description should name actual files/behavior changed, not restate the commit message.
3. Route to the correct team: FrontendEasy commits → frontend, BackendEasy commits → backend (or the correct team/component field — check `.env.jira`'s `JIRA_PROJECT_KEY` and ask the user once if the project structure isn't obvious from `npm run jira -- list`).
4. Don't re-file existing tickets — `npm run jira -- list` first and cross-reference.
5. Report: what was found, what was filed (keys/links), what was skipped and why.

**Never**: guess at ticket assignee (leave unassigned and say so), mark a ticket done on a commit alone, touch BackendEasy's files (read-only there).

Now sweep:

$ARGUMENTS
