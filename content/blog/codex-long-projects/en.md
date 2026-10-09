---
title: "AGENTS.md and project handoffs"
date: "2026-10-09"
updated: "2026-10-09"
language: en
project: codex-workflow
excerpt: "What belongs in AGENTS.md, where to keep progress, and how a new session finds the work to continue."
tags: [Agents, Codex, Context, Filesystem]
draft: false
---

When I continue a project in a new Codex session, I want it to establish the project's conventions and find the work in progress. I keep durable instructions in AGENTS.md and maintain a separate handoff for the current task.

I arrived at this arrangement through revisions across several projects. I set the requirements and reviewed the scope of the changes; Codex helped implement and check the files. These days, I care more about whether an instruction makes the next action clear than whether the management directory looks complete.

## What I put in AGENTS.md

I keep recurring requirements here, especially things that are easy to get wrong: where new files belong, where to start when resuming work, and when to update the handoff.

“Keep the project tidy” leaves a lot to interpretation. “Before creating a file, check whether an existing project directory already has a suitable location” gives the agent something to do at a particular moment. These are shortened versions of instructions in my project entry points:

- Keep new files in the relevant project or task directory. Reuse a suitable existing location.
- Consult the context entry point when resuming old work, switching tasks, or lacking background. For a small, well-scoped change, start with the relevant files.
- Update the existing handoff after meaningful progress. Include the verification time, blockers, and next action.

Each instruction has a trigger. The agent can apply it when creating a file, picking up a task, or finishing a piece of work. Details such as which experiment is running and what blocked yesterday's attempt go in the task handoff. Otherwise, every change in progress would require an edit to the project rules.

If I were starting an AGENTS.md today, I would begin with one mistake I had repeatedly corrected and specify when the instruction applies and what to do. A document that tries to cover everything at once is harder to maintain.

## Where progress belongs

Long projects accumulate abandoned plans. A new session needs to find the plan currently in use and the result to inspect next. The full history can wait until a question calls for it.

I give the files separate jobs:

| File | What I keep there |
| --- | --- |
| AGENTS.md | Durable project conventions and pointers to specialized instructions |
| README or context index | The current task's entry point and locations of relevant material |
| HANDOFF.md | The goal, current progress, blocker, next action, and acceptance conditions |

The handoff links to the original code, notebooks, and results. I keep those materials in their existing directories so that the next session opens the maintained source.

“Experiment finished” needs more detail. Training may have ended while evaluation is still pending. Exporting a figure does not mean it has been checked. I record what actually finished and leave unchecked parts visible. That helps the next session decide whether to inspect a result or complete a missing check.

## Reading depends on the task

In AIQuant, the root instructions point to separate notebook and cleanup procedures. Notebook work opens the notebook instructions; cleaning up data or reports opens the retention rules.

The root file provides directions. A button-label change can start at its component. Resuming a paused research task calls for the handoff and the relevant experiment. They need different amounts of background.

I still check which task Codex identified and which result it intends to use. Having a file on disk does not establish that a session read or understood it. When working remotely, I also ask it to read the remote project's own instructions; a local entry point cannot replace them.

## Check which project owns a directory

During a workspace cleanup, the outer project's context directory ended up inside a nested Hermes project. The files could be written and the links could be opened, but resuming the outer task led into a separate project's records.

We moved the outer handoff back into its own directory and kept Hermes's entry point separate. Since then, I check whether a nested directory belongs to the same project or simply happens to be stored underneath it.

My top-level index points to project entry points. Each project maintains its own progress. Keeping a second live summary in the index would add another version to synchronize.

## Small projects can use fewer files

If a README and one handoff already locate the work, I keep using them. I add task directories when several ongoing tasks need separate records. Decision logs and event files appear when needed, rather than as empty placeholders.

Reusable procedures can live in Skills. A task handoff records what is missing and what to do next; a Skill can maintain the general method for checking a download, for example. My context-initialization Skill is limited to new projects or missing or broken entry points. Routine resumption uses what already exists.

I have not run a controlled comparison of resumption time or task success. This is the organization I currently use. Maintaining it means checking whether the handoff still describes the next action, retaining links behind older conclusions, and checking live state again when execution depends on it.
