---
title: "Bus Equity: putting commute gaps on the map"
date: "2026-10-11"
updated: "2026-10-11"
language: "en"
project: "geospatial-fairness"
excerpt: "A client analysis of bus commute disparities in Massachusetts: regional reversals, population context, pandemic-era trends, and what the charts could actually support."
cover: "/images/bus-equity/regional-gap.webp"
coverAlt: "Map of Black minus white annual bus commute hours across Massachusetts PUMA areas"
tags: [Data analysis, Geospatial, ACS, Client project]
draft: false
---

An extra 64 hours on the bus each year sounds like a clear problem. Spread across working days, it amounts to roughly 7.7 minutes each way. A missed bus or an additional transfer could easily consume that much time.

In fall 2023, I worked on a BU Spark! DS701 client project with Livable Streets Alliance. That commute disparity gave us a starting question: was the gap between Black and white bus commuters shrinking, where was it most pronounced, and what changed around the pandemic?

I led the regional-analysis question and participated in the wider analysis and presentation. We used US Census ACS data to compare commute times across groups, places, and years, then delivered maps, statistical analysis, and a client presentation. The 64-hour figure framed the question; it was not a result we found in every year or every region.

**The useful question was where the burden occurred, who experienced it, and what the analysis could help someone decide.** A statewide average could not answer all three. Once we mapped the differences, some places even showed the opposite direction.

## Define the comparison before drawing the map

The data contains one-way travel time to work, recorded in minutes as `JWMNP`. To express the accumulated burden, we converted it to annual hours using the project's agreed convention:

$$
H = m \times 2 \times 5 \times 50 / 60
$$

Here, $m$ is one-way minutes; the other terms assume a return trip, five working days a week, and fifty working weeks a year. **A one-minute difference each way becomes about 8.3 hours annually.** The opening 7.7-minute figure is derived from these assumptions, rather than a separate observation.

Annualization makes small differences easier to understand. It also assumes a common work schedule: it is not a record of each person's actual travel over a year. A reader seeing “199 hours” needs to know how minutes became hours.

The analysis followed this sequence:

1. **Define the population:** focus on bus commuters and separate groups by race, geography, and data vintage.
2. **Align the measure:** address missing values and field types, then express travel time in annual hours.
3. **Look statewide, then regionally:** compare group means, calculate Black minus white commute hours, and join the differences to geographic areas.
4. **Investigate unusual results and changes over time:** bring in population and employment context, compare trends, and discuss the findings with the client.

