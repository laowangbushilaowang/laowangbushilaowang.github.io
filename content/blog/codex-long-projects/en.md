---
title: "File-based management for long-running agent projects"
date: "2026-10-09"
updated: "2026-10-09"
language: en
project: codex-workflow
excerpt: "Organizing project instructions, handoffs, and state records so a new session can find the task it needs to continue."
tags: [Agents, Codex, Context, Filesystem]
draft: false
---

A project directory contains code, yesterday’s results, and approaches abandoned a month ago. When I open a new Codex session, I need it to find the current task before reading its supporting material. Keeping the files is only part of making the work resumable.

During a review of my context setup in September, I asked what had changed in each project and whether those changes could make things worse. The follow-up questions were concrete: where do the rules live? Which files get replaced, which keep growing, and where does a new session start reading?

Those questions shaped the file conventions I now use across research, data workflows, and personal tools. I set the requirements and reviewed the changes; Codex implemented them. This post explains how the files work together and where the arrangement still needs care.

## Separating project rules from task state

AGENTS.md holds requirements that apply over time: how to compare experiments, where new files belong, and which operations require a separate guide. A task handoff records the work in progress. They change at different rates. Mixing them makes a reader search through standing instructions for the latest task state.

A project with several ongoing tasks can use the structure below. It abbreviates the existing conventions and omits business files; a small project does not need every file shown here.

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

The context README locates tasks. HANDOFF.md describes the current handoff, while APPROVED_PLAN.md and decisions.md preserve approved scope and decisions. notes.md holds issues needing human attention. An automated observer, where one exists, maintains state.json and events.jsonl.

Notebooks, data, models, and figures stay in their project directories. The handoff points to them. Copying the originals into a context folder would leave another set of files to keep synchronized.

AIQuant provided a practical reason to shorten the root instructions. Its rules had grown long, with detailed procedures for notebooks and cleanup. We moved those procedures into separate documents and kept pointers in the root file. A relevant task reads the procedure; an ordinary source edit follows the root rules.

The entry instruction also makes reading conditional:

```text
When resuming a task, changing the main line of work, or missing background,
read .context/README.md as needed.
A clearly scoped small edit does not require a full context read.
```

Existing directories take precedence. If a README and one handoff are enough for a small project, I would rather use those than maintain several empty files.

## Replacing current state and appending observations

Different records need different update rules. HANDOFF.md should let the next session reach the current problem quickly. events.jsonl keeps successive observations. A decision’s rationale must survive later progress updates too.

The research observer writes in this order. This excerpt omits the content-generation details but retains the implementation’s variable names:

```python
with (dest / 'events.jsonl').open('a') as stream:
    stream.write(json.dumps(result, ensure_ascii=False) + '\n')
    stream.flush()
    os.fsync(stream.fileno())

atomic(state, json.dumps(result, ensure_ascii=False, indent=2) + '\n')
# text is the handoff summary generated from the same result
atomic(dest / 'HANDOFF.md', text)
```

It journals the observation before replacing current state. If a later replacement fails, the journal retains that observation. The replacement helper is small:

```python
def atomic(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(prefix='.' + path.name, dir=path.parent)
    try:
        with os.fdopen(fd, 'w') as stream:
            stream.write(text)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)
```

The temporary file is created in the destination directory and replaced after writing. The observer’s write entry also uses a file lock to prevent two observer processes from updating the same handoff concurrently. Human judgments belong in notes or decisions; editing generated text would risk losing them on the next run.

There is a remaining limitation: state.json and HANDOFF.md are replaced separately. An interruption between the two can leave different versions. Atomic replacement of one file does not make both updates a transaction. When resuming, the observation times still need checking. If the summary and state disagree, the matching journal record provides a way to investigate.

## What a new session needs to read

For a resumed task, the reading path starts with the project and current question, follows its existing entry to the handoff, then reaches the material needed for the next action. Detailed history becomes useful when explaining a decision. Understanding why a sampling approach was dropped calls for its experiment and reasoning; a clearly scoped UI fix usually does not.

A handoff needs the goal, current phase, recent findings, missing information, next action, and acceptance conditions. Important conclusions carry a verification time and a pointer to the original material.

“Training is fine” leaves too much unstated. A live process, an increasing epoch count, and a passed evaluation support different conclusions. The observer compares phase, epoch, checkpoint, and task counts, and warns when it sees no measurable progress. Missing critical input or a partial JSON file leads to an unverified status.

Its output explicitly includes:

```python
'scientific_acceptance': 'not_assessed_by_observer',
'visual_acceptance': 'not_assessed_by_observer',
```

The observer reports the runtime state it can read. Scientific conclusions and figures require their own checks. I do not want the next session to treat a running process as permission to skip evaluation or figure review.

An entry file’s existence also does not prove that a new session read the right material. During actual resumption, the task and result it found need checking. For a remote project operated from a local session, its remote instructions must be read as well.

## Nested directories and project ownership

One review found that the outer workbench had been using a context directory inside Hermes as a general workspace, even though Hermes was a separate project nested beneath it.

Writing a file there worked, which concealed the problem. Resuming from the outer project would mean looking for its handoff inside another project, while Hermes would accumulate unrelated records. We moved the outer handoff into the outer project and kept Hermes’s entry separate.

The cross-project index therefore stores boundaries and entry points. It does not mirror every project’s changing state. With nested repositories, the actual project root must be established before choosing a destination. Reference code also retains its original authorship when it sits in my workspace.

Backups introduce a second version problem. A file may have changed since the backup was made. The migration records retain checksums of the post-change versions so they can be compared before restoration. A changed current file needs a merge rather than a blind overwrite.

## Reusable procedures in Skills

Skills hold procedures that recur: their scope, inputs, outputs, and checks. The handoff keeps the progress of this particular task in its own project.

Context initialization has a Skill too, but its scope was narrowed to new projects or missing or broken entries. When a README, handoff, or state generator already locates the task, it stays in use. This avoids creating another supposed source of current state on every resumption.

Notebook editing, data downloads, and service troubleshooting need different procedures. They do not have to become one universal workflow. The directory structure grows with actual tasks; empty folders can wait.

## The cost of keeping handoffs current

The review checked files, entry points, backups, and the scope of changes. It did not include a controlled comparison of task success rates or resumption time. The file organization and update ownership are inspectable; their usefulness still has to be judged during real work.

A stale handoff can mislead. An enabled observer configuration still needs evidence that it triggered and read valid state. An old snapshot can locate a lead, but runtime state needed for the next action must be checked again.

I continue to use these files, with attention to making each conclusion’s source, time, and unresolved questions easier to find. Before adding another document, I check whether an existing file already serves that purpose. Otherwise, a future session will first have to decide which of two “current handoffs” counts.
