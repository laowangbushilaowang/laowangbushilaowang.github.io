---
title: "AIQuant: a data lake and an agent research workflow"
date: "2026-10-09"
updated: "2026-10-09"
language: en
project: aiquant
excerpt: "Retrying second-level market ingestion, connecting Codex to research tools, and checking where a signal stops short of a tradable strategy."
tags: [Agents, Data Engineering, Parquet, Quantitative Research]
draft: false
---

A time-exit strategy fixes an instant at which to leave a position. Reading the path bar's open at that instant and reading its eventual close simulate different strategies. The v4 revision of one time-exit candidate in AIQuant corrected this by reading the path bar's open at the frozen exit timestamp. Even a timestamp-specific rule can drift through the choice of a price field.

AIQuant is my personal quantitative research project, developed with Codex. I set the research requirements, choose what to investigate next, and review the results; Codex helps implement the system, investigate sources, and diagnose problems. It connects market storage to agent research tools and strategy replay. No candidate currently meets the promotion requirements, and live trading and order APIs remain disabled.

Experiments like this need repeatable inputs and research judgments that the code can check. That gives the data lake and the agent tools separate jobs.

## Let the agent read reports and the code process market data

The early A-share sample followed a short path: market bars, Chinese news, lexicon sentiment, a momentum rule, and an event-driven backtest. That entry point still exists in the README. It can establish that a pipeline runs, but a lexicon score does not establish that Codex researched an event.

The later Brain workflow separates those jobs. Python collects material and prepares a research request and a reading pack. Codex checks events and writes structured CSV and research notes. Programs then turn that material into factors and run experiments. The reading pack separates instrument profiles, high-priority news, event memory, and open questions, so the agent can select the relevant files.

The agent does not need the entire market archive in its context. It reads compact reports and follows their sources when necessary. Computation and large-file scans stay in scripts. This memory layer uses ordinary files; it does not include a separate vector-search service.

An abbreviated version of the implemented boundary is:

```text
prepare: collect material and build the reading pack
    ↓
Codex: verify events, explain them, write CSV and notes
    ↓
post_codex: read structured artifacts, build factors, run experiments
    ↓
reports and human review
```

The local MCP registers specific tools for prepare, post-Codex processing, reading summaries and research packs, and writing research artifacts. It dispatches registered tool names rather than accepting an arbitrary command string. Research-pack reads also check that the resolved path remains inside the pack directory. This MCP has no order-writing tool; project trading permissions are controlled separately.

Skills provide reusable instructions for data and compute, strategy freezing, execution replay, and report maintenance. They tell Codex which procedure applies, what inputs it needs, and what to check. Numerical conclusions still have to come from reports. A statement preserved in a Skill is not automatically a current result.

One boundary is weaker than its name suggests. In the current `BrainRunner`, a missing event CSV causes the post stage to add a next-action message and return. If no subprocess raises an error, the outer runner can still report `succeeded`. That establishes only that the orchestration did not catch a command failure. It does not prove event research finished. I would give waiting for an agent artifact its own status and validate the CSV contents, rather than checking only that a file exists.

## Store second-level features in hourly parts

Local storage holds recent hot data. Long histories and large reports live remotely, with the compute node reading the same mounted store. The compute and storage paths differ, but they refer to the same data. Copying between them would duplicate it.

Hot CSV features are converted to Parquet with ZSTD compression. Parquet stores fields in columns, allowing a reader to select the columns it needs; ZSTD handles compression. Directories partition by sampling interval, instrument, year, and month. Hot output files use a UTC hour as their logical unit.

**A part's identity follows its time interval.** Converting an hour alone, retrying it alongside the next hour, or processing a corrected source should address the same logical part. Otherwise, a different batch of input paths can leave another copy of the same market interval in the lake.

The writer derives that identity from the provider, sampling interval, instrument, and hour start. This is an excerpt from the implementation:

```python
logical_hour_id = logical_hour.strftime("%Y%m%dT%H")
logical_digest = hashlib.sha256(
    (
        f"{self.provider}|features|{self.interval}|{self.symbol}|"
        f"hour={self.logical_hour_start_ms}"
    ).encode("utf-8")
).hexdigest()[:20]
output_path = self.partition_dir / f"part-hot-hour-{logical_hour_id}-{logical_digest}.parquet"
self.temp_path.replace(output_path)
```

The catalog uses the same logical key. A retry replaces that hour's part; the next hour has a separate file. This reduces ambiguity from repeated input, but it is not a transaction between file publication and catalog update. Recovery must still reconcile them after an interruption.

The source CSV interleaves instruments. Conversion first groups and spools rows locally on the compute node, spilling each group's buffer at a configured threshold. After scanning, it publishes parts to shared storage sequentially, with only one final Parquet writer open at a time. This avoids maintaining many writers on the network filesystem at the cost of temporary local reads and writes. Each group's current threshold is 2,000 rows, so total buffering still grows with the number of active groups; there is no throughput comparison establishing the value as optimal. PyArrow handles file I/O, and public exchange data supplies the market inputs. The project work here is their identity, synchronization, and research access.

A real increment report from 17:24 on October 9, 2026 records one source file, 94 instrument-hour parts, and 332,575 rows. The observed peak of final Parquet writers was one. Those numbers describe that conversion batch, not complete historical coverage or quality across all intervals.

## A sync acknowledgment needs a file version

A hot file can grow before its hour closes. If conversion reads the earlier contents and the source later gains more rows, acknowledging only the path would lose track of the new version.

