---
title: "EMRNet: my undergraduate project in image restoration"
date: "2026-10-10"
updated: "2026-10-10"
language: en
project: emrnet
excerpt: "I wanted to work with neural networks and see the results directly. Starting from MPRNet, I explored structural changes and reflect on why they did not yet amount to a well-grounded research argument."
cover: /images/emrnet/architecture.webp
coverAlt: "EMRNet architecture with two encoder-decoder stages and an original-resolution final stage"
tags: [Image Restoration, MPRNet, Attention, Undergraduate Thesis]
draft: false
---

My reason for choosing this undergraduate thesis was straightforward: I wanted to work with neural networks. They were attracting a lot of attention, and images offered a direct way to show what a model did. Put a noisy or blurred photograph beside its restored version, and the reader can understand the task before hearing about the architecture.

I chose image restoration, built on MPRNet, and called my modified network EMRNet. My work covered attention, activations, normalization and information transfer between stages, with experiments on denoising, deraining and deblurring.

I do not consider this a particularly successful thesis. Much of it was an exploration of changes to an existing model: attention, activations, normalization and stage connections. I had not sufficiently established a specific problem, reasoned from its underlying principles and then verified a targeted solution. This retrospective separates the actual changes from the rationale I could give for them.

## Why restore an image in three stages?

Detection asks for object locations and classes. Restoration asks for an entire image: its texture, color and edges all matter. Removing rain is less useful if the network removes fine branches along with it.

