---
title: "Multiple 1D approximations for image reconstruction"
date: "2026-10-12"
updated: "2026-10-12"
language: "en"
project: "bu-thesis"
excerpt: "My master's thesis combines one-dimensional interpolation and error-driven sampling. Greedy selection helped; adding edge and diversity preferences did not. The experiments also exposed a useful link between selection directions and reconstruction."
cover: "/images/multiple-1d/model-comparison.webp"
coverAlt: "Thesis comparison of image reconstruction with 1D approximations, neural networks, and interpolation baselines"
tags: [Image reconstruction, Greedy sampling, Interpolation, Neural fields]
draft: false
---

With 10,240 randomly selected pixels, the reconstructed cat was blurry. Selecting pixels by the current reconstruction error made its eyes and outline much clearer. Then I added two apparently sensible preferences: cover edges and spread the points out. The result was worse than random sampling.

That experiment became one of the most useful parts of my master's thesis. It pushed me toward a concrete question: **after a point passes through projection and interpolation, which parts of the image does it actually help recover?**

I completed *Image Reconstruction Through Multiple 1D Approximations* at Boston University; it entered the university repository in 2025. The idea was to represent a two-dimensional image through several one-dimensional curves. This post follows the method, sampling experiments, representation budget, and model comparisons. Figures and measurements are from the thesis experiments.

## Why represent an image with curves?

Neural fields offer an appealing view of an image: give a function a coordinate, and it returns a color.

$$
I(x,y)=(R,G,B).
$$

A neural network can learn that mapping. Its capacity to represent a function, however, does not tell us the cost of fitting it, how to allocate storage, or where a particular prediction comes from. I wanted to explore whether simpler one-dimensional interpolants could provide a useful coordinate-to-color representation.

Images made the experiment easy to inspect. Blurred details, stripes, and selected points are visible. Another reference was adaptive support-point selection in the AAA rational approximation algorithm: add points according to the current error. I borrowed that selection idea; the representation here uses projections and linear interpolation, rather than applying AAA directly to a two-dimensional image.

The task is **representation and reconstruction of a known image**. The original is available while selecting points and fitting combination weights. These experiments do not recover unknown clean pixels from a damaged photograph, or test generalization to unseen images.

## Project, interpolate, combine

For a direction $d_k=(\cos\theta_k,\sin\theta_k)$, a pixel position $p=(x,y)$ receives a scalar coordinate:

$$
s_k=x\cos\theta_k+y\sin\theta_k.
$$

A horizontal projection, for example, discards height. Points in the same column can fall at the same projected coordinate despite having different colors. A diagonal direction orders them differently. Multiple directions help compensate for the spatial information lost by any one projection.

![Original image and single-direction reconstruction](/images/multiple-1d/single-projection.webp)

*Thesis Figure 3.2. The single-direction result at right forms bands rather than preserving the full two-dimensional structure. Red dots mark sampled points.*

The reconstruction has four steps:

1. **Select pixels:** retain their two-dimensional positions and RGB values.
2. **Project:** calculate and sort scalar coordinates for each direction; average colors where projected coordinates coincide.
3. **Interpolate:** build separate R, G, and B curves and estimate colors between neighboring points.
4. **Combine:** average directional predictions, or fit weights using least squares.

For the weighted version, $X$ contains predictions from the directions and $y$ contains the original colors:

$$
w^*=\arg\min_w\|Xw-y\|_2^2.
$$

The Average and Optimized panels below distinguish simple averaging from fitted weights. Keeping that distinction matters: a gain from changing the combination should not all be attributed to sampling.

## Select the pixels with the largest current error

Random sampling treats a flat background and a cat's eye without regard to their reconstruction difficulty. Under a limited point budget, I wanted to know whether that was a good allocation.

The greedy method starts with a point, reconstructs from the retained samples, and adds a point with high error. The following pseudocode explains the basic loop:

