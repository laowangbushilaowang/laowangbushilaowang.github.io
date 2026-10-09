---
title: "How file structure helps agents understand a project"
date: "2026-10-09"
updated: "2026-10-09"
language: en
project: codex-workflow
excerpt: "Separate project rules, current work, and historical results so an agent has a clear path to the context it needs."
tags: [Agents, Codex, Context, Filesystem]
draft: false
---

A long-running project contains more than code. It also contains results from earlier experiments and decisions that have since changed. When an agent picks up the work in a new session, it needs to establish which task is active and which instructions and results apply.

I use files to make those relationships explicit. A project entry point identifies the task. Its handoff describes the current state and links to the relevant code or results. The purpose is to help the agent choose what to read before opening a large collection of historical material.

A misplaced directory during a workspace cleanup with Codex shows why the conventions need to be quite specific.

## Directory ownership determines which rules apply

During one workspace cleanup, the outer project's context directory ended up inside a nested Hermes project. Hermes had its own entry point, but that directory had been treated as a shared workspace for the outer project.

Writing files still worked. Links could still exist. The problem would surface when resuming the outer project: its handoff lived inside a separate project, whose records now also contained unrelated work. A successful write did not establish correct ownership.

The correction gave the outer project its own context directory and kept Hermes's entry point separate. **An entry point needs to establish the project boundary.** Nesting describes where directories are stored; it does not make their tasks or rules interchangeable.

My top-level index therefore stores boundaries and entry points. Each project maintains its own current handoff. Copying live progress into the index would create a second place to update—and another version for the next session to reconcile.

## Separate current work from its history

Project rules and task progress change at different rates. An experimental comparison policy might remain relevant for months. A blocker can disappear after one run. Mixing them in a growing document makes the reader work out which passages are still current before acting.

I keep durable requirements in `AGENTS.md` and current work in a task handoff. A project with several ongoing tasks can use a structure like this. Names are abbreviated and business files are omitted; a small project does not need every file shown.

```text
project/
├── AGENTS.md
├── README.md
└── .context/
    ├── README.md
    └── tasks/
        └── task-id/
            ├── HANDOFF.md
            ├── APPROVED_PLAN.md
            ├── decisions.md
            ├── notes.md
            ├── state.json
            └── events.jsonl
```

`HANDOFF.md` puts the current problem within reach. `APPROVED_PLAN.md` retains the agreed scope. Important decisions, their reasons, and links to their sources belong in `decisions.md`. Only tasks with an automatic observer need its `state.json` and `events.jsonl`; human follow-up goes in `notes.md` so a generated update does not overwrite it.

The handoff changes as work progresses. Observation events are appended. When a proposal is abandoned, its reason and result remain traceable. That gives a later session a way to check why it was dropped before trying the same experiment again.

Notebooks, data, and figures stay in their existing business directories. Context files link to them. Copying results into the context directory would introduce another version to maintain, including the familiar problem of two different files both claiming to be final.

## Give the agent a reading path

Once files have separate jobs, the agent needs conditions for reading them. To resume an old task, follow the existing README or active-work entry point to its handoff, then open the material needed for the next step. Search the history when a decision needs explaining.

This makes the structure useful for selecting context. A specific UI fix may need only the relevant component. Resuming an experiment requires its current identity and results. Loading the same full history for both tasks adds material that may have no bearing on the work.

Several project entry points retain this condition, translated here:

```text
Read .context/README.md as needed when resuming an old task,
switching the main line of work, or lacking context.
A small, well-scoped change does not require a full read-through.
```

AIQuant once had a long root instruction file, with detailed notebook and cleanup procedures. Those procedures were moved into dedicated documents, leaving their triggers and links at the root. Notebook work reads its specific instructions; an ordinary source edit follows the project rules. The root file can help select the next document without containing every procedure itself.

The presence of a file does not show that a session read it. When work resumes, I still check which task the agent identified and which result it used. For remote work through a local session, the remote project's rules must also be read. The local entry point only provides directions.

## Record the limits of a status observation

“Training is healthy” leaves too much unanswered. A process check establishes that a process exists. An increasing epoch count supports a claim that training is progressing. Evaluation and figure acceptance need separate checks.

The research-task observer compares phases, epochs, checkpoints, and task counts, and records a warning when it finds no measurable progress. Missing inputs or incomplete JSON produce an `unverified` status. Its output also includes:

```python
'scientific_acceptance': 'not_assessed_by_observer',
'visual_acceptance': 'not_assessed_by_observer',
```

Those fields tell the next session what remains to be checked. The runtime was observed; the observer has not accepted a scientific conclusion or a figure. That distinction matters when choosing the next action.

How the observation is written matters too. The implementation appends an event before replacing the current state and handoff. This excerpt keeps the original variable names and omits summary generation:

```python
with (dest / 'events.jsonl').open('a') as stream:
    stream.write(json.dumps(result, ensure_ascii=False) + '\n')
    stream.flush()
    os.fsync(stream.fileno())

atomic(state, json.dumps(result, ensure_ascii=False, indent=2) + '\n')
# text is generated from the same result
atomic(dest / 'HANDOFF.md', text)
```

Writing the event first preserves a record to inspect if a later replacement fails. The `atomic` helper writes and flushes a temporary file in the target directory, calls `fsync`, and replaces the individual destination with `os.replace`. A file lock at the write entry point prevents two observer processes from updating it concurrently.

There is still a gap: `state.json` and `HANDOFF.md` are replaced separately. An interruption between them can leave different observations in the two files. Atomic replacement of one file is not a transaction across both. Recovery still requires comparing observation times and checking the corresponding event.

## Put reusable procedures in Skills

“Check the download next” belongs to a particular task's handoff. How to check completeness and recover from a failed download can live in a Skill used by later tasks. The handoff stays focused while the procedure has a stable maintenance location.

Context initialization has a Skill too. Its scope was narrowed to new projects or repairs to missing or broken entry points. If a README and handoff already locate the task, use them. Reinitializing every time would create another set of state to synchronize.

That is also why I do not require small projects to copy the entire directory structure. A README and one page of handoff can be enough until the work actually needs more.

## Handoffs need maintenance

A clear reading path can still lead to a stale description. Important conclusions need a verification time and a source link. Runtime state needed for the next action must be checked again. Restoring a backup also requires comparing the current version if work continued after the backup was taken.

What I can verify so far is the organization of the files, the observer's write behavior, and the ownership problem that was corrected. I have not measured an improvement in resumption time or task success.

I continue to use these conventions. Before adding a document, I check whether an existing file already serves its purpose. When updating a handoff, I focus on facts and unresolved questions needed for the next action. Every extra file costs something to maintain; reducing uncertainty at the next handoff is what makes the extra page worth writing.
