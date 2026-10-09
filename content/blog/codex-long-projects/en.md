---
title: "AGENTS.md and project handoffs"
date: "2026-10-09"
updated: "2026-10-09"
language: en
project: codex-workflow
excerpt: "Keep lasting rules in AGENTS.md, current progress in a handoff, and read the files the task needs."
tags: [Agents, Codex, Context, Filesystem]
draft: false
---

I separate project conventions from current progress. AGENTS.md holds lasting instructions; HANDOFF.md records the work in progress. A new session starts by finding the current task, then opens the relevant files.

## Make rules actionable

“Keep the directory tidy” is vague. My project entry points specify actions. These are shortened versions of the rules:

- Before creating a file, check for a suitable location in the existing directories.
- Read the context entry point when resuming old work or missing background. Start with the relevant files for a small change.
- After meaningful progress, update the existing handoff with the verification time, blocker, and next action.

Each rule says when to do something and what to do. Experiment versions and progress belong in the handoff, where they can change without leaving stale state in the project instructions.

## Keep what the next session needs

My handoff records the current goal, completed work, blocker, next action, and links to the corresponding code and results. The originals stay in their project directories.

“Experiment finished” is ambiguous. For example, if training ended but evaluation is pending, record them separately so the next session knows what remains. Check live state again when execution depends on it; an old handoff provides a starting point.

## Read according to the task

AIQuant's root instructions link to separate notebook and cleanup procedures. Notebook edits use the notebook instructions; report cleanup uses the retention rules.

For a small project, I keep using its README and a single handoff. Task directories become useful when several tasks need separate records. Reusable procedures go into Skills. Remote work reads the remote project's own instructions.
