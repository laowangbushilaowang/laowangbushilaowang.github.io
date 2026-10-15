---
title: "Two time axes in single-cell data: sample age and pseudotime"
date: "2026-10-15"
updated: "2026-10-15"
language: "en"
project: "niche-time-pseudotime"
excerpt: "A gene can increase along differentiation and decrease with sample age. An exploration of trajectories, overlapping states, residual regression, NAMs, and VAEs—and what the data could actually separate."
cover: "/images/niche-time-pseudotime/retina-trajectories.webp"
coverAlt: "Retinal cells colored by path ordering, DPT pseudotime, and cell type"
tags: [Single-cell, Pseudotime, Regression, Representation learning]
draft: false
---

Was the gene going up or down? In the fetal liver analysis, it could do both: increase along the monocyte-to-Kupffer trajectory and decrease with the age of the sampled tissue.

Both plots could be correct. They were asking different questions.

In autumn 2025, after working on [spatial neural fields](/blog/spatial-neural-field/), I turned to this distinction. **How much of an expression change follows the cell's developmental state, and how much follows the developmental stage of the sample?** We wanted to separate those patterns and identify genes worth investigating. This work later fed into SCage / TempoFactor. This post covers the initial exploration.

## The sample has an age; the cell has a position in a process

Single-cell sequencing usually gives us a snapshot. We know when a sample was collected and measure many cells, without following each cell through its development.

