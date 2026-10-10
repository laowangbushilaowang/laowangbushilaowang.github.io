---
title: "From robot vacuums to game screens: working with YOLO"
date: "2026-10-10"
updated: "2026-10-10"
language: en
project: yolov7-robotics
excerpt: "Training experiments on a single 2080 Ti, collecting my own game data, capture latency and TensorRT, and a difficult move to Ascend for a competition."
cover: /images/bona/household-input.webp
coverAlt: "An indoor input photograph retained in the old YOLO project, showing a slipper, cables and floor reflections"
tags: [YOLO, Computer Vision, Focal Loss, TensorRT, Ascend]
draft: false
---

A network change could take a day to train. Another module meant another day. That was the pace of my YOLO experiments during my Bona internship: one 2080 Ti, several ideas for the network, attention, loss and class weights, and a growing list of runs. Compute time limited how many questions I could ask.

During 2022–2023, the company wanted to add neural-network vision to a robot vacuum. Range sensors and infrared provided obstacle information; a camera could help identify what the obstacle was. I worked on model changes, training and ablations using existing company data. I was not responsible for collecting or labeling that dataset, and I did not deploy the detector on robot hardware.

I later applied the detection and optimization experience to game screens, collecting my own data and connecting detection to real-time control. A Huawei competition introduced another constraint: getting training to work on Ascend. These became three different problems—experiment cost, data and latency, and platform compatibility.

## Making training experiments fit a 2080 Ti

![Slipper, cables and reflective tiles viewed from near the floor](/images/bona/household-input.webp "A retained input example, without detection boxes. Membership in the final training set is unconfirmed. Notice the low viewpoint, cables and floor reflections.")

The robot-vacuum view puts shoes, wires and furniture close to reflective tiles. Detection needs both identity and location. A saved household configuration lists `leg`, `wires`, `shoes` and `paperBall`; it helps explain the intended objects, although its exact relationship to the final training split and checkpoint is not preserved.

### What does replacing a module actually change?

I tried backbone and bottleneck changes, lightweight modules such as MobileNet, attention and activation choices. I ran ablations to compare changes. I did not understand every structural choice deeply then: being able to insert a module was easier than explaining why it belonged there.

It helps to separate the parts:

```text
Image → Backbone: extract features
      → Neck: combine features across scales
      → Head: predict locations, classes and scores
```

A bottleneck is an internal block, not another name for the neck. A module replacement needs a more precise description than “I changed the network.”

The following are **structural examples to explain the choices**, not a recovered list of my historical ablations:

| Part | What changes | What to compare |
| --- | --- | --- |
| Bottleneck / CSP bottleneck | Convolutions, residual paths and branches | Accuracy, memory and the benefit of extra paths |
| MobileNet-style depthwise convolution / Ghost blocks | Some of the computation cost | Measured speed against lost detection quality |
| Multiscale neck fusion, SPP / SPPCSPC | Information at different scales and spatial ranges | Small-object behavior and fusion cost |
| Detect / IDetect heads | Features become boxes and class predictions | Output contracts, training matching and export support |

