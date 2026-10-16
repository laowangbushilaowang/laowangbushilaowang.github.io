---
title: "Testing A-share signals from filings and price data"
date: "2026-10-16"
updated: "2026-10-16"
language: "en"
project: "astockquant"
excerpt: "A 16-stock research sample, a filing-title rule and a fixed price-volume score. Connecting real data made the results more useful, without making them better."
cover: "/images/astock/event-results.webp"
coverAlt: "Mean event excess returns across three periods: two negative periods and a final period slightly above zero"
tags: [Python, Quant Research, Data Engineering]
draft: false
---

I started AStockQuant to connect an existing A-share data source to a small research workflow: collect data, calculate signals, then evaluate them. My AIQuant project provided a reference for storage and research organization. For this project, I began with daily prices and company filings. Codex helped implement the code; I specified the data source and storage approach, and questioned what data the tests were actually using.

The first version produced plenty of reports, but its integration sample contained four stocks and 44 price rows. That was useful for checking next-bar execution, fees and field conversions. It could not tell me whether a signal worked on collected market data. I asked to continue collection, which eventually produced a 16-stock sample.

## Giving the tools separate jobs

[a-stock-data](https://github.com/simonlin1212/a-stock-data) supplied the data-access reference. [Qlib](https://github.com/microsoft/qlib) was the reference for algorithms and model workflows. I also looked at QuantMind's platform organization. These are other people's projects; my work here was assembling data and calculations around my research questions, with Codex's help.

The collector used different providers for different inputs: Baidu daily bars, Tencent quotes, CNInfo filings and supplementary stock information from Eastmoney. One supplementary endpoint disconnected during collection. The script was changed to record the failure while preserving the main data already collected.

The resulting sample contained:

- **28,703 daily price rows for 16 stocks**, from early 2019 through June 3, 2026.
- **5,344 filing records covering nine of those stocks**. Filing coverage was uneven.
- Separate auxiliary tables for trading status, industry and related metadata.

Raw responses stayed on remote storage; bounded standardized samples and reports were mirrored locally. Price rows shared normalized symbols and dates. Filings also retained their titles, source links and timestamps, so a suspicious result could be traced back to its input.

## Aligning a filing with a trading session

Before calculating a reaction to a buyback filing, I needed to decide which stock it concerned, when it became available and which price interval to observe.

```text
Title, symbol and timestamp
        ↓ normalize fields; deduplicate by source link
Event record
        ↓ map time onto the trading calendar
Signal-day close → next-session close
        ↓ subtract other available sample stocks' mean return
Event excess return
```

The mapping assigned pre-open and intraday events to the same session. After-close and non-trading-day events moved to the next session. The measurement then ran from that session's close to the following session's close. For an after-close filing, this excludes the overnight move into the next session.

Parsing a timestamp did not establish that it was the exact publication time. Many eligible records had a time of `00:00:00`. The mapping was useful for exercising a daily-data workflow, but precise historical availability still needed better source verification.

## Did a positive title predict a better return?

The first rule was deliberately simple: identify titles mentioning buybacks, dividends or positive earnings guidance and treat them as positive candidates. It did not read the full filing, assess materiality or expectations, or establish whether the information was new.

There were **238 positive event rows** with usable forward prices and controls. For each one, the calculation subtracted the average return of the other available stocks in this small sample from the event stock's return. The controls were not matched by industry, size or risk, so this was not a market-adjusted alpha estimate.

![Mean event excess returns in three chronological windows](/images/astock/event-results.webp)

*Replotted from saved event-study results, without new collection or a new backtest. Values are percentage points; the final period averaged about +0.053 pp. Trading costs are excluded.*

The first two periods had negative means. The final period was slightly positive, but only **42.7%** of its event rows had positive excess returns. That was weak support for the title rule.

There was also dependence between observations. The 238 rows represented **211 distinct stock-and-return intervals**: multiple filings could reuse the same price move. They were not 238 independent trials. A simple control reassigned events by reversing their unique signal dates, but that changed their market regimes too; it was not a rigorous substitute for a better-designed test.

My conclusion was narrow: **this coarse title rule was not sufficiently supported as a usable strategy**. Event definitions and sampling needed attention before adding more filters.

## A price-volume baseline without model training

A second route used no filings. It combined returns over the previous one, three and five sessions, short-term volatility and relative volume changes into a fixed weighted score. Each day, stocks were ranked by that score, then the next-session return of the lowest-ranked stock was subtracted from that of the highest-ranked stock.

The code called this `Alpha158-like`, which overstated the resemblance. It was a five-feature baseline, not a full Alpha158 reproduction or trained LightGBM model. Even `train_end_date` was metadata in this implementation: no coefficients were fitted.

| Diagnostic | Saved result |
|---|---:|
| Evaluated sessions | 583 |
| Mean daily top-minus-bottom return | −0.0427 pp |
| Mean recorded rank correlation | −0.0159 |

On average, the highest-scoring stock did worse than the lowest-scoring one in this sample. The recorded rank correlation was slightly negative too. The implementation did not average tied ranks, so that value was only a rough diagnostic. Neither measure simulated positions or trading costs.

The full Qlib training run remained unfinished. The runtime was missing dependencies, and the prepared dataset directories did not yet contain real Qlib binary feature files. Passing directory and schema checks established only that part of the preparation.

This attempt left me with a collector, an event-alignment routine, two repeatable calculations and disappointing results. It also made my questions more specific: where did the inputs come from, how was the score calculated, which prices were compared, and how often was the same observation counted? Adding a model would not answer those questions for me.
