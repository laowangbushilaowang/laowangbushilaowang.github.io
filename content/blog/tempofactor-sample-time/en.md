---
title: "TempoFactor: reading time from single cells"
date: "2026-10-16"
updated: "2026-10-16"
language: "en"
project: "tempofactor"
excerpt: "A sample has an age; its cells do not all share a developmental state. Notes from working on a two-part latent model, reproducing stage prediction, and discovering how much a gene ranking depends on where we average."
cover: "/images/tempofactor/overview.webp"
coverAlt: "Original TempoFactor project overview showing expression, reference stages and temporal mapping of query cells"
tags: [Single-cell, VAE, Representation learning, Gene attribution]
draft: false
---

A developing tissue can contain both progenitors and mature cells. They have the same sample age and very different expression profiles. Cells from different sample ages can also occupy similar states.

That makes predicting time from expression a surprisingly slippery task. A model might learn cell identity or experimental batch and still produce a respectable age prediction. We want to understand which expression changes follow the sample's developmental stage and which follow the state of the cell itself.

I described the starting point in [an earlier post about sample age and pseudotime](/blog/niche-time-pseudotime/). SCage / TempoFactor turned that broad question into a more concrete task: **learn a representation from single-cell expression, predict sample stage, then use the model to study genes and spatial organization.**

This is ongoing team research at Guangzhou Laboratory. My work includes model refactoring, reproducing analyses from source data, checking comparisons, gene attribution and figures. The team already had a model and workflow when I took on this work. One of my jobs was to find out what the scores actually meant.

## What Shared and Time are supposed to do

Single-cell RNA sequencing gives us a cells-by-genes matrix. Each cell has thousands of measurements, but its time label usually comes from the sample. Assigning that label to every cell does not make every cell equally mature.

