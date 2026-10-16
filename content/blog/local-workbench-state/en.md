---
title: From local scripts to a private Web workbench
date: '2026-10-09'
publishedAt: "2026-10-09T12:35:31Z"
updated: '2026-10-16'
language: en
translationKey: local-workbench-state
project: private-workbench
excerpt: Bringing orders, queries, execution, and archiving into one interface, with enough context to understand progress, failures, and retries.
tags:
  - Python
  - JavaScript
  - Codex
---

The first version was a local subscription-management tool. I could prepare inputs on a Web page, run a script, open a browser, and query the result. The individual functions existed, but using them still meant moving between pages.

Adding an order backend made the gaps more obvious. The backend knew which order I was handling; the execution page needed the inputs again. A script could finish while the screen still showed progress from the previous attempt. I had to keep the pieces aligned myself.

I wanted a private workbench that carried a task from its order through execution, readback, and archiving. I had looked at the open-source [chatgpt-specimen-toolbox](https://github.com/1837620622/chatgpt-specimen-toolbox) early on. I supplied workflow requirements, layout choices, and feedback from use; Codex helped implement and check the changes. This post covers the general engineering decisions.

## Connect the whole task

One of my requests was to review the process from the backend through archiving. Where could I remove another copy-and-paste or another page to find?

Selecting an order should carry its context into execution. Frequently used information should be easy to copy. Queries, execution, and archiving need their own controls, with one step's output available to the next.

The operator's path has four parts:

1. **Select an order** and establish the current task and inputs.
2. **Check and execute** the relevant operation.
3. **Watch progress and inspect the result** beside that task.
4. **Finish up** by reading back external state and archiving as needed, with a separate path for manual handling.

The page handles selection and display. The backend stores records, while a local executor runs scripts or a browser. A request can return before the work has finished, so I placed live progress beside the order.

```text
Web page: select a task, start work, inspect progress
                         ↓
Backend: order records and task state
                         ↓
Local executor: script / browser
                         ↓
Read back the result → update the task → archive as needed
```

*An overview of responsibilities; the business-specific steps are omitted.*

Keeping the selected order attached to its inputs and results was the useful change here. If I still had to remember which order a result belonged to, the pages were not connected well enough.

## Progress should explain a failure

A spinner looks much the same after ten seconds as it does after a minute. I wanted to know what it was waiting for: had the local task started, was an external request pending, or had the final query failed?

I asked for status and errors at each stage, next to the current order. A failed manual query also needed a visible response in the query panel.

![Current order and stage-by-stage progress in the workbench](/images/projects/private-workbench/query-replay.webp)

*Actual interface components replayed with synthetic test data. The order, timestamp, and HTTP 503 are fixture values; all mutations are disabled. The first stage fails and later stages remain pending.*

The query result is on the left and execution progress on the right. The layout shows where work stopped and which stages have not run. Detailed errors belong in this private workbench; the external-facing page only needs the relevant status.

A subtler problem occurs when a query fails and a background refresh restores an earlier successful snapshot. Keeping an old result is useful, provided it remains clearly old. Automatic refresh must not erase the latest query error.

Manual handling also remains available. I may complete an operation outside the page, then return to check and update the record. An administrator marking an order successful and a program verifying completion have different meanings. A database `success` value alone cannot establish that every stage ran automatically.

## Retries need an identity; Stop needs an acknowledgement

I repeatedly reported progress from the previous run remaining lit when I started again. An order can have several attempts, so its order ID cannot identify the progress currently on screen.

Three identifiers cover different changes:

| Change | Identifier | What it prevents |
|---|---|---|
| Switch from order A to B | Page selection version | A's late response appearing in B |
| Run an order again | Execution ID | Old completion lighting up the new attempt |
| Start an explicit query | Query sequence | An earlier poll replacing the new query |

The operator need not see these values. The interface uses them to decide which results still belong on screen. A new attempt follows its own progress; a late response from the previous one cannot complete it.

I also asked for limits on every externally acting button. Within one page, callers can share an identical read already in flight. Concurrent duplicate mutations are rejected. This addresses overlapping page requests; cross-tab or cross-process duplicates require backend handling too.

A running button becomes its own Stop button. Clicking it ends the page's wait and asks the local executor to stop the matching task. The controls remain busy until that request is acknowledged, so another attempt cannot start while the previous one is still being stopped.

**Stopping a local worker cannot recall a request that an external system has already received.** If the acknowledgement fails, the page says that the worker's exit is unconfirmed. Read the original record before deciding whether to retry; a lost connection does not establish that nothing happened.

These timings make useful test cases: delay an old response, cancel before and after worker startup, and check that stopping one task leaves another untouched. A smooth run alone would miss them.

## The directory had to catch up

As functions accumulated, I asked to organize the directory, use Git for versions, and put the working conventions in `AGENTS.md`. Otherwise the next Codex session would have to guess which entry point was active and which files were earlier experiments.

The main project separates these roles:

```text
app.py                     Local Web and backend entry point
chrome_checkout_runner.mjs Browser executor
web/                       Pages and order backend
config/                    Committable configuration examples
runtime/                   Sessions, runtime state, debug files
business_records/          Ledger and receipts
archive/                   Earlier prototypes and debug artifacts
```

Runtime data, business records, and archived debug artifacts have separate locations outside Git. Source updates preserve them. Rolling back code does not mean rolling back newly created records. Configuration examples travel with the code; real configuration stays in the running environment.

The workbench remains private, and browser interactions and external interfaces still need maintenance. This code review is not current end-to-end production acceptance, and I have not measured an automatic completion rate. Its practical purpose is clear to me: open a task and find its inputs, controls, and result together, instead of reconstructing the process across several pages from memory.
