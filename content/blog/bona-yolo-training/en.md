---
title: "From robot vacuums to game screens: working with YOLO"
date: "2026-10-10"
updated: "2026-10-10"
language: en
project: yolov7-robotics
excerpt: "Improving detection on company data, then collecting game images and connecting accelerated inference to control: accuracy and real-time behavior presented different problems."
cover: /images/bona/household-detection.webp
coverAlt: "A household detection example preserved in my old presentation"
tags: [YOLO, Computer Vision, Varifocal Loss, TensorRT, Ascend]
draft: false
---

During my internship at Bona in 2022–2023, I worked on visual detection for robot vacuums. The company wanted a camera to recognize objects near the floor. Range sensors could provide obstacle information; an image could help distinguish a shoe from a cable or furniture. I trained YOLO on existing company data, changed network components, attention modules and losses, and ran ablations to compare them.

I remember a loss-only change improving `mAP@0.5` by about five percentage points over the original baseline. I considered both Focal Loss and Varifocal Loss, but I no longer remember which produced that improvement. The result is a recollection; I have not recovered its experiment table or configuration.

Later I applied the detection experience to a game-screen prototype. This time I collected and annotated the data myself. The goal also changed: the program had to see a target and respond while the scene was still moving. I will follow that progression here, from training to the real-time prototype, then to training compatibility problems during a Huawei competition.

## Company data: what I changed and how I compared it

![Household objects with detection boxes in an archived presentation](/images/bona/household-detection.webp "An archived detection example showing object locations and classes; overall accuracy requires validation-set evaluation.")

A low camera angle brings shoes, cables, occlusion and reflections into the same view. One archived configuration lists `leg`, `wires`, `shoes` and `paperBall`. I worked on model changes, training and evaluation. I did not collect or annotate this company dataset, or deploy the model on robot hardware.

### Structure and attention: know where a change happens

I tried backbone and bottleneck replacements, including lightweight MobileNet-style components, as well as attention and activation changes. At the time, I could sometimes connect a component before I understood why it belonged there. An ablation helped test whether a change actually contributed, while keeping other conditions fixed.

```text
Image → Backbone: extract features
      → Neck: combine features across scales
      → Head: predict boxes, classes and scores
```

A bottleneck is an internal component, not another name for the neck. Lightweight convolutions change computation and representation; attention reweights features; scale fusion changes how information at different resolutions is combined. A head replacement can also affect matching, losses and export compatibility.

Today I would record the location of each change, the error it is meant to address, and its comparison configuration. Fewer parameters do not guarantee faster inference. A higher average score can also hide a class getting worse.

### Focal and Varifocal address different questions

I considered both losses. Ordinary Focal Loss reduces the contribution of easy examples, which matters when easy background predictions vastly outnumber harder cases. Class weighting addresses a different imbalance: how much different classes contribute.