TempoFactor builds on a scVI-style variational autoencoder. An encoder compresses expression into a low-dimensional representation; a decoder uses it to reconstruct expression. Counts are modeled with distributions such as NB or ZINB rather than treating every measurement as an ordinary continuous target. The [scVI model documentation](https://docs.scvi-tools.org/en/stable/user_guide/models/scvi.html) describes that foundation.

The representation is divided into two parts:

| Part | Intended role | How we use it |
|---|---|---|
| `z_shared` | A richer representation of cell state | Expression reconstruction, integration views and gene attribution |
| `z_time` | A compact sample-stage-associated representation | Time prediction and a contribution to expression reconstruction |

![TempoFactor encoder, latent branches, expression decoders and time supervision](/images/tempofactor/architecture.webp)

*An original project slide. “Intrinsic” corresponds to Shared in this post: it names an intended role, not an established pure biological factor. This drawing uses 24+2 dimensions; later experiments also use 24+4. The objectives along the bottom are configurable and are not all enabled in every experiment.*

Both parts contribute to reconstruction. A nonlinear Shared decoder supplies an expression base; a linear Time decoder supplies gene-wise adjustments. They are combined in logit space and normalized into expression proportions. Omitting sampling, batch inputs and count-distribution parameters, the relationship is:

```python
# Structural sketch, not the complete model implementation
z_shared, z_time = encoder(counts)
gene_logits = log(shared_decoder(z_shared)) + time_decoder(z_time)
expression_proportion = softmax(gene_logits)
predicted_stage = time_head(z_time)
```

Time therefore participates in explaining expression, rather than serving only an attached regression head. But the architecture leaves an empirical question: how much time information remains in Shared? Splitting a vector is easy. Giving the pieces distinct biological meanings is considerably harder.

### Supervision has to respect the sample

One sample may contribute tens of thousands of cells, another only a few thousand. Averaging the time loss over cells would give the larger sample more influence.

The model supports sample-level supervision. In `cell_agg` mode, cell predictions are averaged within a sample before comparison with its label:

$$
\hat t_s=\frac{1}{n_s}\sum_{i\in s}h(z_{\mathrm{time},i}).
$$

Here $s$ is a sample and $n_s$ is the number of its cells participating in that aggregation. A Huber loss encourages accurate values; a ranking loss encourages the correct order between stages. Batch, within-sample variation and cross-covariance penalties are available as separate switches. Their presence in the implementation does not establish biological disentanglement.

## What exactly was held out?

My first reproduction held out some donors. The team's original workflow held out one stage at a time. Both were held-out evaluations, but they asked different questions.

Holding out a donor asks whether prediction transfers to another sample. Holding out a stage asks whether a stage absent from time supervision can be placed on the time axis. If the training set contains other donors of the same age, the first question does not test everything in the second.

I subsequently aligned the workflow to stage-wise folds and examined cell- and sample-level results separately. This historical fetal-lung run used 12 donors across eight stages, sampling 1,200 cells per donor. Sample predictions were medians of cell predictions.

| Method | Sample MAE ↓ | Sample Spearman ↑ |
|---|---:|---:|
| TempoFactor | 0.763 | 0.796 |
| TemporalVAE | 0.819 | 0.810 |
| scVI + MLP | 0.937 | 0.627 |
| Harmony + MLP | 0.917 | 0.662 |

The eight labels were encoded as 0–7: **MAE is in stage-code units, not gestational weeks.** TempoFactor had lower MAE; TemporalVAE had higher rank correlation. “More accurate” needs a metric attached.

Checking the code exposed a second issue. Harmony constructed its representation from all expression data; scVI received eight additional query-adaptation epochs; TempoFactor performed no query training and removed query time labels. Highly variable genes were also selected before the split. These were useful diagnostic results, but the information-access conditions were not aligned for a final blind comparison. [TemporalVAE](https://www.nature.com/articles/s41556-025-01787-7) is an external method; its numbers here describe this project run, not the method in general.

![The same fetal-lung Shared UMAP colored by stage, predicted time, cell types and donor](/images/tempofactor/lung-umap.webp)

*This visualization comes from a separate full-data model, not the out-of-fold predictions in the table. The different colorings help inspect cell identity, time structure and donor separation. A two-dimensional embedding does not by itself establish generalization or disentanglement.*

That reproduction changed how I read a benchmark. I now start with what each method could access and how predictions were aggregated. Otherwise, two similar-looking notebooks can quietly be answering different questions.

## Gene ranking: change the averaging population first

Stage prediction is an intermediate task. I also want useful gene candidates from the model.

One approach examines input gradients. Another sets a gene's input to zero and measures how much the representation changes. Gradients describe local sensitivity; zeroing measures the response to a specified perturbation. Both reveal model dependence, not the outcome of a biological knockout.

We compared rankings across intestine, lung, retina, cerebellum, gonad, limb and two brain-development datasets. I worked on reviewing developmental literature and reference genes so that a fixed candidate budget had something concrete to be checked against. Those lists contain developmental, identity and functional genes. An unlisted gene is not a known negative, so reference recovery is not the precision of novel-gene discovery.

An October analysis brought the problem back from choosing a sophisticated attribution method to a simpler question: **which cells should contribute to a gene's average effect?**

Consider a gene detected in only a small cell population. Zeroing it changes little in the many cells where it was already zero. Averaging over the entire tissue dilutes the effect in the cells where it was detected. FOXJ1 in the lung data provided a concrete case to investigate.

The revised readout averages the change in Shared only over cells in which that gene is detected:

$$
S_g=\underset{i:x_{ig}>0}{\operatorname{mean}}
\left\|z_{\mathrm{shared}}(x_i)-z_{\mathrm{shared}}(x_i^{g\leftarrow0})\right\|.
$$

This equation describes the aggregation idea; the scoring implementation also needs consistent scaling. Conditioning avoids dilution, but a gene detected in very few cells can now depend heavily on those observations. Donor and cell-type coverage still matter.

At the top 10% of candidates in each dataset, the totals across the eight reference lists were:

| Readout | Reference records recovered |
|---|---:|
| Original Shared score | 553 |
| Zeroing effect averaged over all cells | 279 |
| Zeroing effect averaged over detecting cells | 575 |
| Saliency also aggregated over detecting cells | 569 |
| Conditional zeroing + decoder expression variation, equal-weight rank fusion | 631 |
| scVI with the analogous fused readout | 622 |

A gene present in multiple datasets contributes a separate reference record in each. These totals are not counts of distinct gene symbols.

The difference between 575 and 279 made the aggregation population hard to ignore. The 569 from conditional Saliency also prevented me from crediting the entire gain to zeroing as an algorithm.

Fusion then combined two kinds of model evidence. The input side asks which genes the representation depends on; the output side asks how much the decoder's predicted expression varies across cells. Decoder variation helped recover references such as CDX2 and NEUROD1. But a fixed budget means additions displace other candidates: relative to conditional zeroing alone, fusion gained 106 reference records and lost 50, reaching 631.

![Candidate-budget versus reference-recovery curves across eight datasets](/images/tempofactor/gene-recovery.webp)

*The red curve uses conditional zeroing plus decoder variation. The original plot omits the old Shared and analogous scVI readouts; read it alongside the table's top-10% totals of 553, 631 and 622. Effects differ by tissue. The steep lung curve is not the whole comparison.*

631 and 622 are close. This supports further testing of the readout, not a unique advantage of the two-part architecture. Repeatedly adjusting lists could produce a better-looking benchmark without resolving the model question. The next test needs frozen rules and data or donors that did not participate in these choices.

## Putting the predictions back into tissue

A downstream use of time prediction is to map it onto spatial transcriptomics: within one collection stage, which locations resemble earlier or later expression states?

In the placental analysis, we examined labyrinth trophoblasts and the LaTP/Chorion region near the chorionic plate. LaTP/Chorion is a spatial annotation, not a pure cell state. Subtracting a same-stage reference and standardizing within each section produces a relative temporal residual.

![Anatomy, time residuals and spatial references in MPSTA and STAMP placenta sections](/images/tempofactor/spatial-map.webp)

*The original analysis figure shows MPSTA above and STAMP below. Anatomy is on the left, each atlas's temporal residuals in the middle, and compartment or distance references on the right. Blue means earlier relative to the reference, not movement or developmental speed. The atlases were modeled and standardized separately; their residual values are not directly subtractable.*

In MPSTA, the broad trophoblast population near LaTP/Chorion had an earlier predicted program. The prespecified spatial direction was concordant in only three of five localizable external STAMP sections, however, and did not reproduce consistently. Independent gene modules intended to measure maturation were also insufficiently reliable.

Several explanations remain entangled: a region may contain more early-state cells, cells within a broad type may differ in state, platforms and annotations may differ, or location may be associated with an expression program. A temporal residual helps formulate those questions. It does not separate them, and thousands of spatial points do not substitute for independent embryos.

I retain this as a local spatial association and a hypothesis for follow-up. It does not show that a location makes cells develop more slowly. Speed would require a calibrated time scale and credible correspondence across stages; a positional effect would require stronger replication and intervention evidence.

## What the two-part model still has to earn

The question I keep returning to is whether Shared and Time together solve something a capacity-matched single latent space cannot.

A frozen-model retinal readout provided a direct check. Concatenating Shared24 and Time4 into Joint28, then applying a prespecified gradient aggregation, did not improve the ranking:

![Reference recovery from Shared24, Time4 and their Joint28 concatenation in retina](/images/tempofactor/joint-readout.webp)

*With the same full cell pool and top-10% budget, Shared24 recovered 75/96 references, Time4 recovered 24/96 and Joint28 recovered 59/96. Joint is concatenation, not a separately trained model. The result tests this readout, not every possible combination.*

Giving a readout more dimensions does not automatically give it more useful information. Historical 24+1 capacity-matched experiments also failed to establish a two-space advantage. Shared retains substantial time information, and Time directions outside the age-prediction direction can still affect reconstruction. Clean disentanglement remains a testable goal rather than something granted by the architecture diagram.

The research question I now find more useful is whether cells of the same age can differ along several maturation processes that need not progress together. To identify those factors from snapshots, we first need comparable observations: the same age at different maturities, or different ages at similar states, together with independent maturation measurements. Without that coverage, extra modules and constraints can yield attractive but ambiguous representations.

The original model remains a baseline. New modular constraints have not shown a stable improvement in a small hidden-gene prediction pilot either. This work is continuing. The result I want next is specific: evidence on genuinely held-out samples that a defined model change improves a defined task, beyond giving two latent blocks more appealing names.
