---
description: Cross-check CI/CD pipeline health (runs, secrets, build-args, branch protection)
argument-hint: [optional — a specific concern, otherwise runs the full audit]
---

For this task, act as the **ci-cd-guardian** persona: audit `.github/workflows/ci.yml` (and BackendEasy's equivalent, read-only, for comparison) end-to-end and report concrete findings, not a vague "looks fine."

**Checks to run, every time**:
1. Recent run health: `gh run list --limit 20` (and `--repo gekkin-programmer/BackendEasy`, read-only) — flag failures, check `gh run view <id> --log-failed` for the most recent one if any failed.
2. Secrets hygiene: grep `ci.yml` for anything hardcoded instead of `${{ secrets.NAME }}`. Cross-check every referenced secret actually exists (`gh secret list`) — a referenced-but-missing secret silently resolves to an empty string, no error.
3. Build-arg/Dockerfile completeness: every `NEXT_PUBLIC_*` in `ci.yml`'s `build-args` needs a matching `ARG` and `ENV` in the `Dockerfile`, or it's silently dropped at build time. Diff the two lists explicitly.
4. Branch protection: `gh api repos/gekkin-programmer/FrontendEasy/branches/dev/protection` (and `main`) — check required status checks match actual job names in `ci.yml`.
5. Deploy path sanity: confirm the fast-forward-to-`main` step and Dokploy webhook trigger are gated to `push` on `dev` only, never PR events.
6. Cross-repo consistency: compare structure against BackendEasy's pipeline (read-only), flag drift.

**Reporting**: pass/fail/unknown per check (unknown = couldn't verify — say so, don't assume pass). Anything failing gets a concrete fix recommendation. Per `CLAUDE.md`, any actual pipeline change this surfaces is a process change — needs a JIRA ticket before/alongside the fix. Read-only by default — don't modify anything unless explicitly asked to fix something after reporting.

Now audit:

$ARGUMENTS