The queue records the path, size, SHA-256, and observation time. Before ACK, it checks the source size and hash again. A change produces `maintenance_ack_blocked_source_changed`; the newer version must enter the queue. A legacy path-only acknowledgment is insufficient.

Local cleanup applies this identity check to one-second feature files. A file must be older than the retention window and match its acknowledged size and SHA before it becomes eligible for pruning. This protection is scoped to `features/1s`. Other hot files follow their own retention rules, so it is not a blanket guarantee for every cache.

The incremental catalog follows changed-file lists and updates affected records. It has a maintenance tradeoff too: this path does not reconcile deletions, which require a full rebuild. A catalog entry establishes directory metadata; it does not substitute for row-level integrity checks.

## Choose data resolution for the hypothesis

Coarse screening saves compute only when it preserves the information the hypothesis needs. A daily trend and order flow in the first ten seconds after a clock boundary need different inputs.

I argued in this project that a strategy requiring a detailed path could go directly to detailed replay, without first calculating an unsuitable coarse proxy. If a signal uses order flow just after a quarter-hour boundary, a minute bar collapses those seconds together. If a stop and a target both fall inside one bar, its high and low alone do not establish which came first. An unsuitable proxy can turn a data-resolution problem into an apparent strategy rejection.

L0–L7 is therefore better read as a set of evidence dependencies. L0 freezes the definition; L1/L2 examine historical and split validation; L3 maintains a continuous account; L4 checks execution paths; L5 tests costs and risk; L6 observes new data after freezing; L7 decides promotion. Research at a later stage can continue when an earlier one is inapplicable or partial, provided the missing evidence remains explicit. Promotion requirements do not disappear.

![The actual time-exit v4 L0–L7 stage report](/images/aiquant/time-exit-stages-20260727.svg "Original report image from July 27, 2026, without redrawing. completed means the step ran; L4 remains partial and L6/L7 blocked. This is not an all-gates-passed result.")

The image also shows the limitation of a status label. Green boxes can look like acceptance. The stage result and its blockers still need reading.

## A different exit field changes the strategy

A shared strategy name does not make two replays equivalent. Exit timing, price fields, capacity, and filters need to be fixed and consumed consistently across stages.

One time-exit v4 correction reads the path bar's open at the frozen exit timestamp. Using that bar's eventual close for an exit at its opening instant introduces a later price and changes the simulated strategy. A precise timestamp alone is insufficient; the price field matters too.

An earlier v3 report also confused capacity rejection with margin exhaustion. A capacity rule refusing a new position differs from an account experiencing a margin event. Conflating them sends the risk analysis toward a different problem. That version remains diagnostic; corrected numbers have not been used to retroactively validate it.

This is why results carry a profile and fingerprint. Older reports can locate an error or suggest another hypothesis. Only admitted evidence with a matching content identity can control the current status. A filename containing `latest`, or an attractive number, does not establish that relationship.

## A next-month check of an order-flow signal

The project also investigated Kim and Hansen's [The Quarter-Hour Effect](https://arxiv.org/abs/2607.09426), which studies periodic trading near clock boundaries in Binance perpetuals and the relation between opening order imbalance and subsequent returns. This example checks one AIQuant trading mapping; it is narrower than reproducing the full paper.

The rule used each instrument's January 75th-percentile absolute order-imbalance threshold, took the imbalance direction, and held for 12 hours. Before reading February outcomes, the profile fixed one open position per instrument, ignored further signals while it remained open, entered at the last trade price of the next completed ten-second bin, and exited at the corresponding twelve-hour reference price. Historical funding cashflows were included. These were reference prices, not verified executable fills.

The February 2024 check produced 319 non-overlapping reference trades. A synthetic 100-USDT account assigned one-sixth notional per instrument without compounding. Its frozen round-trip cost scenarios gave:

| Assumed round-trip cost | Account return | Profit factor | Maximum drawdown |
| --- | ---: | ---: | ---: |
| 0 bp | +0.245% | 1.006 | 7.302% |
| 4 bp | −1.882% | 0.955 | 7.808% |
| 10 bp | −5.072% | 0.884 | 8.566% |

One basis point is 0.01 percentage points; ten basis points is 0.1%. These costs are scenario assumptions, not a private account's verified fee schedule. Funding is accounted for separately, and the table does not measure spread, slippage, market impact, or maker non-fills. Profit factor is gross profit divided by the absolute gross loss; a value near one is near break-even.

The zero-cost result was already thin, with a profit factor around 1.006. It would be misleading to describe an otherwise strong strategy destroyed only by a ten-basis-point charge. This January-derived mapping did not retain enough edge in the following month.

A lower maker fee would not answer the execution question. Aggregate trades describe transactions that occurred, but do not identify my hypothetical queue position, partial fills, or non-fills. Setting fees to zero changes the arithmetic without showing whether the order could have filled.

The report classifies February as reused OOS because it falls within the published paper's sample. It is not formal untouched OOS. This closes the direct mapping tested here; it does not refute the paper's full-sample statistical relationship. Keeping only the best-performing instrument after seeing the result would require a new hypothesis, frozen and tested separately.

## What I would fix next

The concrete outcome so far is a research tool for continuing to check ideas. The current decision has no qualified candidate. Missing execution evidence and clean post-freeze OOS still block promotion.

For this order-flow work, I would first establish a verifiable fill model that addresses queues and non-fills. Event research also needs publication and availability times so factor generation cannot use information learned later. The Brain workflow needs an explicit waiting state instead of leaving the next session with an overly broad `succeeded`.

I do not want more parameter combinations to conceal those gaps. Before the next attempt, I want to know whether the data can be reread accurately, which strategy the experiment actually executed, and where it failed.
