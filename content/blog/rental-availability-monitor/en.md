---
title: Adding back-in-stock alerts to a rental radar
date: '2026-10-16'
publishedAt: '2026-10-16T11:32:28Z'
updated: '2026-10-16'
language: en
translationKey: rental-availability-monitor
project: rental-radar-adaptation
excerpt: A small adaptation of an open-source rental tool to track cars returning to availability, compare quotes for the same rental period, and put useful changes first.
tags: [Python, Personal tools, Open source]
---

While planning a road trip, I had some flexibility over pickup and return times and had not settled on a car. That left quite a few combinations to compare. A model might be available for one period and missing for another; checking again later could produce a different quote.

I looked for an existing tool and chose [LuckinSven's Zuche Radar](https://github.com/LuckinSven/8093-zuche-radar-public) as the starting point. It already had a model library, location queries, and scan history. With Codex, I made a few additions around how I wanted to use it: **show cars that have become available again, then let me inspect relevant price changes.**

## A known model can still be out of stock

My original request to monitor “new models” was ambiguous. Sorting a library by first discovery is straightforward. What I wanted was slightly different: a car the system already knew about had been unavailable for my dates—could I rent it again?

A first-seen sort would keep treating that car as old. As the library filled up, it would become less useful for spotting the changes I cared about.

I needed three separate answers:

| Question | Information needed |
|---|---|
| Have I encountered this model before? | The model library and first-seen time |
| Is it available for these dates? | A rentable offer returned by a location in this scan |
| Has it just become available again? | Two complete scans for the same rental period |

The last answer went near the top of the page. For a fixed pickup and return time, the comparison looks at the sets of available models before and after. A model absent before but present now appears under newly available or returning cars; the reverse goes into a separate unavailable list. Failed or unfinished scans do not establish that a car has disappeared.

![Returning-car cards above a compact price-change section](/images/car-rental/availability-replay.webp)

*The actual page components, replayed with example models, dates, and prices. Availability changes come first; price details expand below them. These are not live quotes.*

Each card includes the rental period, the number of pickup locations, and when the change was observed. Without those, “available again” leaves an obvious question unanswered: available for which dates? The event describes what a scan found; I still check current stock on the rental platform before booking.

## Keep the rental period fixed when comparing prices

Once there are several price records, the immediately preceding record is not necessarily a useful comparison.

Picking up on Friday rather than Saturday can change a quote. Subtracting those two prices produces a percentage, but it does not tell me whether the rental period I was watching got cheaper.

Price changes therefore use the **same model, city, and exact pickup and return times**. The observation time is stored separately: when I checked the quote is different from when I intend to rent the car.

The price also has a specific meaning. It is the lowest listed price among rentable locations found in that scan. If the cheapest location runs out of stock, that minimum can rise without any remaining location changing its price. The display tracks the cheapest available option, not necessarily a price revision by one store.

I also wanted a rough cost for the whole rental, so the page adds a rental subtotal and estimates for basic protection and preparation charges. Those extras use simplified rules. They help with an initial comparison; the platform's confirmation page supplies the final amount.

## Put the recurring controls in the page

I wanted to set several pickup and return options and the checking interval in the Web interface. Each cycle chooses one valid combination, then moves on to the next. It does not query every combination at once. The configured interval is consequently not the refresh interval for every rental period: more combinations mean a longer wait before the same one is checked again.

The layout follows that use. Returning cars come first. Price changes are grouped by model and collapsed, with color helping distinguish increases from decreases. I also switched the displayed times to a 24-hour format to avoid misreading AM and PM.

I also needed a way to dismiss changes I had already seen while keeping the history. Clearing the change list moves its display cutoff; it leaves the model library, scans, and price records in place.

These changes let me start with stock and quote changes. Once an option looks worth considering, I return to the platform to confirm the model, fees, and booking conditions.
