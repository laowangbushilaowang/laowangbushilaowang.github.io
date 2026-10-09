---
title: Cancellation and state readback in a local workbench
date: '2026-10-09'
updated: '2026-10-09'
language: en
translationKey: local-workbench-state
project: private-workbench
excerpt: Cancelling a wait, stopping a local worker, and reversing an external action have different meanings. How a private workbench handles shared reads, execution identity, and stale results.
tags:
  - Web engineering
  - Async workflows
  - Codex
---

An old result can stay on screen after a query fails, provided it is clearly an old result. Trouble starts when a background refresh replaces the error with a saved snapshot labelled “current.” The request is still broken, but the interface has declared victory.

My local workbench brings together orders, account queries, browser execution, and receipt management for private subscription-related tasks. I had a few concrete requirements: show errors beside the relevant stage, limit repeated clicks on every external operation, and let a running button become its own Stop button. They led to a larger question: the page, the local executor, and the external service run on separate clocks. Which one gets to decide what the screen shows now?

I developed the workbench with Codex. I supplied requirements, layout choices, and feedback from use; Codex helped implement and check the changes. This post covers the general engineering decisions.

## Where cancellation reaches

After a click, the browser may be waiting for a response, a local subprocess may be running, and an external service may already be handling the request.

An `AbortController` can end supported operations such as fetch and response-body consumption. [MDN describes its scope](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort). What the server did with an earlier request is a separate question.

The workbench therefore cancels the page operation and sends another request asking the local executor to stop. That cancellation request needs its own controller. Reusing the aborted signal would prevent it from being sent.

The executor identifies the attempt by `operation_id`. A lock protects both the cancellation marker and process registration. If cancellation arrives first, a later stage cannot start. If the subprocess has started, the executor sends `SIGTERM` to the process group created by this application, escalates to `SIGKILL` if necessary, then checks that it exited. Another operation's process is outside that scope.

The page stays busy while waiting for the cancellation acknowledgement. Otherwise a new attempt could start before the previous worker's exit was confirmed. If acknowledgement fails, the message says that the page stopped waiting and the local worker's termination remains unconfirmed. A green check would be easier to draw, but less useful.

Stopping the local process cannot recall a request that has reached an external service. Read the original record before deciding whether to retry. A lost connection alone does not establish that an action never happened.

## Sharing a read without sharing every wait

A progress poll and a foreground refresh often ask for the same detail URL at almost the same time.

The API wrapper keeps in-flight GET requests in a Map, keyed by method and URL. A second caller receives the same Promise. The entry is removed when it settles. Mutations use a separate set and reject a second concurrent call with the same key.

This handles overlap within one page. It is neither a persistent response cache nor protection against duplicate submissions from another tab or process. The key also omits request parameters and an authorization version. If those vary at the same URL, the sharing rule needs to change.

There is another ownership issue. Suppose a background read starts first and a foreground operation later waits for it. The user stops the foreground operation, but the background consumer still needs its result.

The foreground caller can stop waiting without aborting that existing read. Here is the wrapper used in the project, with the surrounding calls removed:

```javascript
function awaitOperation(value, signal) {
  const pending = Promise.resolve(value);
  if (!signal) return pending;

  return new Promise((resolve, reject) => {
    let finished = false;
    const finish = (settle, result) => {
      if (finished) return;
      finished = true;
      signal.removeEventListener('abort', abort);
      settle(result);
    };
    const abort = () => finish(reject, signal.reason);
    pending.then(
      result => finish(resolve, result),
      error => finish(reject, error)
    );
    if (signal.aborted) abort();
    else signal.addEventListener('abort', abort, { once: true });
  });
}
```

The wrapper settles this caller's wait and removes its listener. It also attaches a rejection handler to the original Promise, even if that Promise rejects after cancellation. The execution wrapper checks the signal before and after waiting so the next operation cannot be sent.

This assumes the original read was not itself bound to the foreground signal. If the current operation started the fetch with that signal, aborting it can still terminate the underlying request. Sharing a Promise does not automatically change who owns the fetch.