```python
samples = [random_pixel()]
while len(samples) < budget:
    curves = project_and_interpolate(samples, directions)
    reconstruction = combine(curves)
    error = pixel_error(original, reconstruction)
    samples.append(worst_unsampled_pixel(error))
```

A 256 × 256 image contains 65,536 pixels, so repeatedly evaluating all of them and adding one point at a time is expensive. The thesis uses an approximate implementation: draw 5,000 candidate pixels per round and add the 10 with the highest errors. It also avoids retaining every intermediate reconstructed image. This reduces the search work, but no longer guarantees finding the worst pixel over the entire image at each step.

![Uniform sampling reconstruction and point distribution](/images/multiple-1d/uniform.webp)

*Figure 5.2: 10,240 random samples and 128 directions. Left: average combination; center: least-squares combination; right: the difference image with samples marked in red.*

![Greedy sampling reconstruction and point distribution](/images/multiple-1d/greedy.webp)

*Figure 5.3: the same point and direction counts with error-driven selection. Compare the eyes, ears, and outline in the center, then inspect where points accumulate at right.*

MSE measures average squared differences from the original colors. PSNR expresses reconstruction error on a logarithmic scale: higher values mean lower pixel error. Neither replaces inspecting details, backgrounds, and color balance.

| Sampling method | PSNR (dB, higher is better) | MSE (lower is better) |
| --- | ---: | ---: |
| Uniform random | 19.96 | 0.010084 |
| Greedy error selection | 25.72 | 0.002680 |
| Greedy + diversity + edges | 18.54 | 0.013996 |

*Table 5.1: 10,240 samples and 128 directions. Greedy selection gains 5.76 dB and reduces MSE by about 73.4% relative to uniform sampling in this comparison. These are results for the illustrated image, not dataset-wide averages.*

### Why did an edge preference hurt?

I added spatial distance and image-gradient terms to the selection score. Candidates far from existing samples received preference, as did locations with strong edges. The intention was to spread coverage while preserving the subject's outline.

![Reconstruction with edge and diversity preferences](/images/multiple-1d/edge-prior.webp)

*Figure 5.4. Many points follow the outline, but the weighted reconstruction does not improve. PSNR falls to 18.54 dB.*

An edge point alone does not supply all the information an interpolant needs. Colors on either side also determine the transition. Concentrating points along an outline can leave too little surrounding context after projection. That is the thesis's explanation of the observed point distributions and images, rather than an independently isolated causal result.

I also compared how RGB errors guide selection. Averaging squared errors across channels gave 24.50 dB; computing error after averaging channels gave 25.00 dB; selecting by the largest channel error gave 25.72 dB. The last option prioritizes a severe error in one color channel instead of letting two better channels dilute it.

## Interpolation changes the next sampling decision

Spline interpolation produces smoother curves, but it was worse in this comparison. With 10,240 samples and 128 directions, linear interpolation gave **25.72 dB / 0.002680 MSE**, versus **23.72 dB / 0.004248 MSE** for spline.

Interpolation is also inside the sampling loop. Changing it changes the early reconstruction, which changes the error map and therefore the next selected points. The thesis includes sparse-sample comparisons and a comparison reusing points chosen with linear interpolation to examine these effects.

Smoothness did not automatically mean accuracy. In these experiments, linear interpolation worked better with the selection process, so I kept it.

## Spend the budget on points or directions?

The two main controls are the number of samples $N$ and directions $K$. More samples retain more original colors. More directions give additional spatial arrangements of those same samples.

The budget depends on what is stored:

| Representation | Stored information | RGB scalar-count convention |
| --- | --- | --- |
| Precomputed curves | Projected coordinates and colors for every direction | $4KN+2$ |
| Compact representation | Original two-dimensional coordinates and RGB; curves built when needed | $5N+2$ |

These are approximate representation counts, not final file sizes. The compact version avoids storing a separate curve for each direction, but must perform projection, sorting, and interpolation when used. Storage savings do not imply computation savings.