Varifocal Loss also asks whether a detection score reflects localization quality. A confident shoe prediction can cover only half the shoe, while a better-fitting box has a lower classification score. VarifocalNet learns a score that incorporates localization quality to improve candidate ranking. [Original paper](https://arxiv.org/abs/2008.13367)

![Varifocal Loss formula preserved in my old presentation](/images/bona/varifocal-ppt.webp "The Varifocal Loss formula from my presentation: quality-weighted positives and score-weighted negatives.")

Here $p$ is the predicted score and $q$ the training target: typically the matched IoU for positives and zero for negatives. Positive loss uses the soft target $q$ and a $q$ weight; negative loss is weighted by $\alpha p^\gamma$, suppressing easy background predictions. Its $\alpha$ has a different role from ordinary Focal Loss. [Author implementation](https://github.com/hyz-xmaster/VarifocalNet/blob/master/mmdet/models/losses/varifocal_loss.py)

This small teaching example shows the weighting, rather than reconstructing my historical training code. `logits` are pre-sigmoid outputs; `quality` has the same shape and must be built from positive matching and IoU.

```python
import torch
import torch.nn.functional as F

def varifocal_example(logits, quality, alpha=0.75, gamma=2.0):
    p = logits.sigmoid()
    weight = torch.where(quality > 0, quality, alpha * p.pow(gamma))
    bce = F.binary_cross_entropy_with_logits(
        logits, quality, reduction="none")
    return (weight * bce).mean()
```

Integration also requires deciding which output learns the quality score, how positives are matched, and how $q$ is constructed. Passing binary classification labels into this function is not sufficient to implement quality-aware training.

`mAP@0.5` averages class AP after matching boxes at IoU 0.5. After changing a loss, the question is whether detection improves, rather than whether the new loss produces a smaller number.

### One 2080 Ti made experiment time part of the problem

I had one 2080 Ti. I often trained a configuration for over a hundred epochs until loss barely changed; a full trial could take about a day. That limited how many ideas I could test.

Looking back, I would screen candidates with a common shorter budget once validation behavior begins to stabilize, then train promising ones thoroughly. Slow starters deserve a second look. Loss values themselves are not directly comparable across loss functions: a weighting change can make them smaller without improving detection.

I also ran into out-of-memory failures with oversized batches. Training stores intermediate activations and gradients as well as weights. Today I would complete a step at a small batch size, measure peak memory, then increase it. Gradient accumulation and mixed precision are possible new experiments, not optimizations I can claim to have used then.

The game prototype carried these training lessons into a different setting. Now I needed my own data, and the model output had to arrive in time to drive an action.

## The game prototype: from captured frames to control

I built a vision-to-control prototype around game images: capture a frame, detect a target, select a position, then adjust movement from its offset to the screen center. I collected and labeled images, and worked on capture, model export and control integration.

![Game view and detection preview shown side by side](/images/bona/game-live-detection.webp "An archived prototype demonstration: game image on the left, detection preview on the right.")

Following one frame makes the responsibilities easier to separate:

```text
Screen → Capture / preprocessing → YOLO / TensorRT → Boxes
                                                      ↓
                         Target selection → Offset → PID → Action

Kalman: position prediction and correction between measurement and control.
Recorded in the old presentation; its final implementation is not recovered.
```

### Data: teammates were useful examples too

Mouse clicks triggered short bursts of capture, with frames taken at millisecond intervals. I do not remember the exact interval. It let me gather images from the current scene quickly.

![A person annotated in an old game image](/images/bona/game-annotation.webp "The original labelImg annotation canvas, with local paths cropped out. This screenshot comes from the person-labeling stage.")

An enemy-only task has an awkward near-match: a teammate can look similar. I also labeled teammates so the model could explicitly learn the distinction. In my experience this made mistaken detections easier to control, although I no longer have the full comparison or an accuracy figure.

Red, blue or white annotation boxes are display choices. Training uses class IDs and coordinates; the input image should not contain the human-drawn boxes.

I collected images, annotated them, trained, inspected missed or mistaken detections, then captured the missing scenes. A preliminary model could provide rough labels for manual correction. Skipping that correction would feed its own mistakes back into training.

If I rebuilt the dataset now, I would split by capture segment or scene. Frames a few milliseconds apart are nearly identical; a random frame split can make validation look better than performance in a new scene.

### Capture: obtain pixels quickly and preserve coordinates

I compared PIL, other Python capture packages and Windows capture methods. I remember getting capture down to a few milliseconds, with less difference between PIL and Windows paths than I expected. That recollection is about capture alone, not total response latency.

The retained `detect_trt.py` provides a concrete Windows path:

| Step | Retained implementation | Purpose |
| --- | --- | --- |
| Select region | Central 640×640 region | Limit per-frame data |
| Copy pixels | Win32 `BitBlt`, then `GetBitmapBits` | Obtain a pixel array |
| Prepare input | Resize, pad, normalize and convert | Match model input |
| Restore positions | Subtract padding and divide by scale | Map boxes to the original region |

There is also a commented `mss` attempt. Capture-library choice does not settle color channels, copy overhead or resizing. Reading the archive again also revealed an unassigned color-conversion return value, something to verify when rerunning it.

For a new benchmark I would fix region and resolution, measure capture, preprocessing, inference and control separately, and report typical and slower behavior over a sustained run.

### Inference: lightweight weights, ONNX and TensorRT

Native model inference was slow, so I used a lightweight model and the PyTorch → ONNX → TensorRT engine path. For this application, single-frame delay and memory mattered more than large-batch throughput.

ONNX represents the exported graph; TensorRT builds an execution engine for the environment. ONNX alone is not an acceleration switch. The archive contains `.pt`, `.onnx` and `.trt` files, and `detect_trt.py` retains engine loading, CUDA tensor preparation and inference execution. [TensorRT deployment guide](https://docs.nvidia.com/deeplearning/tensorrt/latest/getting-started/quick-start-guide.html)

Capture and inference improvements supported the real-time pipeline, but the full timing table is missing. I cannot reconstruct a total delay or speedup. Once boxes appeared, the program still needed to choose a target and decide how far to move.

### Target selection, Kalman and PID have separate jobs

The retained code chooses a candidate near the screen center, with a distance limit and vertical offset. Nearest-center selection is not continuous tracking: it may switch between objects. Association across frames would be my first improvement today.

| Component | Input → output | Boundary |
| --- | --- | --- |
| YOLO | Image → classes, boxes, scores | Does not choose movement |
| Target selection | Several boxes → selected target | Does not guarantee identity continuity |
| Kalman | Previous state and measurement → estimated position | Does not identify enemies or control movement |
| PID | Position error → adjustment | Does not validate the detection |

Kalman predicts from the previous state, then corrects with a new measurement. My old presentation mentions it, but its final code has not been recovered. The table explains its role rather than claiming the retained program includes every stage.

PID is present in `control.py`. Horizontal control uses P, I and D; vertical control mainly uses P.

![PID function preserved in the old presentation](/images/bona/pid-original.webp "Original PID code corresponding to the archived control.py: horizontal integral and derivative terms, vertical proportional control.")

P responds to the current error, I accumulates error, and D responds to its change. Noisy boxes, uneven frame intervals and oversized actions can all affect the result. A missing detection also needs an explicit policy: predict briefly, wait or stop.

The prototype reached a capture–detection–selection–relative-control pipeline, with demonstration images and retained entry-point and control code. It used existing YOLO methods, and the README describes the control package as team-written. The household model and game prototype had different data and purposes.

## The Ascend competition: get training running first

After the company work, I participated in a Huawei competition and tried training on Ascend NPU hardware. Before this, I had been choosing between data, model and runtime changes. Here software compatibility became the first obstacle.

The environment adapted PyTorch to the platform. YOLO encountered several version or operator-support errors. I suspected a matrix-related function, but no minimal reproduction or historical logs remain, so I cannot call it a confirmed vendor bug. We eventually used a YOLOv5 template for training on the Ascend server.

My experience was that migration was cumbersome and training was slow. Time intended for model work went into compatibility problems. That describes my environment at the time, not every Ascend setup; identifying the bottleneck would require those versions and logs.

Today I would start with an already adapted model, run a few training steps and check inputs, loss and parameter updates before adding changes. For a suspected operator problem, a small independent input compared across platforms would be easier to diagnose than the whole detector. [Ascend PyTorch documentation](https://www.hiascend.com/document/detail/zh/Pytorch/2600/index/index.html)

What I would keep from this work is specific: compare loss changes under the same evaluation conditions, collect confusing near-matches rather than only desired targets, and measure capture, inference and control separately. AI assistance could reduce configuration and debugging work today. It would still need a clear comparison to implement.
