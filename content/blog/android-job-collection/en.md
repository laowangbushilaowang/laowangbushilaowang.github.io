---
title: Collecting job descriptions from Android
date: '2026-10-16'
publishedAt: '2026-10-16T11:04:31Z'
updated: '2026-10-16'
language: en
translationKey: android-job-collection
project: cn-radar-adaptation
excerpt: Extending CN Company Radar with Android discovery, complete descriptions, stable job identities, and a clearer division between scripts and model review.
tags: [Python, Android, LLM workflows]
---

I regularly checked recruitment websites and apps for recent roles. Before I could read the requirements, there was a familiar sequence: change the search, switch cities, and work out whether I had seen the listing before.

When I started delegating this to Codex, a gap became obvious. A collected job card could look like a finished result while the information I needed was still folded inside its detail page. A title and a few lines of preview did not establish that the job description had been read.

I used the open-source [CN Company Radar Toolbox](https://github.com/zexianzhang36-prog/cn-company-radar-toolbox) as a base, retaining its job library and Web tools. With Codex, I added Android collection, adjusted the App-to-Web workflow, and corrected problems from use. This post concentrates on those adaptations and on which work benefits from a model.

## Get the full description before judging fit

The initial aim was to organize new roles daily or weekly. I repeatedly asked for the details of each role considered for matching to be opened and read.

That led to a distinct collection stage:

```text
Discover candidates by city and direction → remove known entries
                              ↓
Read the description and obtain the job's link
                              ↓
Save to the library → compare requirements with my experience
```

Cards are useful for discovery and coarse filters. An obviously unsuitable city or experience requirement can be handled early. But “algorithm engineer” can cover model training, deployment, or customer-site support. The title narrows the search; the full requirements make a useful comparison possible.

Collection and review therefore have separate states. A title does not make a description read, and stored text does not mean the model has analyzed it. When returning to a role, I need to know which work remains.

## App discovery and Web search return different lists

I kept the Web route and added collection from the official Android app. One practical reason was sorting: the App could discover roles under “latest first,” while the same keywords on the website did not necessarily reproduce that order or those results.

![Latest-first sorting and a job card in the Android app](/images/cn-radar/app-latest-card.webp)

*An actual BOSS App capture, cropped to remove the status bar and recruiter information. The card still ends in an abbreviated preview. Its sort order does not verify the role's publication date.*

The Android collector uses ADB to read visible controls and perform searches, sorting, scrolling, and navigation into details. It checks the selected city, query, and sort before collecting. It also needs to recognize where matching results give way to recommendations, rather than treating the recommendation feed as more results from the original search.

“First seen by my collector” is another useful but different timestamp. My library can establish that; “published today” needs an explicit platform signal. The October 14 batch verified latest-first sorting without establishing how many roles were published that day. I keep those facts separate so an old role newly discovered by me does not become a new posting in the report.

The website remains useful for completing descriptions or revisiting an App candidate. The two entry points do not need identical search results to work together.

## Bring back the text and link in one visit

An early approach could use company and role names to find the corresponding Web detail. Names repeat, ordering changes, and a listing may no longer occupy the same position. A keyword search alone can return a similar role rather than the original one.

I wanted a detail visit to return everything needed for the next stage:

1. Check that the visible company and role match the selected card.
2. Expand the description and retain its text.
3. Obtain that detail page's share link and extract the platform job ID.
4. Return to the list and continue.

The job ID gives library ingestion and the Web route a specific object to use. Text is retained when it is expanded, so scrolling back to the toolbar for the share action does not lose it. If the App already supplied the description and link, opening the website merely to collect the same text again adds little.

I also tried horizontal swipes through adjacent detail previews. That saves repeated trips to the list, but many previews remain collapsed. Previewing a role quickly and fully expanding its description involve different amounts of work; they should not become the same “JDs read” count.

The reader checks the title, company, body, and link, and rejects text still containing the expansion marker. This catches a common collapsed state. A changed interface still needs its controls checked again; a sufficiently long string is not a permanent completeness guarantee.

## Give scripts the repetition and models the judgment

I did not want a model to rediscover how to select a city or scroll a list every day. Once those interactions were established, scripts could handle them. The model should receive text already associated with a particular role and compare it with my project experience.

| Work | Handler |
|---|---|
| Search, sort, scroll, and read visible controls | Fixed scripts |
| Check history, deduplicate, save links and text | Code and the local job library |
| Coarse city, experience, and keyword filters | Explicit field rules |
| Interpret responsibilities and supporting experience | Model review of the JD and personal materials |

A rule-based score is a first pass. Finding “large language models” in a title does not settle whether the training background, qualifications, or delivery work suits me. That requires the description and my actual experience.

One App batch on October 14 saved **26 expanded descriptions with distinct job IDs**, containing 341–1,993 characters each. These are collection results, not proof that model review finished. The Web mechanical stage that day separately recorded zero model calls. Analysis and troubleshooting sit outside that counter, so it would be misleading to call the whole job-search workflow “zero-token.”

Page changes, failed detail reads, and sorting differences still occur. Failed descriptions stay separate; a card preview does not fill the gap. The useful change for me is having the repeatable collection work established before asking the model and myself the questions I actually care about: what the job involves, which experience supports a match, and which requirements I do not meet.