Pseudotime estimates a relative ordering from expression and trajectory structure. [Diffusion pseudotime, or DPT](https://www.nature.com/articles/nmeth.3971), was one method I used. Its values are not measured in days or weeks.

| Axis | Where it comes from | What it tells us here |
| --- | --- | --- |
| Sample time: age, stage, PCW | Collection and developmental metadata | When was the tissue sampled? |
| Cell pseudotime | An ordering estimated from expression and neighborhood structure | Where is the cell along a selected process? |

A later sample can still contain cells in early states. An earlier sample may already contain some mature cells. The two axes are related, but they are different measurements.

![Retinal cells colored by path ordering, DPT, and cell type](/images/niche-time-pseudotime/retina-trajectories.webp)

*Retinal analysis from the project: path ordering on the left, DPT in the middle, cell types on the right. Agreement between orderings can help inspect a trajectory; it does not calibrate either ordering into developmental days.*

Our initial target was a three-way grouping: **G** for genes varying mainly with pseudotime, **g** for genes varying mainly with sample time, and **Gg** for genes associated with both. That described the goal. It did not yet specify how to make the comparison credible.

We called the direction “niche time.” What we could directly observe was sample time, which also carries differences in environment, donor, and experimental conditions. A stage-associated gene would not, by itself, establish an environmental cause.

## Choosing comparable cells came before choosing a model

The first obstacle was deciding which cells belonged in the same analysis.

A cell-type label can cover multiple states or branches. Extracting every cell with that label and computing one pseudotime can produce a gradient unrelated to the process of interest. I increasingly focused on selecting a coherent branch, then checking its root, neighborhood graph, and expression markers.

![Local DPT within retinal cell groups](/images/niche-time-pseudotime/local-pseudotime.webp)

*Local DPT calculated within retinal cell groups; other cells are gray. Each panel has its own normalized 0–1 ordering. A value of 0.8 in one group is not directly comparable with 0.8 in another.*

Preprocessing changed the picture too. I compared highly variable gene selection, PCA, and results with and without Harmony. [Harmony](https://www.nature.com/articles/s41592-019-0619-0) integrates dataset differences, but some sample differences were precisely the age signal we wanted to retain. When age and sample identity are tightly linked, correcting sample identity can also remove relevant biology.

I therefore checked cell types, sample stages, and trajectory continuity together, and considered integration of replicates within each stage. A well-mixed UMAP was insufficient as the only criterion.

With a plausible branch, I used binning, expression summaries, and trend comparisons. For that comparison to be meaningful, several steps need to stay distinct:

1. **Bin pseudotime.** Group cells occupying nearby positions along the selected process.
2. **Keep sample identity.** Summarize expression within sample-by-pseudotime groups and inspect age differences at similar states.
3. **Check the other direction.** Inspect pseudotime trends within ages.
4. **Compare stability.** Ask whether a candidate depends on a single group or has a similar trend in other comparable groups.

These summaries help reveal patterns. Samples remain the independent replicates; thousands of cells do not become thousands of independent donors. Binning also sacrifices variation within each interval.

### A missing comparison cannot be smoothed into existence

In one check, cells from weeks 13 and 14 appeared only toward the later trajectory bins, while week 17 covered most bins. Averaging all cells at each age would mix age differences with differences in state composition.

This made stability checks more useful to me than increasingly elaborate curve-shape scores. There were relatively few age points, and individual points could change the apparent shape substantially. A smooth line could hide that weakness.

I tried comparing local trends across groups against the overall trend. It helped identify candidates supported by only a few groups. But where there was no overlapping state coverage, the comparison remained missing. Interpolation could not supply the absent observations.

## Fetal liver: a gene can move in opposite directions

In the fetal liver analysis, I inspected monocyte, Mono-Mac, and Kupffer-related states, then examined expression along pseudotime and sample age separately.

![Fetal liver embedding colored by pseudotime and sample stage](/images/niche-time-pseudotime/liver-two-times.webp)

*The same embedding colored by pseudotime and sample stage. This exposes overlap and disagreement between the axes. Embedding distances are not physical developmental distances.*

TIMD4, MARCO, and VSIG4 were higher toward the later part of the selected trajectory. HLA-related genes and CD74 showed another set of changes across sample ages. The heatmaps below show the two views.

![Candidate expression across sample ages](/images/niche-time-pseudotime/age-expression.webp)

*Sample age on the horizontal axis; colors show standardized expression. They describe relative changes within genes, not absolute expression differences between genes.*

![Candidate expression across pseudotime bins](/images/niche-time-pseudotime/trajectory-expression.webp)

*Pseudotime bins on the horizontal axis. These are different candidate sets from the age heatmap, rather than a row-matched paired experiment.*

Candidates with discordant directions were especially useful for deciding what to investigate next:

| Examples | Along pseudotime | Across sample ages | Question to resolve |
| --- | --- | --- | --- |
| HMOX1, SLC40A1 | Increasing | Decreasing | How do within-branch changes interact with age coverage and composition? |
| HLA-DRA, HLA-DRB1, CD74 | Decreasing | Increasing | Is the difference associated with state, sample background, or other covariates? |
| CD5L, CTSL | Increasing | Increasing | How can the contributions be separated when both axes agree? |

These were exploratory trends in this analysis, not permanent gene categories. Opposite directions did not prove successful disentanglement. Branch selection, sample coverage, and composition could all affect them. What they provided was a more specific question than a pooled differential-expression list.

## Residual regression, NAMs, and VAEs

One understandable baseline was to fit expression along pseudotime, then examine whether stage explained the residual.

In one implementation, the first fit used a cubic polynomial:

$$
\widehat y_i = \beta_0+\beta_1p_i+\beta_2p_i^2+\beta_3p_i^3,
\qquad r_i=y_i-\widehat y_i.
$$

Here $y_i$ is a gene's `log1p` expression, $p_i$ is pseudotime, and $r_i$ is the residual. I then regressed residuals on stage, inspecting pseudotime explained variance, residual stage explained variance, and stage-level residual means. This describes the method used; it is not a new experiment.

I could inspect what the first fit removed and what remained. The order also mattered: **removing pseudotime first preferentially assigns shared variation to pseudotime.** When age and state are strongly correlated, the remaining residual is not a clean estimate of age's contribution. A conditional-effect analysis needs an appropriate joint model or corresponding residualization; these two steps alone do not identify a cause.

| Approach | How it separates the axes | What I observed at the time |
| --- | --- | --- |
| Polynomial pseudotime fit, then stage regression | Explain state first, inspect stage in residuals | Inspectable curves and candidates; sensitive to fitting order |
| Binned curves and stability scores | Summarize both directions and compare consistency | Makes coverage visible; sensitive to bins and sparse groups |
| Neural additive model, or NAM | Separate small MLPs for pseudotime and age, added together | Allows nonlinear trends; candidate functions were mixed |
| Covariate-supervised VAE | Separate latent paths with supervision and decoding | More flexible representation; separation remained unsatisfactory |

The NAM can be written as $\widehat y=f_{\mathrm{dev}}(p)+f_{\mathrm{stage}}(t)$. It looks like the question we wanted to answer. Yet when $p$ and $t$ move together, the networks can allocate the same signal differently. Naming the branches does not identify their effects.

In the VAE experiments, I also tried two latent groups, supervision from pseudotime and stage, and a penalty intended to reduce dependence between the axes. Some leading candidates were still stress-related genes such as HSPA1A and HSPA1B. The residual approach produced candidates including BGN, THBS1, and COL3A1 that were easier to inspect in relation to the question.

That did not establish a universal advantage for residual regression. Biologically familiar candidates can also encourage selective interpretation. At that stage, though, I preferred a baseline whose intermediate results I could examine to assuming that a plausible architecture had separated the factors.

## What changed after this exploration

The work exposed a limitation more fundamental than model choice: some datasets did not contain enough independent variation between sample age and cell state to support the decomposition we initially wanted.

The later SCage / TempoFactor work gradually narrowed the task. First predict sample time and evaluate held-out samples; then examine representations, gene attribution, and spatial applications. Predicting a label and identifying the factors behind it require different evidence.

The lesson I carried forward was to inspect where the comparison actually occurs before replacing the model: which cells form one branch, which samples cover comparable states, and which differences preprocessing preserves. Without those checks, a smoother curve or a more elaborate latent space tells me little about why the gene changed.

The data requirements also helped motivate [BioFlow](/blog/bioflow-dataset-pipeline/). Before comparing time across tissues and studies, we needed datasets that could support the comparison.
