---
title: "AIQuant: keeping an agent research workflow moving"
date: "2026-10-09"
updated: "2026-10-16"
language: en
project: aiquant
cover: "/images/aiquant/chart-iq-market.webp"
coverAlt: "AIQuant market workspace on June 1, 2026, cropped to exclude account status"
excerpt: "Using Skills, files, and a dashboard to connect Codex research with continuous market collection and deterministic experiments."
tags: [Agents, Skills, Data Engineering, Quantitative Research]
draft: false
---

I started AIQuant because I wanted an agent to help research trading strategies: collect news, understand events, connect them to market data, and test the resulting ideas.

Scheduling the work exposed another problem. Prices could update and the dashboard could refresh while the research stood still. Sometimes the agent fetched data that a background collector was already recording, while leaving yesterday's news analysis and derived reports untouched. The next run began by explaining the workflow or repairing inputs again.

I spent a lot of time tightening those boundaries. A research run should leave something the next run can use: a hypothesis, a test, a closed direction, or a specific missing input. Repeating commands was not enough.

AIQuant is a personal project I develop with Codex. I set requirements, change the workflow, and review results; Codex implements tools, investigates sources, and helps diagnose failures. Research expanded into AI and semiconductor theme contracts, with mature crypto contracts also used to test methods. The outcome so far is a research system. No candidate meets the promotion requirements, and live trading and order APIs remain disabled.

## Decide which work needs the agent

The early pipeline could collect news, assign sentiment scores, and backtest a rule. A positive dictionary score did not mean an agent had understood the event. I wanted an explanation of how a paper, export restriction, or corporate partnership could affect the instruments I followed. That requires checking sources and reasoning about the connection.

Reading market rows through a model was wasteful, though. I separated the schedule, the research procedure, and the computation:

| Component | Responsibility in AIQuant |
| --- | --- |
| Automation | Start a scheduled run with its scope and instructions |
| Skills | Explain the research procedure, tool sequence, required outputs, and stopping conditions |
| Python / MCP tools | Collect and transform data, run experiments, generate reports, and expose specific operations |

A Skill does not wake itself up. A dashboard button does not, by itself, start a Codex research session. These pieces have to be connected deliberately.

The Brain workflow uses files for that connection. Programs prepare the material; Codex investigates and writes an event table and notes; programs consume those outputs to build factors and run experiments. The local MCP provides specific preparation, reading, writing, and post-processing tools.

```text
prepare inputs → Codex investigation → structured events → factors / experiments → reports
                         ↑                                                        │
                         └──────── review findings and choose the next question ───┘
```

The agent reads a summary first, then follows the question into the relevant part of the research pack:

```text
codex_research_pack/
├── 00_README.md               entry point
├── 01_today_summary.md        daily summary
├── 02_symbol_profiles.csv     instrument context
├── 03_news_queue_high.csv     priority news
├── 05_macro_events.md         macro events
├── 06_company_events.md       company events
├── 07_science_events.md       science and technology
├── 08_event_memory.md         previous analysis
└── 09_questions_for_codex.md  unresolved questions
```

This is an excerpt of the implemented pack. Its memory is ordinary files, without a separate vector database. Keeping previous analysis apart from unresolved questions helps the next session find what needs work instead of rereading every story.

## Give each Skill an output and a failure path

Initially, I wanted Codex to handle as much as possible, particularly news research that fixed collectors kept missing. The useful division became more specific: programs handle repeatable intake, deduplication, and timestamp checks; Codex investigates missing sources, missed events, and relationships that need interpretation.

News deserved its own procedure. Searching only company names misses policy, supply chains, customer demand, and technical developments. Research has to explain the impact channel and retain original links. A lab result also needs to be distinguished from a product, an order, or a commercial rollout.

Collection should continue from the previous run. Preserve the CSV, deduplicate by ID and URL, add incremental material, and report inserts, updates, and duplicates. Identify missing sources in the recent window. A large news collection still does not establish backtest readiness: a factor needs evidence that its source was available at the simulated decision time. An analysis written later cannot be treated as information known earlier.

Several project Skills cover different parts of this work:

| Skill | Procedure it is meant to preserve |
| --- | --- |
| Brain | Prepare and read the research pack, write events and notes, then post-process |
| News research / aggregation | Fill relevant source gaps, update incrementally, check timestamps and coverage |
| Frontier research | Turn papers, reports, and open-source methods into testable hypotheses with data requirements and a first experiment |
| Strategy full flow | Freeze the strategy definition, choose applicable checks, and retain results and missing stages |
| Data and compute | Reuse the collector and coordinate local cache, remote history, and computation |

Instructions still need checking against actual outputs. In the existing Brain runner, missing event CSV input can leave a next-action message while the outer run returns `succeeded`. I therefore have to inspect the event artifacts and remaining work too. That orchestration gap has not been resolved simply by documenting the desired procedure.

## Collect continuously; let research consume the data

When a background service already records prices, a research task should not start another collector. I repeatedly pushed the workflow back toward reading existing data, updating news analysis, and regenerating the reports derived from it. Otherwise collection happens twice and the research result does not change.

Collection and the browser became separate components. A background process receives WebSocket data and writes recent caches and compact state files. The page reads those outputs. Closing a tab should not stop collection, and polling a local state file every second is different from making a fresh exchange request every second.