We used **ACS five-year estimates**, which offer more observations for small-area analysis than one-year estimates. The tradeoff is temporal resolution: each release covers a period, and consecutive releases have overlapping windows. A point labelled “2021” does not isolate events that happened in 2021. This matters especially when interpreting the pandemic. The [Census Bureau's guidance](https://www.census.gov/programs-surveys/acs/guidance/estimates.html) explains the distinction.

## Regional differences can reverse direction

My main question was whether the Black–white commute gap was consistent across places. The regional analysis covered 2016–2021. We compared annual commute hours by area and race, then connected the results to a map.

### Matching PUMA codes to states and places

An awkward part of this work was turning PUMA codes into recognizable states and places. It meant consulting geographic documents and PDFs for the relevant years, before the map could tell the client anything useful.

**A five-digit PUMA code is not nationally unique.** Matching requires the state code as well. Leading zeros matter too: a numeric `100` will not directly match a name table containing the string `00100`. The identity has three parts:

```text
State code + five-digit PUMA code + geography vintage
                         ↓
Names and boundaries from that vintage
```

The [official directory](https://www.census.gov/programs-surveys/geography/guidance/geo-areas/pumas.html) provides separate [2010](https://www2.census.gov/geo/pdfs/reference/puma/2010_PUMA_Names.pdf) and [2020](https://www2.census.gov/geo/pdfs/reference/puma2020/2020_PUMA_Names.pdf) name PDFs. Their titles are geography vintages, not a rule to match the survey year to the same number.

| What to check | Why it matters |
| --- | --- |
| State code together with PUMA | The PUMA code alone can identify a place in another state |
| Geography vintage used by the records | Names and boundaries from different vintages cannot simply be mixed |
| Full area name and coverage | A PUMA can combine towns or cover only part of a county |

The [ACS handbook](https://www.census.gov/content/dam/Census/library/publications/2021/acs/acs_pums_handbook_2021_ch02.pdf) explains that records through 2011 use 2000-based geography, while 2012–2021 records use 2010-based geography. Five-year files spanning the transition can contain both. Our 2016–2021 regional analysis therefore does not switch to 2020-based geography just because it includes 2020; analyses extending further back need a separate check.

Looking up a name answers **where a code points**. Reconciling boundaries answers **whether different years describe the same place**. A successful name lookup does not establish the latter. PUMAs are statistical areas, not ZIP codes or necessarily whole counties or towns. This is why the results below retain qualifiers such as `North`, `Central`, and `& Others`: removing them changes the scope of the claim.

We kept the sign of the difference: **Black annual commute hours minus white annual commute hours**. Positive values mean longer travel for Black commuters; negative values mean longer travel for white commuters.

![Regional commute differences, with positive and negative values preserved](/images/bus-equity/regional-gap.webp)

*The project map shows variation in both size and direction. Basemap attribution remains within the image.*

The regional comparison produced examples that a single statewide number would hide:

| Area label used in the analysis | Longer annual commute | Approximate gap |
| --- | --- | --- |
| Norfolk County (Central) | Black commuters | 199 hours |
| Weymouth Town & Others | White commuters | 319 hours |
| Suffolk County (North): Revere, Chelsea & Winthrop | Similar between groups | 4 hours in absolute terms |

These are representative extremes and a small difference from the 2016–2021 regional analysis, rather than a same-year ranking with equal precision. The labels retain their grouped geographic meaning. In particular, the final row does not imply a four-hour gap throughout Suffolk County.

Weymouth deserved a closer look: a large difference, pointing against the direction of the original statewide question. Ranking only by absolute magnitude would combine two separate questions: where the gap is large, and which group travels longer.

The client asked us to investigate racial composition, income, occupations, rents, and commute origins. Two groups living within an area may live in different locations and travel to different jobs. Estimates for smaller groups may also be less stable. **A large difference is a reason to investigate; it is not enough to label an area fair or unfair.**

## Who is being compared matters

We also examined bus-use counts for Roxbury, Mattapan, and Dorchester. These do not explain the Weymouth result. They illustrate why population context matters when comparing groups within a place.

![Black and white transit-use counts in Roxbury, Mattapan, and Dorchester](/images/bus-equity/rider-populations.webp)

*The project charts show markedly different group sizes, particularly in Mattapan. These population counts should not be read as raw PUMS sample sizes.*

A gap map needs two answers: **how large is the difference**, and **whose travel does it describe**? One cannot be inferred from the other. Small populations still deserve attention, but assessing stability requires effective sample sizes and uncertainty estimates. A population bar chart cannot substitute for those.

We explored regression using geography, race, age, education, weeks worked, sex, occupation, and industry. These variables describe different parts of residential and employment context. Two bus users can have different destinations, shifts, and available routes even when they live in the same broad area.

The analysis could organize associations worth investigating. A coefficient alone could not establish a cause. Occupation codes, for example, are categories rather than a numeric scale of seniority or burden. Without clear reference categories and uncertainty estimates, a coefficient list would suggest more certainty than we had.

I find this part most useful as a way to decide what context to collect next, rather than as a ranking of the causes of long commutes.

## A falling gap can still exceed the trend prediction

The project's statewide time analysis covered 2013–2021. Before the pandemic, annual commute hours generally fell for Black commuters and rose for white commuters, narrowing the difference. Both groups' times fell in 2020 and rose slightly in 2021.

![Annual commute hours for Black and white riders from 2013 to 2021](/images/bus-equity/commute-trends.webp)

*Orange represents Black commuters; blue represents white commuters. A narrowing gap can include one group's travel becoming shorter and the other's becoming longer. It does not establish improvement for both.*

Saying the gap fell after the pandemic leaves out a useful comparison: it was already falling. We fitted a linear trend to the 2013–2019 gap and extended it to 2020 and 2021.

| Release year | Observed annual gap | Trend prediction | Above prediction |
| --- | --- | --- | --- |
| 2020 | 33.81 hours | 31.45 hours | 2.36 hours |
| 2021 | 33.25 hours | 26.29 hours | 6.96 hours |

![Observed commute gaps and the extrapolated pre-pandemic trend](/images/bus-equity/gap-trend.webp)

*Blue shows observed gaps. The red dashed line extends a linear trend fitted before the pandemic. The final observations decline but remain above the prediction.*

Both statements can be true: **the gap continued to fall, and it fell less than the earlier linear trend predicted.** They use different comparisons.

This was a trend extrapolation, not proof that the gap would have reached 26.29 hours without the pandemic. Overlapping five-year windows, few pandemic-era points, and the absence of prediction intervals all limit that interpretation. The 6.96-hour deviation raises a question; it cannot be assigned entirely to COVID.

We also reported a before-versus-pandemic t-test with `p = 0.0047`. It addresses a different comparison from the trend model, and overlapping windows weaken an independence assumption. Statistical significance does not remove changes in working arrangements, commuter composition, or transit service as possible explanations.

## Every client-facing chart needs a useful answer

The client's feedback was specific: put limitations near the beginning, give each chart a plain-English takeaway, describe observed differences, and investigate unusual areas such as Weymouth.

That changed how I thought about the presentation. During analysis, I need fields, groups, and model details. The client first needs to understand what a chart helps them decide. “Regional differences are large” is too vague. A more useful explanation is: **the direction varies across regions, so the statewide average should not be applied to every community; examine population and employment context in high-gap areas before discussing service changes.**

Our recommendations included prioritizing high-gap areas for investigation, discussing needs with communities, and reviewing service frequency on routes used by underserved riders. These were directions for planning. The data did not specify a new route or identify the net effect of an existing policy. That would require route, schedule, origin–destination, and implementation information.

The deliverable was an analysis and client presentation. The experience I take from it is practical: establish units and geography first, give unexpected results a closer look, and explain what the next investigation should be in language the client can use.

The reversed gap in Weymouth gave us a better starting point for that conversation than a tidy statewide trend.
