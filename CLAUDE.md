# FrontendEasy — Project Instructions

Next.js 15 App Router frontend for Eazlypost/EazyPost. Backend (`BackendEasy`, NestJS + Prisma) lives as a sibling folder on this same machine — read its source directly for contract questions rather than guessing (see `.claude/agents/backend-liaison.md`). Session-to-session context (current branch state, open follow-ups, gotchas) lives in `SESSION-HANDOFF.md` (gitignored, not committed) — check it at the start of a session, keep it updated at the end of significant work.

## Process changes require a JIRA ticket — no undocumented work

**Any change to how work gets done** — CI/CD pipeline changes, new/modified subagents or slash commands, tooling scripts, cross-repo conventions, standards documents like this one — must have a corresponding JIRA ticket, referenced in the commit message and PR description (e.g. `Refs FE-123` or `Closes FE-123`).

This does **not** apply to routine feature/bug-fix work (a UI tweak from a Page Feedback batch doesn't need a ticket) — it applies specifically to *process* changes: anything that changes a workflow, a standard, or how the team/agents operate. When in doubt, ask rather than skip it.

- Create the ticket first: `npm run jira -- create "Title" "Description"` (see `.env.jira.example` for one-time setup).
- Reference its key in the commit and PR.
- If JIRA isn't linked yet in this environment, don't skip documentation entirely — note the change in `SESSION-HANDOFF.md`'s "Open follow-ups" and retroactively file the ticket once JIRA access exists.

## Verify before every commit

`npx tsc --noEmit -p .` and `npx eslint <touched files>` clean (0 new errors; pre-existing warnings in touched files are fine to leave) — this has caught real bugs this project, not just style noise.

## Standing conventions

- Rubik font only (`font-sans`) — never Poppins/Roboto/other Figma-spec fonts.
- Brand colors: white / `#040028` (navy — this is what "black" means in design feedback) / `#174CD2` (blue).
- Cap vertical section padding around 48–96px.
- No `Co-Authored-By` trailer in commits for this project.
- User inspects UI issues with their own tool (Page Feedback format) — don't ask them to describe/screenshot, find the exact element yourself.
- Never use `mcp__claude-in-chrome__*` browser tools unless told to in that specific turn.
- `.env.local.bak` in the repo root is untracked and not created by any AI session — leave it alone.

## Agents and commands

- `.claude/agents/`: `ui-feedback-fixer`, `branch-integrator`, `backend-liaison` (more may be added — check for new ones added under the JIRA-ticket-for-process-changes rule above).
- `.claude/commands/`: `/fix-feedback`, `/integrate-branch`, `/check-backend` — each launches its matching agent directly.
- `scripts/jira.mjs`: minimal JIRA REST API v3 CLI (create/list/comment/done/open). Credentials in gitignored `.env.jira`.
