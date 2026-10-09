---
title: "Routing inference for a local agent"
excerpt: "Connecting Qwen to Hermes exposed a resource allocation problem: main tasks and small auxiliary requests can share both a reasoning policy and a busy inference slot."
language: "en"
date: "2026-10-09"
publishedAt: "2026-10-09T12:03:17Z"
updated: "2026-10-09"
project: "hermes-local-agent"
tags: ["Hermes", "Qwen", "llama.cpp", "Agents"]
---

After switching a Hermes conversation to `qwen-deep`, I found that its auxiliary requests were using Deep too. Generating a title and deciding whether to allow a tool command could inherit the same inference route as the main task.

The local server had one inference slot. Main and auxiliary requests shared it, so a short request could wait behind a long one. A title might contain only a few words while taking substantial computation to produce. From the interface, all of this looks like “the agent is slow.” Token generation speed explains only part of the wait.

This post covers a local Qwen deployment and its adjustments during August and September 2026: how its four routes worked, which settings I changed, and where a controlled comparison is still missing.

## Four names, one set of weights

The environment used `llama-server` to load a Qwen GGUF model. A custom routing layer exposed `qwen-fast`, `qwen-standard`, `qwen-deep`, and `qwen-auto`. Hermes managed the agent loop, while terminal and browser tools ran in their execution environments. I used Codex to configure, migrate, and check the setup. Hermes, Qwen, and llama.cpp are third-party components.

The four aliases selected different request policies for the same weights. Fast disabled thinking, Standard used `medium`, and Deep used `xhigh`; Auto chose a mode through rules. An extra model name did not provide another GPU or an independent inference process.

Two meanings of Auto were easy to confuse. The custom `qwen-auto` route inspected a request and selected a mode. An auxiliary task set to `provider: auto` in the Hermes configuration inherited the main model at that time. It did not automatically choose a lightweight model for titles. Hermes' [model configuration documentation](https://hermes-agent.nousresearch.com/docs/user-guide/configuring-models) describes inheritance and explicit auxiliary overrides.

Client compatibility was another layer. An OpenAI-compatible model API did not make every client interchangeable. Claude Code used a compatibility gateway, and a minimal request returned the expected test marker. Hermes had its own provider configuration. Each path still needed checks for request formatting and tool-result handling.

## Rules can keep Auto in Deep

The early Auto implementation did not ask another language model to classify each request. It inspected the requested alias, text, media, and tool information.

Two parts of the August 31 `choose_mode` implementation explain a consequence. This excerpt retains the original conditions and omits unrelated branches:

```python
for message in messages:
    # ... extract role and text ...
    if role == "tool" or contains_tool_result(message.get("content")):
        tool_results += 1

# ... after scanning messages ...
if tool_results or ERROR_PATTERNS.search(latest):
    return "deep", "tool-result-or-error"
```

It scanned the entire supplied history. Once a tool result appeared anywhere in that history, a later request could satisfy the condition for Deep. The code did not distinguish a fresh failure needing investigation from a file read that succeeded several turns earlier.

Agents use tools frequently. A conservative rule could therefore become a persistent preference for Deep. Testing a short question by itself would miss this: the same question with tool-bearing history could take a different route. This describes the early source snapshot, not a new test of today's service.

