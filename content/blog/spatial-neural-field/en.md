---
title: "Neural fields for spatial transcriptomics: fitting slices and predicting between them"
date: "2026-10-12"
updated: "2026-10-12"
language: "en"
project: "spatial-neural-field"
excerpt: "Moving coordinate networks from images to gene expression: compressing sparse outputs, comparing SIREN and Fourier networks, and discovering why good two-dimensional fits did not establish reliable predictions between slices."
cover: "/images/spatial-neural-field/research-overview.webp"
coverAlt: "Spatial neural field research roadmap, including exploratory goals not yet validated"
tags: [Spatial transcriptomics, Neural fields, SIREN, Graph autoencoder]
draft: false
---

In my [master's thesis](/blog/multiple-1d-image-reconstruction/), a coordinate network reconstructed an image: position in, color out. Later, while working with spatial transcriptomics, I wanted to replace color with gene expression.

The purpose was practical. Spatial transcriptomics retains measurement positions, but the data still consist of discrete locations and tissue sections. What happens between measured locations, or on an unmeasured slice? Could a coordinate model support imputation, denoising, and analysis of continuous spatial variation? I explored these questions at Guangzhou Laboratory in summer 2025.

I started in two dimensions, extended the inputs to three, and experimented with a time coordinate. Early two-dimensional visualizations were encouraging. Predicting between slices—and deciding whether a smooth expression map was useful—proved harder.

## Research overview: from discrete sections to a queryable field

![Research overview of the spatial neural field project](/images/spatial-neural-field/research-overview.webp)

*An early project roadmap. The upper path connects coordinates to expression reconstruction; the lower branches show intended interpolation and analysis uses. Its 4D and cell-fate branches are exploratory goals, not completed validation results.*

The upper path starts with measurement positions, section membership, and sample stage. The network connects those relationships to expression. A section index identifies a section; it represents physical spacing only when calibrated to real distances.

The lower branches describe three intended uses:

1. **Reconstruction and denoising:** recover expression at measured locations and inspect retained tissue structure.
2. **Interpolation:** hold the model fixed and query unmeasured section positions or times. This requires separate evaluation.
3. **Variation analysis:** examine spatial expression gradients and determine whether their biological interpretation is justified.

They share an interface but answer different questions. The experiments below follow these branches.

## From three colors to thousands of genes

A neural field represents a signal as a function of coordinates. Here the output becomes a vector of gene expression values:

$$
f_\theta(x,y,z)\longrightarrow(e_1,e_2,\ldots,e_G).
$$

$G$ is the number of modeled genes. Each $e_g$ is a preprocessed expression value, not a cell-type label or color. Selecting one gene and mapping its values to colors produces the spatial plots below.

![Single-gene expression comparison in a two-dimensional reconstruction experiment](/images/spatial-neural-field/two-dimensional-gene.webp)

*Reference expression at left and coordinate-model outputs to the right. This compares expression distributions rather than regional labels. Figure from the project presentation.*

Changing the output layer is only part of the adaptation. RGB has three values; expression can have thousands of dimensions, many zeros, variable measurement depth, and noise. A measured zero does not automatically mean a gene has no biological role at that location.

One rewritten pipeline selected 5,000 highly variable genes, normalized total counts, and applied `log1p`. This limited output size and reduced measurement-depth effects. It also meant predictions covered a selected gene set, and errors in normalized expression were not raw-count errors.

![Coordinate-network training and reconstruction design](/images/spatial-neural-field/training-reconstruction.webp)

*A project design diagram: measured positions and expression supervise training at left; frozen weights answer new coordinate queries at right. This depicts the overall interface, not the layer-by-layer GAE prototype below. Time queries still require independent validation.*

During training, expression is the target. For an unmeasured position, inference receives coordinates rather than its true expression. That distinction also motivates checking which measurements reach the encoder later in the pipeline.

## Compress expression before learning coordinates

I explored a graph autoencoder, or GAE, coupled to a coordinate network. The GAE uses spatial neighborhoods to compress measured expression; its decoder expands the representation back into genes. Two paths share that decoder:

```text
Measured expression + spatial graph
                 ↓
           GAE encoder → 32-dimensional representation ──┐
                                                        ↓
Coordinates → coordinate network → predicted representation → decoder → expression
```

This describes my rewritten prototype, informed by [SUICA](https://proceedings.mlr.press/v267/zhu25af.html). SUICA, STINR, and the other reference methods belong to their authors. My work was reproduction and adaptation, not ownership of those original architectures.

The prototype builds a five-neighbor spatial graph and compresses through `2048 → 512 → 64` to 32 dimensions. Its coordinate network expands inputs into 512 Fourier features before an MLP predicts that representation. The interface also accepts time, but this script fixes it to zero; four inputs do not establish prediction across time. The coordinate model has a smaller target, but any important gene detail lost by the encoder becomes difficult to recover downstream.

Training proceeds in stages:

| Stage | Updated component | Main objective |
| --- | --- | --- |
| Align the representation | Coordinate network; decoder frozen | Match the GAE representation and reduce errors at nonzero expression entries |
| Adjust the output | Decoder; coordinate network frozen | A Dice-style nonzero-structure objective with a small L1 term |

The first stage gives the coordinate network a fixed representation to approach. Updating the decoder simultaneously would make both its target and interpretation move. The script also extracts the representation and decoder from the same best GAE checkpoint to keep them consistent.

Nonzero structure here refers to the measured matrix, not established biological truth. The two stages use different losses, so their raw values cannot be compared as one continuous improvement metric.

## Two-dimensional comparisons: detail and smoothness differ

I compared ordinary MLPs, Fourier-feature MLPs, SIREN, and normalized SIREN variants:

| Network | Main distinction | What to inspect |
| --- | --- | --- |
| Plain MLP | Conventional activations | Overall stability and lost detail |
| Fourier-feature MLP | Sinusoidal input mapping | Frequency scale and noise fitting |
| SIREN | Sinusoidal activations inside the network | Fine structure and coordinate derivatives |
| SIREN with normalization | Normalization within the sinusoidal network | Changes in optimization, smoothness, and local structure |

A SIREN layer has the form $\sin(\omega_0(Wx+b))$. This differs from adding Fourier features before a conventional MLP. The [SIREN paper](https://www.vincentsitzmann.com/siren/) demonstrates periodic networks for signal and derivative fitting; that motivated the experiment without establishing an advantage on my spatial data.

![Regional structure comparison in a two-dimensional experiment](/images/spatial-neural-field/two-dimensional-regions.webp)

*Left to right: reference regions, SIREN-BN, original SIREN, FFN. The normalized output is smoother; the other two retain more local variation. Color similarity alone does not measure segmentation accuracy without consistent clustering and label matching.*

Smoothness can remove noise or merge small regions. Extra detail can preserve a boundary or memorize measurement noise. I needed to inspect individual genes, regional structure, and errors together instead of choosing the most attractive map.

Normalization did not win consistently across datasets. Some results became easier to read; others were unconvincing. These trials exposed model preferences, but I did not have a complete, uniformly controlled performance table supporting a universal ranking.

## Many points, few positions along the slice axis

A section may contain many measured locations. Across a few sections, total sample count looks large, while the $z$ axis still has very few distinct observed values. Adding a third input coordinate does not supply observations in the gaps.

![Three-dimensional Pcp4 visualization](/images/spatial-neural-field/three-dimensional-volume.webp)

*A Pcp4 volume visualization from the project. Its apparent completeness helps inspect spatial shape, but does not establish accurate predictions between sections.*

![Pcp4 output comparison for section four in the three-dimensional experiments](/images/spatial-neural-field/slice-comparison.webp)

*Reference expression, SIREN-BN, original SIREN, and FFN for `sec=4`. The associated presentation describes four of seven sections used for training. The figure shows shape and intensity differences, not independent test-set error statistics.*

Both SIREN outputs recover part of the central shape while differing from the reference in intensity and detail. FFN is low across much of this example. This documents differences in one experiment, not a general failure of FFN or a solved three-dimensional imputation problem.

![Pcp4 section comparison for MixNet and MixFusion-3D](/images/spatial-neural-field/mixed-network-comparison.webp)

*Reference expression, MixNet, and MixFusion-3D from the same presentation, all on a 0–6 color scale. Compare the location, intensity, and local variation of high-expression regions with the preceding figure.*

The comparisons also included mixed-network outputs. MixNet forms more contiguous high-expression regions with a few bright local peaks; MixFusion-3D retains more local variation, while its central shape still differs from the reference. These support specific visual observations, rather than a model ranking without matched splits and metrics.

In subsequent between-section predictions, a good fit on training layers did not translate into stable intermediate layers. One explanation was that high-frequency networks could pass through the observed points in many ways. Those functions could have similarly low training errors and different values in the unobserved intervals. Registration error and measurement noise could also be fitted.

A plain MLP's smoothness sometimes helped. This was a dataset-specific observation and explanation, rather than proof that SIREN cannot interpolate. I also considered SIREN for $x/y$ and a smoother network for the slice axis; that idea did not become a conclusive final experiment.

### Check what the encoder sees, not only the loss split

Randomly withholding points within a measured section differs from withholding an entire section. The evaluation must match the missing locations the model is supposed to predict.

My rewritten prototype selects training and validation locations by section. However, the GAE encodes expression on the full spatial graph, and highly variable gene selection precedes the split. Restricting training loss to training indices does not prevent validation-section expression from entering the representation.

That prototype therefore does not establish a fully blind missing-section test. Such an evaluation must also isolate feature selection, encoder inputs, and model selection before scoring independent test sections. This issue is separate from unstable interpolation: both information access and predictions in the unobserved region need checking.

## A gradient is computable—but what does it mean?

A continuous expression function can be differentiated. For gene $g$, $\nabla f_g$ describes spatial variation in modeled expression. That enables arrow plots and inspection of regions with rapid change.

![Exploratory spatial expression gradient field](/images/spatial-neural-field/gradient-field.webp)

*A project gradient visualization; its title records a 90-degree clockwise display rotation. Arrows represent modeled spatial variation, not cell movement or developmental trajectories.*

I initially hoped these changes could help analyze tissue structure and explore directions of state variation. But expression changing across space does not mean a cell will travel in that direction or differentiate toward a particular fate.

I also examined [GASTON](https://www.nature.com/articles/s41592-024-02503-3), which learns a low-dimensional spatial axis and uses it to describe regions and expression variation. Differentiating that axis differs from differentiating thousands of separate gene functions. Both produce arrows; they need not answer the same question.

The exploration did not produce a leading new method. I had reproduced and adapted networks, but the biological analysis did not become clear simply because the representation became more flexible. I reduced the effort spent adding architectures and chasing baselines.

The practical lessons were to specify which locations need prediction, choose a matching evaluation, distinguish expression maps from region and gradient plots, and inspect compression, coordinate fitting, and decoding separately. An unsuccessful result can then point to a modeling problem, an evaluation problem, or a research question that needs revision.

For background, see [neural fields and Fourier features in my master's thesis](/blog/multiple-1d-image-reconstruction/). This article reviews the subsequent spatial-data exploration; the historical models and figures were not rerun for this post.