## A late response needs permission to render

Responses can arrive out of order. The page has to remember which selection they belong to.

An operator selects order A and then switches to B before A's details arrive. Cancellation might be too late. Rendering A's response into B's card would still be wrong. The workbench increments `generation` when the selection changes. A read captures the generation at its start and compares it again before rendering.

Two other identifiers handle different changes:

| Identifier | What changes | What it prevents |
|---|---|---|
| `generation` | The selected order | A's details appearing in B's view |
| `operation_id` | A new attempt on an order | Previous execution events appearing as current progress |
| `querySeq` | An explicit user query | An earlier poll overwriting that query |

An order ID alone cannot distinguish attempts. The same order can have an old completed attempt and a new one that has barely started. Applying the old completion to the new progress display would turn the stages green before the new task reached them.

During an active attempt, the workbench uses events matching its `operation_id`. Explicit queries have their own sequence so progress can refresh without replacing the query currently in flight.

These identifiers answer questions about rendering and ownership. None of them establishes that an external action completed.

## Keep a failed query separate from an old snapshot

This is a replay of the actual workbench components. It uses the project's template and scripts, with synthetic read-only responses and every mutation disabled.

![Actual workbench components showing a failed query and an unresolved first stage](/images/projects/private-workbench/query-replay.webp)

*Actual interface replayed with synthetic test data. The order, timestamp, and HTTP 503 are fixture values, not a real transaction or a production incident.*

The left card reports the query failure. The progress card identifies the failed stage and leaves later stages pending. HTTP status and an application error code are displayed separately, so a local error can still explain itself without an HTTP response.

I asked for errors directly beneath the relevant stage because “failed” did not tell me what to do next. Preparation failing, a submitted request with an unknown result, and a failed final readback require different recovery paths. The last two need the original execution record to remain available.

Snapshots require the same care. After the latest query fails, automatic progress refresh must not erase the error with an older saved state. The workbench retains the current query error until an appropriate event clears it: a successful query, a credential change, or an order switch.

The review also exposed a distinction in the success path: an administrator can mark an order successful manually. A database `success` value therefore cannot, on its own, prove that automated execution was verified. The interface retains manual handling, while interpretation of a result also needs its source and verification record.

## Poll around the operator's work

A polling interval decides how often to ask. It does not decide when asking is inappropriate.

The current source checks the order list every five seconds. The workbench timer ticks every 1.5 seconds, with an additional ten-second minimum between idle polls. Visibility, a closed panel, another refresh, and an explicit query can make it skip a tick. Unchanged list data is not redrawn. A transient failure retains the list; an authentication failure clears the private view.

I have not measured the full latency or server-load effect of these choices. They are scheduling rules, not a quantified performance improvement.

Regression checks can put awkward timing under control: a read resolving after Stop must not trigger another write; controls must remain locked until cancellation is acknowledged; old progress must not replace a new attempt; and an old snapshot must not erase the latest query error. Local worker tests also launch a temporary sleep subprocess, confirm that cancellation stops it, and check that another operation is untouched. These checks passed during this review.

The review found a weakness in the tests as well. An uncommitted polling test extracts code by string position. A function had been renamed and the timer moved to the end of the file, so its four admin cases failed to register the timer. That does not establish broken product polling, and it does prevent claiming a completely passing suite. Extracting the asynchronous logic into importable modules would be more reliable than repeatedly repairing substring anchors.

## After the process restarts

The local process registry and cancellation markers are in memory. They control the current run; recovery after a process restart needs a separate persistence design. Blocking repeated clicks in the browser also cannot replace server-side idempotency.

I would store execution history separately from external-action results. An attempt has its own start, finish, cancellation, and timeout. An external action needs its own request identity and readback result. After a restart, unresolved records should be reconciled before another attempt begins. Cancellation markers also need an explicit retention period. Multiple-tab and restart tests would follow.

This review did not execute real payments or validate a cloud workflow end to end. The next case I want to test is a restart after a request has been sent: close the page, restart the executor, then find the original record when returning. Browser-side identifiers alone cannot resolve that case.
