---
title: "EMRNet: my undergraduate project in image restoration"
date: "2026-10-10"
updated: "2026-10-10"
language: en
project: emrnet
excerpt: "I wanted to work with neural networks and see the results directly. Starting from MPRNet, I explored attention, cross-stage information flow and normalization for image restoration."
cover: /images/emrnet/architecture.webp
coverAlt: "EMRNet architecture with two encoder-decoder stages and an original-resolution final stage"
tags: [Image Restoration, MPRNet, Attention, Undergraduate Thesis]
draft: false
---

My reason for choosing this undergraduate thesis was straightforward: I wanted to work with neural networks. They were attracting a lot of attention, and images offered a direct way to show what a model did. Put a noisy or blurred photograph beside its restored version, and the reader can understand the task before hearing about the architecture.

I chose image restoration, built on MPRNet, and called my modified network EMRNet. My work covered attention, activations, normalization and information transfer between stages, with experiments on denoising, deraining and deblurring.

Once I started working through the network, “make the image clearer” became several more specific questions. Which responses should survive? What should one stage send to the next? Downsampling gives context, but what happens to the details?

## Why restore an image in three stages?

Detection asks for object locations and classes. Restoration asks for an entire image: its texture, color and edges all matter. Removing rain is less useful if the network removes fine branches along with it.

[MPRNet](https://arxiv.org/abs/2102.02808) uses two encoder-decoder stages followed by an original-resolution network, ORSNet. I kept that overall structure.

![The three-stage EMRNet architecture](/images/emrnet/architecture.webp "Read the stages from top to bottom. The first two use multiscale processing; the last uses ORSNet. Dashed connections transfer features across stages. The images illustrate stage outputs, not an ablation comparison.")

There are two paths to follow in the diagram: processing within each row, and information moving between rows.

1. The first stage processes four image patches and combines their features.
2. The second works on two larger regions, using an encoder-decoder and features from the previous stage.
3. The final stage processes the full image at its original resolution.

Original resolution refers to the main processing branch of the last stage. Earlier multiscale features still need alignment before they enter that branch.

This design helped me understand the tradeoff between context and detail. Smaller feature maps make wider spatial relationships easier to process. The final full-resolution branch gives those relationships a route back into local refinement.

## What I changed: channels, locations and stage connections

I adjusted channel attention, calling it ACA; added spatial attention blocks, SAB, in the decoder; and explored supervised channel attention, SCAM, for information passed between stages.

| Change | Question it addresses | Tradeoff to check |
| --- | --- | --- |
| ACA: adjusted channel attention | Which feature responses help restoration? | Weak details can matter as much as strong texture |
| SAB: spatial attention | Where does the image need more processing? | Rain streaks can resemble real fine edges |
| SCAM: supervised channel attention | Which information should reach the next stage? | Later stages still need room to correct earlier decisions |

Channels here are learned feature responses, not the three RGB colors. A common channel gate summarizes each channel, generates a weight and multiplies that weight back into the feature map. This short example illustrates the operation rather than reproducing my full ACA implementation:

```python
summary = features.mean(dim=(2, 3), keepdim=True)
weights = channel_gate(summary).sigmoid()
output = features * weights
```

For `[B, C, H, W]` features, the summary has shape `[B, C, 1, 1]`. Each channel receives a weight shared across its spatial positions. Spatial attention instead varies weights by location.

That distinction matters when degradation is uneven. Noise, rain streaks and blur need not occupy the same regions or have the same appearance. Channel weighting and spatial selection address different questions. Combining them was a direction I explored; whether the combination preserved better details still requires a controlled comparison.

## Passing more than an output image

A sequence of three networks could simply pass restored images forward. MPRNet also transfers intermediate encoder and decoder features at multiple scales through cross-stage feature fusion, or CSFF. [Baseline implementation](https://github.com/swz30/MPRNet/blob/main/Denoising/MPRNet.py)

Its supervised attention module, SAM, generates a stage image from the current features and uses that image to produce attention weights for the outgoing features. Supervision comes from training against the stage output, rather than manually drawing an attention map.

```text
Current features → Stage image → Attention weights
       │                              │
       └── Feature weighting + residual ─→ Next stage

Multiscale encoder / decoder features ───→ Next stage
```

My motivation for SCAM was to make this transfer more selective. Its connection to SAM does not make their exact operations interchangeable.

The position of a module matters as much as its isolated behavior. A better-looking intermediate image does not necessarily imply better features for the following stage. Stage outputs, connecting features and the final result belong in the same analysis. Cross-stage transfer was already part of MPRNet; my work modified that foundation.

## Activations and normalization can change the image too

I also tried Mish and Swish at different positions and added Instance Normalization in the U-Net. These changes are less visible in an architecture diagram, but affect how each layer handles values.

Swish is $x\sigma(x)$; Mish is $x\tanh(\mathrm{softplus}(x))$. Unlike ReLU, they retain some negative responses and vary smoothly. Neither property by itself establishes better restoration. When several changes are introduced together, their individual contributions become harder to separate.

InstanceNorm computes statistics separately for each image and channel, without relying on the whole batch. That is convenient for small batches. Restoration, however, must preserve brightness and contrast, precisely the statistics normalization changes. Learnable scale and offset parameters and the layer's placement also matter. [PyTorch definition](https://docs.pytorch.org/docs/stable/generated/torch.nn.InstanceNorm2d.html)

A classification network may benefit from ignoring illumination. A restoration network is expected to return plausible colors for the same scene. I therefore need to consider color shifts, weakened texture and oversmoothing as well as removed artifacts.

## What counts as a better restoration?

Denoising, deraining and deblurring share an image output, but their degradation differs. A common architecture does not establish that one set of weights handles every task without separate training.

| Task | Main problem | Failure that can hide behind a cleaner image |
| --- | --- | --- |
| Denoising | Random perturbations cover detail | Texture disappears with the noise |
| Deraining | Rain streaks overlap real edges | Fine branches or wires are removed |
| Deblurring | Edges and textures spread out | Sharpening introduces ghosts or artifacts |

PSNR relates to pixel error:

$$
\mathrm{PSNR}=10\log_{10}\left(\frac{\mathrm{MAX}^2}{\mathrm{MSE}}\right).
$$

`MAX` is 1 for a 0–1 image or 255 for an 8-bit image. Lower mean squared error gives higher PSNR. SSIM compares local brightness, contrast and structure. Comparisons need consistent cropping, color space and normalization.

I leave improvement percentages out of this retrospective. The useful part is how the changes relate to the task and how to evaluate their contributions. A score for a version containing several changes evaluates that version; attributing gains to an individual component needs ablations with consistent data splits and training budgets.

I chose images because the results were easy to see. Working on restoration taught me that seeing a difference and explaining it are separate tasks. What survived, what disappeared, and what reached the next stage became more useful questions than the names of the modules.
