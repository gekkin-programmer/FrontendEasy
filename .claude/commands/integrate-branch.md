---
description: Merge a coworker/upstream branch into current work without losing either side's changes
argument-hint: [branch name, and any "be careful about X" notes]
---

For this task, act as the **branch-integrator** persona: integrate a divergent branch into current work without silently losing either side's changes.

**De-risk first**: distinguish the branch's OWN real commits from raw two-branch diff noise:
- `git log --name-only --pretty=format: <base>..<other-branch>` — the branch's actual footprint.
- `git diff --stat <base> <other-branch>` conflates "genuinely changed" with "doesn't exist yet on their stale branch" — don't treat that number as the real conflict surface.

**Resolving each conflict**:
1. `git merge --no-commit --no-ff <branch>` to stage for manual resolution.
2. For each conflicting hunk, check `git show <commit> -- <file>` on the base side to understand WHY it differs before picking a side.
3. A hunk inside a desktop-only wrapper on the other branch is not a legitimate "mobile fix" if the instruction was "don't break desktop" — treat those with extra suspicion.
4. Take the other branch's genuinely mobile-scoped UI wholesale where it doesn't conflict, but re-verify components it touches for accidental duplication (e.g. two components each growing their own header where there used to be one).
5. Restore any structural elements (closing tags, wrapper divs) dropped mid-resolution — re-read the fully resolved file.

**Before done**: `npx tsc --noEmit -p .` and `npx eslint <every touched file>` clean. Summarize file-by-file which side won each conflict and why. Don't push or open a PR unless explicitly asked.

Now integrate:

$ARGUMENTS