Storage follows those responsibilities:

- **Local:** recent hot cache, current state, and small reports needed by the interface.
- **Remote:** long histories and large reports, read by compute through the same shared store.
- Historical features are partitioned by time and instrument in Parquet with ZSTD compression, so research can select its window and columns.

Resolution depends on the question. Daily trends can use coarse bars; order flow, short exits, and stop/target ordering need finer paths. Second-level features are not millisecond data, and a healthy collector today cannot recreate order-book history that was never recorded.

I learned to establish the data requirement before choosing a screening shortcut. If the hypothesis concerns order imbalance in the ten seconds after a clock boundary, a minute bar can erase the phenomenon being tested. Coarse screening saves compute when its proxy still represents the hypothesis. Otherwise the workflow should record why that stage is inapplicable and move to a suitable test.

## Make experiments comparable across runs

As research continued, I kept finding another inconsistency: historical tests, account replay, and shadow observations could share a strategy name while using different rules. I asked for the underlying strategy to remain the same throughout. Changed filters, sizing, exits, or cost assumptions make stage-to-stage differences difficult to interpret.

The workflow now carries a frozen definition across stages. A typical iteration is:

1. **Choose a testable hypothesis.** Review prior results and external methods to avoid renaming a failed idea.
2. **Fix the inputs and rules.** Declare the data window, strategy version, and account assumptions before testing.
3. **Narrow the search progressively.** For bar-compatible methods, screen representative variants before spending more on split validation, accounts, execution, and costs.
4. **Explain the failure.** Missing input, too few samples, cost sensitivity, and mismatched implementations need different responses.
5. **Leave the next action.** Close the direction, wait for data, or register a new hypothesis. Changed rules create a new version.

The code labels the checks L0–L7, but research need not blindly restart at the first stage. What matters is which evidence is missing and which next test can resolve the question. Untouched out-of-sample data cannot also be the data used to tune the same version.

I also had to correct the agent's tendency to reuse attractive returns from older workflows as current results. A single current decision and an admitted-report list address that ambiguity. Historical reports can suggest ideas; they must be tested again under the current procedure. Calling a file `latest` does not establish comparability.

## Use the dashboard to inspect the research

I wanted the interface to explain what had been researched, why a strategy was being examined, whether inputs were stale, and what remained missing. An equity curve alone could not show that.

The early control panel could launch registered research tasks, show logs, and open reports. Chart IQ later separated the strategy radar and market workspace into tabs. Here is the actual strategy view: proximity to a reported trigger still needs to be read alongside validation and degradation warnings.

![Chart IQ strategy radar and explanation](/images/aiquant/chart-iq-strategy.webp "Cropped from the actual June 1, 2026 interface, excluding account status. The red warning says the strategy had deteriorated and its trigger could not be treated as an entry recommendation. This is a historical interface, not current market information.")

The market workspace compares prices, overlays, and research outputs. Market and report updates have separate schedules, and synchronization should preserve the detail being inspected. I encountered a page refresh that closed the details I had just opened; that small interaction bug interrupted the review itself.

![Chart IQ market workspace](/images/aiquant/chart-iq-market.webp "Actual June 1, 2026 interface, cropped to exclude the account area. Instrument cards pair prices with the research status at that time. Click to enlarge.")

Later code also added a background-service interface with timestamps, lag, and missing-input status. Services default to monitoring only; start/stop appears only for tasks supported by a controlled manager. This helps supervise the workflow, but it is not a browser agent with arbitrary control over every research job.

## An order-flow idea that ran out of room after costs

One example brings the process together. [The Quarter-Hour Effect](https://arxiv.org/abs/2607.09426) studies trading around clock boundaries in perpetual contracts. AIQuant checked one mapping: use each instrument's January 75th-percentile absolute order-imbalance threshold, enter in the imbalance direction, hold for twelve hours, then examine February.

February produced 319 non-overlapping reference trades. A synthetic 100-USDT account allocated one-sixth notional per instrument without compounding; historical funding was accounted for separately. The assumed round-trip costs gave:

| Assumed round-trip cost | Account return | Profit factor | Maximum drawdown |
| --- | ---: | ---: | ---: |
| 0 bp | +0.245% | 1.006 | 7.302% |
| 4 bp | −1.882% | 0.955 | 7.808% |
| 10 bp | −5.072% | 0.884 | 8.566% |

A basis point is 0.01 percentage points. Profit factor is gross profit divided by absolute gross loss. The zero-cost result was already near break-even and turned negative at four basis points. That did not justify continuing this direct mapping. Removing losing instruments or adding leverage after seeing the result would create another hypothesis that needs its own test.

These remain reference-price diagnostics. Entry uses the last trade price in the next completed ten-second bin; exit uses the corresponding twelve-hour reference price. Fills, queue position, and slippage were not verified. February also lies within the published paper's sample, making this reused OOS rather than a fresh formal holdout. The result closes this mapping; it does not refute the paper's statistical relationship.

AIQuant still has no promotion-ready candidate. It does give me a way to connect sources, inputs, rules, and results, and to close ideas that do not hold up. A useful next run starts from the specific failure: missing fill evidence calls for execution data; an edge that disappears with costs calls for a different, justified hypothesis. That is where I want the agent's continued work to go.
