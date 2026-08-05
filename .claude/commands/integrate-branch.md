---
description: Merge a coworker/upstream branch into current work using the branch-integrator agent
argument-hint: [branch name, and any "be careful about X" notes]
---

Launch the `branch-integrator` subagent (via the Agent tool, `subagent_type: "branch-integrator"`) to integrate the following branch into current work, de-risking the diff first, resolving conflicts side-by-side, and verifying via tsc/eslint before reporting back which side won each conflict and why:

$ARGUMENTS
