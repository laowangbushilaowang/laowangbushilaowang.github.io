---
title: "Putting poker probabilities on an iPhone"
date: "2026-10-16"
updated: "2026-10-16"
language: "en"
project: "texas-equity"
excerpt: "From a web prototype to SwiftUI: splitting ties correctly, giving percentages a player-count reference, and making card entry less work on a phone."
cover: "/images/texas-equity/web-demo.webp"
coverAlt: "The mobile web prototype simulating pocket aces against three random opponents"
tags: [SwiftUI, Monte Carlo, Probability, Codex]
draft: false
---

I wanted an iPhone poker-equity calculator: enter the cards, change the player count, get a result, preferably without scrolling through several screens.

The first implementation was a web page and PWA. I meant a native Xcode app, so a SwiftUI version followed. Using it exposed problems beyond the calculation. Result cards obscured hole cards, the action button disappeared below the screen, and entering each card meant opening a sheet, selecting rank and suit, then doing it again. The computation could finish before my fingers did.

A second problem was less visible. A result of 40% still left me wondering how to read it. Facing one opponent and facing five are very different contexts.

The project developed along both lines: make the probability understandable, then organize input and presentation around it. I supplied requirements and iterative judgments; Codex assisted implementation. The web and native versions have distinct scopes.

## Complete a deal, then compare the best five cards

The inputs are two hole cards, known community cards, opponent count and simulation budget. The engine removes known cards from the deck, then repeatedly completes possible deals:

```text
For each simulation:
  Draw without replacement from the remaining deck
  Complete the board and give each opponent two cards
  Compare each player's best five-card hand
  Accumulate wins, ties, losses and equity shares
Repeat N times and summarize
```

Drawing without replacement matters: the same ace of spades cannot belong to two players. Input validation also rejects duplicate cards, gaps in the board, and board sizes other than zero, three, four or five.

The current evaluator counts ranks and suits, then returns a lexicographically comparable score: hand category first, followed by the relevant ranks and kickers. It does not construct all 21 five-card subsets on every evaluation. Ace-low straights and choosing a full house from two triples need explicit handling.

Increasing the simulation count reduces sampling noise. It does not repair the opponent model: **opponents receive uniformly random legal cards**, without inferred ranges based on position, betting or player history.

## Winning outright is different from equity

![Outright wins, ties and equity in a native-app result](/images/texas-equity/native-equity.webp)

*A native turn example with two opponents and 15,000 simulations. The screen reports 25.9% outright wins and 31.6% equity. Ties can return a fractional share, so those numbers need not match. Cropped from the actual interface.*

The win rate counts sole victories. Equity also includes shares of tied outcomes: one for an outright win, one third for a three-way split, zero for a loss, averaged across simulations.

$$
\widehat{\mathrm{equity}}=\frac{1}{N}\sum_{r=1}^{N}q_r,
\qquad
q_r=\begin{cases}
1/|W_r|,&\text{if hero belongs to winner set }W_r,\\
0,&\text{otherwise.}
\end{cases}
$$

A shared royal-flush board makes the distinction obvious. Everyone uses the board's five cards. Hero wins outright 0% of the time and ties 100% of the time. Equity is 50% against one opponent and 25% against three. Counting every tie as half a win would be wrong.

I checked that example against the current engine, together with an ace-low straight and a full house formed from two triples. These cases expose rule errors more clearly than checking whether an arbitrary probability looks plausible.

## A percentage needs a player-count reference

I later asked for more help interpreting the result as the number of opponents changes.

For illustration, I ran the current native engine 10,000 times per scenario with pocket aces before the flop and uniformly random opponent cards:

| Opponents | Simulated AA equity | Equal share among all players |
|---|---:|---:|
| 1 | 85.1% | 50.0% |
| 3 | 64.2% | 25.0% |
| 8 | 34.4% | 11.1% |

This is one current-code run prepared for the post; the final digits fluctuate. The aces have not changed. There are simply more opportunities for someone else to make a better hand. A 34% result against eight opponents does not by itself describe a weak starting hand.

The native interface adds a reference of $1/m$ for $m$ total players, then displays the percentage-point difference. It also separates hero's final hand-category distribution from the distribution of the strongest opponent in each simulation.

Those displays answer different questions. Hero's category distribution depends on completing the board; the strongest-opponent distribution changes with player count; equity compares everyone. Equal share is only a reading aid. It contains no pot size, bet amount or fold probability and cannot directly determine a call.

## Hitting a draw is different from being strong after it hits

I wanted both the draw most likely to hit and the draw with higher estimated equity after improvement. They need not be the same candidate.

Suppose the hole cards and flop contain four hearts. Nine hearts remain among 47 unseen cards. The probability of seeing at least one of them by the river is:

$$
1-\frac{38}{47}\frac{37}{46}\approx34.97\%.
$$

That measures a hit on the nine-card candidate set, not showdown equity. Even after making a flush, an opponent may have a larger flush, a full house or quads.

The native implementation separates out count, hit probability and an equity estimate after improvement. It also distinguishes conventional flush/straight draws from improvements such as making two pair or trips. “No direct draw” should not imply that no relevant improvement is possible.

There is an approximation worth explaining. The current post-improvement estimate forces one candidate out into the board and randomly completes the remaining deal. With two board cards missing, this is not identical to sampling every runout conditional on at least one hit. The combined candidate ranking also uses hand-written weights. I treat it as explanatory information, not an optimal strategy.

## Card entry gets priority over more panels

![An intermediate native layout with overlapping cards and an off-screen action](/images/texas-equity/native-layout-issue.webp)

*A native iteration that still needed work: the result panel obscures the hole cards and pushes controls below the screen. Adding more information to this layout made existing actions harder to reach.*

I was using an iPhone 13 Pro. I repeatedly asked to remove overlaps and labels covering the cards, and to put draw details behind an expandable view. The native code now anchors the main actions in the bottom safe area, adjusts card sizes and spacing by available height, and gives settings, distributions and draw details their own presentation space. It still contains a scroll view; the aim is fewer unnecessary scrolls in the frequent path.

Card entry received its own revision:

- **Continuous entry:** assigning a card advances to the next position instead of closing and reopening the picker.
- **Used-card restrictions:** cards already selected are unavailable, with duplicate validation underneath.
- **Batch text:** `As Ks Qh Js 5d` enters several cards. `s/h/c/d` mean spades, hearts, clubs and diamonds; ten accepts `T` or `10`, and suit symbols are normalized too.

I considered camera input, but the implementation stops at selection and text. Shortening a repeated interaction was a more direct improvement than adding another complex input route.

## More simulations should still let me change cards

The two versions schedule work differently.

The web page calculates in chunks, updates its result, and yields through [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame). Computation remains on the main thread; yielding does not turn it into background parallelism.

The SwiftUI implementation runs simulation in a detached task and passes partial results back to the main actor. Each run has an identifier. If I replace a card, a late result from the old run cannot overwrite the new hand's display. That check matters more than the progress bar itself.

The web prototype has a working local mobile demonstration. The native project has real iPhone iteration screenshots and subsequent source changes; these are not presented as a single released build or an App Store launch. The useful change was moving beyond a lone percentage. Cards, opponent count, random-hand assumptions, tie shares and sample count now explain what that percentage is conditioned on.