I would still retain Deep for difficult work. Root-cause analysis and a small text edit have different needs. The [official Qwen model card](https://huggingface.co/Qwen/Qwen3.8-27B-FP8) warns that shallower reasoning can produce more failures and retries, increasing total task time despite quicker individual responses. The useful comparison is whether the task finishes and how much work that takes.

## Separate the main task from auxiliary inference

The September 1 configuration still left titles, approvals, and other auxiliary tasks on Auto. Logs showed auxiliary inference inheriting `qwen-deep`. The server ran with `--parallel 1`, and other training work was active on the machine. These could all affect waiting time; I did not measure their separate contributions.

I later kept local `qwen-standard` as the main model and chose an independent Codex model for approvals. The September 3 records show the final approval setting as `gpt-5.3-codex-spark`. They do not show that titles, compression, and every other auxiliary task were reassigned according to the original proposal.

This was a hybrid setup. Approval requests used another provider, so command information submitted for approval left the local model service. Describing the whole system as entirely local would hide that path.

A separate approval route let me choose a model for that judgment and move its inference off the local single-slot server. It still added a request that took time. I did not complete an end-to-end A/B comparison or measure a latency reduction. An approval classifier also is not an operating-system sandbox: its decision and the executing process's actual permissions are separate matters.

Pinning titles and similar tasks to a lightweight mode remains a useful experiment. It could avoid excessive reasoning on small jobs, but if those requests still reach the same local process, they can still queue. Routing and capacity need to be considered together. The [llama.cpp server documentation](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md) defines `--parallel` as the number of server slots; this deployment had one.

## A tool call is the first compatibility check

A working chat endpoint is followed by several other checks: the model emits a structured call, the framework dispatches it, the tool result returns to the model, and the agent continues toward the requested outcome.

On September 1, a small test supplied `add_numbers` with arguments 19 and 23 to each alias. These are the recorded output summaries with timing and reasoning-length fields removed:

```text
qwen-fast      finish=tool_calls tool=add_numbers args={"a":19,"b":23}
qwen-standard  finish=tool_calls tool=add_numbers args={"a":19,"b":23}
qwen-deep      finish=tool_calls tool=add_numbers args={"a":19,"b":23}
qwen-auto      finish=tool_calls tool=add_numbers args={"a":19,"b":23}
```

All four routes had returned recognizable structured tool requests. They were not merely describing a call in prose. This did not test complex arguments, recovery, or long-task completion. The tool performs the addition; the framework must preserve the name, arguments, and call ID, then attach the result to the correct call.

Each route was tested once under variable server load. Deep even returned faster than Standard in that sample. That is not a useful speed ranking. A comparison needs fixed tasks, completion and retry counts, and total elapsed time, with server waiting separated from generation. Otherwise, the route that happens to find an idle slot gets a flattering result.

The deployed weights also matter: this was a third-party modified and quantized Qwen3.8-27B Aggressive GGUF. Evaluations of the official model cannot simply be transferred to it. The small tool test did not establish the reliability of approval decisions either.

## Context capacity has to agree across the stack

The server's context parameter was 262,144 tokens. Initially, Hermes declared that length only for `qwen-auto`. Similar alias names did not tell the client that the other routes shared the same capacity.

On September 3, I approved adding context declarations for all four aliases and enabling the tool-loop hard stop. The resulting output listed each alias at 262,144 tokens. A static configuration inspection for this article found those values still present. This checks configuration agreement, not quality at a full context window or whether a running session loaded the latest settings.

Context also consumes resources. Beyond the weights, inference needs cached intermediate state and runtime buffers. Larger contexts and more concurrent requests change those requirements. The relationship between slots and per-request capacity needs to be checked for the deployed runtime version. Changing `--parallel 1` to 2 does not by itself establish two sessions with the previous capacity and speed.

Earlier compression around 160K tokens and disabling automatic background review remained recommendations rather than fully applied changes. The hard stop was enabled to handle repeated failures or calls without progress. It cannot inspect every final artifact for correctness: a tool loop can stop reporting errors while producing the wrong result.

## A healthy model can sit behind a broken path

During one check, the model's health and model-list endpoints responded successfully from its own machine while the external gateway timed out. The inference process was answering locally, but the client's path to it was unavailable. Reloading the weights would not necessarily address that failure.

An earlier Open WebUI investigation showed a different mismatch. Its model picker was empty, yet a direct request to the local model endpoint returned a model. Logs showed a 502 when that request went through a proxy; the WebUI process had inherited `HTTP_PROXY` and `HTTPS_PROXY`. Bypassing the proxy for local addresses was the proposed fix. The record lacks a subsequent complete UI verification, so I cannot present it as a confirmed repair.

These incidents give me a concrete order for diagnosis: send a minimal request from the model host, test the same path from the client host, then inspect the agent's tool loop. Cross one additional component at a time. A vague “model connection failed” otherwise bundles proxies, gateways, queueing, and inference into one symptom.

This environment has records of service migration, four-route structured tool returns, and several applied settings. The missing comparison is a set of real tasks with main and auxiliary requests configured separately: how many finished, how many retries occurred, and where the time went. That is the measurement I would make before choosing which part to speed up.