The parameter sweep used a 128 × 128 image and excluded precomputed configurations above 300,000 scalars. Under those budgets, increasing sample count generally reduced error more directly than increasing directions. Directions still helped reduce stripes and ghosting, and affected the error map used for greedy selection.

![Four versus sixty-four projection directions](/images/multiple-1d/projection-count.webp)

*Figure 5.13: 8,800 samples in both images; 4 directions at left, 64 at right. Inspect the background artifacts. This fixes the point count, not the storage budget of the precomputed representation.*

### More directions for selection, fewer for reconstruction

I then tried using more directions to select points and fewer to reconstruct the final image. Which directions should survive?

| Direction strategy | PSNR (dB) | MSE |
| --- | ---: | ---: |
| Same 3 directions for selection and reconstruction | 22.22 | 0.005930 |
| Select with more; generate 3 new directions | 19.63 | 0.010886 |
| Select with more; retain 3 from the original set | 26.78 | 0.002100 |

*Table 5.5: 20,001 samples and 3 final directions. Each row averages five trials.*

![Reconstruction using a retained subset of selection directions](/images/multiple-1d/direction-subset.webp)

*Figure 5.16, showing the retained-subset strategy. The figure is one result; the table reports five-trial averages.*

Generating new directions gives the final reconstruction a different way of arranging the points. Samples selected for the earlier directions may no longer suit it. Retaining a subset preserves more of that relationship. The useful lesson is specific: simplifying a representation requires deciding which dependencies must survive.

## How did it compare with neural networks?

I compared ordinary and Fourier-feature networks, Kernel Regression, LinearNDInterpolator, and my method on 256 × 256 images. My method used 64 directions. For nonparametric methods, approximately $5N$ scalars represented stored coordinates and colors; networks were counted by weights. This compares approximate representation sizes, not equal runtimes or byte-accurate storage.

| Method | About 4,400 | About 17,000 | About 66,800 |
| --- | ---: | ---: | ---: |
| Neural network + Fourier features | 37.86 | 50.44 | 51.83 |
| Plain neural network | 23.14 | 26.69 | 27.08 |
| Multiple 1D approximations | 18.12 | 22.34 | 29.40 |
| Kernel Regression | 12.39 | 22.44 | 27.22 |
| LinearNDInterpolator | 15.79 | 22.60 | 27.46 |

*Tables 5.6–5.8, PSNR in dB. Actual network weight counts are 4,419 / 17,027 / 66,819; the other methods use budgets of 4,400 / 17,000 / 66,800.*

![Actual reconstruction comparison at the largest budget](/images/multiple-1d/model-comparison.webp)

*Figure 5.19, approximately 66,800 scalars. Top row: original, Fourier-feature network, plain network. Bottom row: 1D approximations, Kernel Regression, LinearNDInterpolator. Inspect both the eyes and the background colors and stripes.*

The Fourier-feature network is clearly strongest. My method exceeds the plain network and traditional baselines at the largest budget, loses to the plain network at the smallest, and is slightly below the traditional baselines at the middle budget. One summary sentence in the thesis states the advantage too broadly. The tables support a representation with particular trade-offs, rather than general superiority over neural networks.

I like being able to inspect where the budget goes: samples accumulate in high-error regions and give more attention to eyes and outlines. The costs are visible too, including background stripes and uneven colors. Simple interpolants also do not make the entire selection process cheap. Without a complete runtime and memory comparison, I cannot turn component simplicity into a claim of overall speed.

The research left me with experiments I can explain: which points were worth keeping, which preferences failed, and why reducing directions worked only when it preserved the connection between selection and reconstruction.

[Full thesis](https://hdl.handle.net/2144/49595) · [Experiment notebooks and code](https://github.com/laowangbushilaowang/Image-Reconstruction-through-Multiple-1D-Approximations)
