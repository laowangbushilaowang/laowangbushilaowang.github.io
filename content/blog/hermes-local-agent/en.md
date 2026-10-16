---
title: "Connecting a self-hosted Qwen to Hermes"
excerpt: "A setup note on model APIs, browser dependencies, reasoning routes, and separating main tasks from auxiliary requests."
language: "en"
date: "2026-10-09"
publishedAt: "2026-10-09T12:03:17Z"
updated: "2026-10-16"
project: "hermes-local-agent"
tags: ["Hermes", "Qwen", "llama.cpp", "Agents"]
---

I already had a self-hosted Qwen connected to coding clients when I saw a demonstration of Qwen with Hermes. I wanted to try the combination, particularly its browser and Computer Use tools.

This note covers setup work during August and September 2026. I used Codex to migrate the service, adjust routing, and check the integration. Hermes, Qwen, and llama.cpp are open-source components; the deployed GGUF was also a third-party modified and quantized model.

## Connect the tools as well as the model

Hermes ran on my Mac, while `llama-server` served the model on a GPU machine through a custom router. The model generated replies or tool requests. Hermes dispatched the tools, returned their results, and continued the conversation.

The tool environment was a separate concern. Having a browser available to Codex did not make it available to Hermes. Hermes needed its own Python, Node, and browser dependencies. This installation screenshot shows the Python environment ready while browser-tool installation was still in progress.

![Actual Hermes browser-tool dependency installation](/images/hermes/hermes-tool-dependencies.webp "Cropped from the September 1, 2026 installation, excluding private logs on the right. It shows separate dependency preparation, not a completed installation or a performance comparison.")

Client compatibility needed separate checks too. The model exposed an OpenAI-compatible API; Claude Code used a compatibility gateway, whereas Hermes used its own provider configuration. A working connection in one client did not validate the other.

I checked two parts of the tool path. All four routing aliases returned structured `tool_calls` for `add_numbers(19, 23)`. A separate Hermes terminal test actually executed `pwd`; the tool returned successfully, and the model relayed the working directory to the user.

The first check established that the model could request a tool in the expected format. The second reached execution and result return. Neither established reliable long tasks, recovery, or general browser operation.

## Four aliases sharing one model

The router exposed four policies for the same weights:

| Alias | Setting at the time |
| --- | --- |
| `qwen-fast` | Thinking disabled |
| `qwen-standard` | `medium` reasoning |
| `qwen-deep` | `xhigh` reasoning |
| `qwen-auto` | Rule-based selection |

They shared the model service. Another alias did not provide more compute.

An early Auto rule tended to select Deep whenever a tool result appeared anywhere in the conversation history. Agents read files and run commands frequently, so that condition soon became true. The later code examined the current user task and its newest batch of tool results instead. Routine successful calls could return to Standard; current errors, verification review, and the first evidence review for a complex task could still use Deep. This was request-routing logic, not a separately trained classifier.

Hermes had a different meaning of Auto. Its [auxiliary model configuration](https://hermes-agent.nousresearch.com/docs/user-guide/configuring-models) could inherit the main model when no override was set. Selecting Deep for the conversation could therefore send title generation and command-approval requests through Deep too. This deployment had one inference slot, shared by those requests.

I kept local Standard for the main task and moved approvals to an independent Codex Spark model on September 3. That made it a hybrid setup: approval requests left the local model service. Titles, compression, and all the other auxiliary tasks were not fully reassigned, and I did not complete an A/B measurement of total latency.

What helped was breaking down the vague symptom that “the agent is slow.” Which request was reasoning—the main task or an auxiliary job? Was it generating or waiting for the single slot? Each alias had only one timing sample, and Deep even finished faster than Standard in that set. Ranking them from those measurements would have been misleading.

## Check context and connectivity layer by layer

The server was configured for 262,144 tokens, but Hermes initially declared that capacity only for Auto. I added the declarations for all four aliases and enabled the tool-loop hard stop for repeated failures or calls without progress. This was a configuration capacity, not a quality test at a full window.

Context also consumes GPU memory. Weights share the budget with KV cache and runtime buffers. A larger window or more concurrent requests requires another resource estimate; changing one slot to two does not establish two sessions with the previous capacity and speed. Earlier compression and further auxiliary-task separation remained recommendations at that point.

Connection failures needed a different set of checks. In one investigation, health and model-list requests succeeded on the model host while the external gateway timed out. An earlier Open WebUI investigation also found an empty model picker despite a successful direct request. A 502 through the proxy was a useful clue, but that record did not include a complete verified UI repair.

My diagnosis order became a minimal request on the model host, the same path from the client, then the tool loop. Crossing one extra layer at a time helped locate the failure. After the minimal request works, a longer task can show where the workflow stops. A tool failure, exhausted context, and a broken connection need different responses.