The [YOLOv7 blocks](https://github.com/WongKinYiu/yolov7/blob/main/models/common.py) and [detection heads](https://github.com/WongKinYiu/yolov7/blob/main/models/yolo.py) provide concrete examples. Fewer parameters do not guarantee lower latency on the available hardware. A head replacement can also affect loss, label assignment and export; it is not just a configuration rename.

### Compare promising runs before training every idea fully

I often trained for over a hundred epochs, until loss barely improved. A full trial could take a day. Looking back, I did not need to spend that budget on every candidate during screening.

Today I would keep splits, input sizes and budgets consistent, compare validation behavior as it begins to stabilize, and finish training only the promising candidates. Slow starters need a second look. A short run can guide screening; it cannot establish a final ranking.

**Loss values from different objectives do not rank detectors directly.** A new objective may produce a smaller number because it downweights examples. I would use consistent validation metrics and missed or false detections, rather than just a falling loss curve.

`mAP@0.5` averages class AP using an IoU threshold of 0.5 for matching. IoU is the intersection area of two boxes divided by their union. The class-level changes matter alongside the average.

### Batch size runs into memory

I also encountered batches that were too large for GPU memory. An `out of memory` error is different from numerical overflow. Training retains intermediate activations and gradients, so a small model file does not establish that a large batch will fit.

For a new run, I would start with a small batch and complete an entire training step, measure peak memory, then increase it. Gradient accumulation and mixed precision are possible options, rather than techniques I claim to have used then. Accumulation changes the update schedule; mixed precision needs stability checks. Resolution, model width and batch size belong in the same budget.

### What Focal Loss changes

Loss was one of the things I changed. Dense detection contains many easy background examples, while object classes can also have different frequencies. Focal Loss changes an example’s weight according to its current difficulty; class weights make a static adjustment by class.

For a binary example, let $p_t$ be the probability assigned to its correct label:

$$
\mathrm{FL}(p_t)=-\alpha_t(1-p_t)^\gamma\log p_t.
$$

The static weight is $\alpha_t$. The focusing parameter $\gamma$ determines how strongly easy examples are downweighted. With $\gamma=2$:

| $p_t$ | $(1-p_t)^2$ | Effect on this loss term |
| --- | --- | --- |
| 0.9 | 0.01 | Strongly downweighted |
| 0.5 | 0.25 | Some weight retained |
| 0.1 | 0.81 | Much less downweighting |

*These are calculated teaching examples, not experiment measurements. The factor also participates in differentiation; the values are not gradient multipliers.*

This standalone PyTorch illustration uses pre-sigmoid `logits` and floating-point binary `targets` with the same shape. It is not recovered historical training code.

```python
import torch.nn.functional as F

def focal_binary(logits, targets, alpha=0.25, gamma=2.0):
    ce = F.binary_cross_entropy_with_logits(
        logits, targets, reduction="none")
    p = logits.sigmoid()
    pt = p * targets + (1 - p) * (1 - targets)
    alpha_t = alpha * targets + (1 - alpha) * (1 - targets)
    return (alpha_t * (1 - pt).pow(gamma) * ce).mean()
```

Here, positives get static weight 0.25 and negatives 0.75. Multiclass weighting needs its own design. Compare [Torchvision’s binary implementation](https://docs.pytorch.org/vision/main/generated/torchvision.ops.sigmoid_focal_loss.html) and the [original paper](https://arxiv.org/abs/1708.02002). Default parameters do not guarantee an improvement.

The [official YOLOv7 loss code](https://github.com/WongKinYiu/yolov7/blob/main/utils/loss.py) already has a Focal Loss branch. My work was applying and evaluating training choices on the data. My recollection is that adding Focal Loss improved `mAP@0.5` by about five percentage points over the original baseline. The original tables have not been recovered, so I retain that as a recollection without inventing per-module results.

## Collecting game data: label teammates too

For the game prototype, I collected the data myself. Mouse clicks triggered sampling, taking frames at intervals of a few milliseconds. This made it easy to collect the scene in front of me; I no longer remember the exact interval.

One useful lesson was that **labeling only enemies was not enough**. Teammates are similar-looking objects. If the program should react only to enemies, explicitly teaching it to recognize teammates can help with that distinction. With enemy-only labels, teammates can already act as background negatives. A separate teammate class makes the distinction explicit; whether it helps still depends on the data and validation.

The annotation interface can display enemies in red and teammates in blue or white. Those colors visualize the labels; the training targets are class IDs and coordinates. Human-drawn annotation boxes should not appear in the model’s input images. It needs to learn the cues in the original screen.

In my experience, labeling similar teammates separately helped control mistaken identifications. I do not have a recovered comparison that supports a numerical success rate.

Data collection continued after the first model:

```text
Capture → Label → Train → Inspect misses and mistakes
   ↑                          ↓
   └── Capture missing scenes ← Identify data gaps

Existing model → Rough prelabels → Human corrections → Next training set
```

Prelabels reduce the work of drawing every box from scratch. They still need review: otherwise, a model’s mistakes become training answers for the next model.

Today I would also keep neighboring frames together in the same split, separating training and validation by capture segment or scene where possible. Frames a few milliseconds apart are nearly duplicates; random frame splitting can make validation look better than performance in a new scene. That is a present-day improvement to the procedure.

## Real-time inference starts before the model

Waiting a day for training is irritating. Waiting during inference affects the action itself: the game keeps moving, and the detector may be processing a target’s old position.

I compared PIL, other Python capture libraries and Windows capture methods. I remember getting capture down to a few milliseconds, with less difference between PIL and the Windows path than I had expected. The original timing table is missing. That recollection concerns capture alone, not total detection-to-control latency.

The retained code uses Windows `BitBlt` to copy a bitmap from a window or desktop device context and reads its pixels into an array. It also contains traces of an `mss` experiment. Pillow’s [`ImageGrab`](https://pillow.readthedocs.io/en/stable/reference/ImageGrab.html) offers a more convenient capture interface.

For a new comparison, I would fix the region and resolution, specify whether timing includes conversion into model input, and measure JPEG saving separately. I would compare continuous-run medians and slower samples, rather than one best-case number.

### PyTorch to ONNX to TensorRT

Native inference was slow enough that I chose lightweight models and used ONNX followed by TensorRT. The constraint differed from training: frames arrived individually, so completion time per frame mattered more than throughput with a large batch.

```text
Trained PyTorch weights
    → ONNX: represent the computation graph
    → TensorRT engine: optimize for a target environment
    → Load the engine for live inference
```

**ONNX is not an automatic speedup.** It gives downstream tools a graph representation, as the [TensorRT ONNX deployment guide](https://docs.nvidia.com/deeplearning/tensorrt/latest/getting-started/quick-start-guide.html) illustrates. Acceleration depends on the backend, supported operations and build configuration. The archive contains `.pt`, `.onnx` and `.trt` files, and the live entry point executes a TensorRT engine.

I favored the lightest models because inference speed and memory were constrained. Today I would compare accuracy, single-frame latency and peak memory together, then choose among models that meet the actual latency requirement. A TensorRT engine also has [hardware and version compatibility constraints](https://docs.nvidia.com/deeplearning/tensorrt/latest/inference-library/engine-compatibility.html); it is not a portable replacement for weights.

The full wait includes capture, resizing, transfers, postprocessing and control. GPU execution is asynchronous, so Python wall-clock timing can measure submission rather than completion. GPU segments need synchronization or CUDA events as explained in [PyTorch’s timing guidance](https://docs.pytorch.org/docs/main/notes/cuda.html#asynchronous-execution). Model-only timing does not explain the delay felt by the controller.

## Turning detections into movement

Boxes are not actions. The retained prototype selects a candidate nearest the image center, with a distance limit and vertical offset. Its controller uses P, I and D horizontally, and mainly P vertically. The project builds on YOLOv7; the README describes the control package as team-written.

P responds to current error, I accumulates past error, and D responds to error changes. They regulate movement rather than identify objects. Noisy measurements, stale detections and excessive movement can all affect the result.

A Kalman filter handles a different job: predict the current position from previous state, then correct it with a new measurement. [SORT](https://arxiv.org/abs/1602.00763) is another reference for association and state estimation after detection. The responsibilities can be separated like this:

```text
Image → YOLO: location and class
          ↓
      Association: which previous target is this?
          ↓
      State estimate: e.g. Kalman smoothing and prediction
          ↓
      Controller: e.g. PID movement from the error
```

*This diagram explains the roles, rather than reconstructing every historical component. PID is visible in the saved code. Kalman appears in my old personal material, but its final implementation has not been recovered.*

I remember a UAV paper using a similar detection-and-estimation idea, but not its university or title. A current related reference is [Fast UAV Object-Searching in Large-Scale and Complex Environments](https://researchers.westernsydney.edu.au/en/publications/fast-uav-object-searching-in-large-scale-and-complex-environments/), published in 2025 with Sichuan University participation. It describes combining YOLO and Kalman position estimation. It may not be the paper I remember, and that description does not establish a PID controller.

If I upgraded the prototype, I would first improve frame-to-frame association so the program did not switch targets whenever another box became closer. State estimation should account for the measured frame interval and delay. Only then would I tune control parameters. Missing detections also need a policy: briefly predict, wait, or stop moving. Those decisions matter beyond another detector swap.

## Ascend: migration took more than a new environment

After the company work, I participated in a Huawei competition and tried training on an Ascend NPU through a PyTorch adaptation environment. This was not MindSpore development.

The YOLO implementation encountered several compatibility problems with that PyTorch stack and its supported operations. During debugging, I suspected a matrix-related function. I no longer have the logs or a minimal reproducer, so that is a suspected cause, not a verified vendor defect. We switched to a YOLOv5 template and trained on the Ascend server.

My experience was frustrating: migration took more effort than expected, and training felt slow. Time intended for model experiments went into compatibility work. That describes the environment I used then; identifying the exact bottleneck or generalizing to other Ascend setups would need the original versions and logs.

The current [Ascend PyTorch documentation](https://www.hiascend.com/document/detail/zh/Pytorch/2600/index/index.html) explains the adaptation layer, and the official [ModelZoo](https://github.com/ascend/modelzoo) provides model adaptation entry points. These are current references, not evidence that I used today’s versions.

For another migration, I would first run a few steps of an already-adapted model, check inputs, loss and parameter updates, then reintroduce changes. If an operator looked wrong, I would isolate a small input and compare outputs across platforms before debugging the entire detector.

AI could now help with configuration bookkeeping, error explanations, timing scripts and export checks. It would remove some repetitive work. I would still need to decide what to change, which objects to label, and what constitutes an improvement. The day-long runs, millisecond captures and failed migration attempts made those questions much less abstract.