[MPRNet](https://arxiv.org/abs/2102.02808) uses two encoder-decoder stages followed by an original-resolution network, ORSNet. I kept that overall structure.

![The three-stage EMRNet architecture](/images/emrnet/architecture.webp "Read the stages from top to bottom. The first two use multiscale processing; the last uses ORSNet. Dashed connections transfer features across stages. The images illustrate stage outputs, not an ablation comparison.")

There are two paths to follow in the diagram: processing within each row, and information moving between rows.

1. The first stage processes four image patches and combines their features.
2. The second works on two larger regions, using an encoder-decoder and features from the previous stage.
3. The final stage processes the full image at its original resolution.

Original resolution refers to the main processing branch of the last stage. Earlier multiscale features still need alignment before they enter that branch.

The labels help locate the work: `ACAB` denotes a feature block with adjusted channel attention; `SCAM` sits between the first two stage outputs and the following stage. Yellow `C` and `Concat` indicate feature concatenation; the final `+` is residual addition. Green `ORB` blocks make up ORSNet. SAB, activations and normalization are internal changes that this overall diagram does not expand layer by layer.

The three-stage skeleton, encoder-decoders and ORSNet come from MPRNet. I changed components and connections within that foundation.

This design helped me understand the tradeoff between context and detail. Smaller feature maps make wider spatial relationships easier to process. The final full-resolution branch gives those relationships a route back into local refinement.

## The main changes and their rationale

I adjusted channel attention, calling it ACA; added SAB in the decoder; explored SCAM at stage connections; and tried activations and normalization.

| Location | MPRNet baseline | My change and intended role |
| --- | --- | --- |
| Feature blocks | CAB already includes channel attention | ACA adjusts channel weighting; the diagram labels the modified blocks ACAB |
| Decoder | Multiscale reconstruction and fusion | SAB introduces location-dependent selection |
| Stage connections | SAM and cross-stage feature fusion | SCAM explores more selective channel transfer |
| Nonlinearity | PReLU in the main feature blocks | Mish and Swish change responses and gradient behavior |
| U-Net | No InstanceNorm in the inspected baseline | InstanceNorm adjusts feature statistics, with artifact reduction as a motivation and color fidelity as a concern |

ORSNet is a retained baseline design, not another new component. [Original implementation](https://github.com/swz30/MPRNet/blob/main/Denoising/MPRNet.py)

### ACA: changing attention that was already there

I did not introduce channel attention into a network that lacked it. ACA was an attempt to adjust its selection mechanism for restoration features.

Learned responses may represent edges, texture or color, but strong responses can come from degradation too. Weighting channels is a reasonable direction for retaining useful information; response strength alone does not establish which information belongs to the clean image.

Channels here are learned feature responses, not the three RGB colors. A common channel gate summarizes each channel, generates a weight and multiplies that weight back into the feature map. This short example illustrates the operation rather than reproducing my full ACA implementation:

```python
summary = features.mean(dim=(2, 3), keepdim=True)
weights = channel_gate(summary).sigmoid()
output = features * weights
```

For `[B, C, H, W]` features, the summary has shape `[B, C, 1, 1]`. Each channel receives a weight shared across its spatial positions. Spatial attention instead varies weights by location.

### SAB: location selection in the decoder

Adding SAB in the decoder gives the network a location-dependent weighting step as multiscale features reunite and spatial detail is reconstructed. Rain, blur and noise can vary across an image, motivating more than uniform processing.

A spatial weight map is not automatically a correct degradation map. A thin line might be rain or a real branch. SAB provides a selection mechanism; whether it distinguishes those cases needs regional output comparisons and controlled experiments. Its name does not establish the result.

## SCAM: choosing what reaches the next stage

A sequence of three networks could simply pass restored images forward. MPRNet also transfers intermediate encoder and decoder features at multiple scales through cross-stage feature fusion, or CSFF. [Baseline implementation](https://github.com/swz30/MPRNet/blob/main/Denoising/MPRNet.py)

Its supervised attention module, SAM, generates a stage image from the current features and uses that image to produce attention weights for the outgoing features. Supervision comes from training against the stage output, rather than manually drawing an attention map.

```text
Current features → Stage image → Attention weights
       │                              │
       └── Feature weighting + residual ─→ Next stage

Multiscale encoder / decoder features ───→ Next stage
```

My motivation for SCAM was to select which feature responses deserved further emphasis and which did not need to be carried forward unchanged. The diagram places SCAM at those stage handoffs.

Baseline SAM already uses a stage image to guide transfer; SCAM emphasizes channel selection. The flow above explains the baseline, not a complete SCAM formula. How channel weights are generated and connected to supervision is essential to evaluating this change. A new box in a diagram does not answer those questions.

The position of a module matters as much as its isolated behavior. A better-looking intermediate image does not necessarily imply better features for the following stage. Stage outputs, connecting features and the final result belong in the same analysis. Cross-stage transfer was already part of MPRNet; my work modified that foundation.

## Activations and normalization can change the image too

I also tried Mish and Swish at different positions and added Instance Normalization in the U-Net. These changes are less visible in an architecture diagram, but affect how each layer handles values.

Swish is $x\sigma(x)$; Mish is $x\tanh(\mathrm{softplus}(x))$. I tried them to alter nonlinear responses and gradient propagation. MPRNet already uses PReLU in its main feature blocks, which also retains negative responses. Comparing smoothness against ReLU therefore does not establish superiority over this baseline. The mathematical properties motivate a trial; results need a comparison.

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

A score for a version containing several changes evaluates that version. Attributing gains to an individual component needs ablations with consistent splits and training budgets. Additional parameters or longer training may explain a gain too.

## Why I do not regard it as a particularly successful thesis

Looking back, I was often asking what else I could add or replace in the network. Attention, activations and normalization each have plausible explanations. Combining them gave me design rationales, but those rationales did not yet form a well-established research question.

For ACA, the missing question was where baseline channel selection actually failed. Did it amplify noise or suppress texture? Without first examining that behavior, a replacement was still a module experiment. SAB had the same limitation: location-dependent weighting does not show that the learned weights separate rain from real edges.

SCAM also needs more than “better information transfer” as an explanation. What was missing from the original transfer? What did channel selection change? Did intermediate and final outputs support that account? Otherwise the architecture gained a box while the research question remained vague.

I had not sufficiently connected a concrete failure, an explanation of its cause, a targeted modification and a test of that explanation. Even a better score would not, by itself, establish why a change helped. That is the main reason I view the thesis critically.

As an undergraduate exercise, the work still took me through an entire network: its structure, components, tensors and stage connections. I regard it primarily as practice in modifying a model. It helped me see how much more is required to formulate and answer a research question.
