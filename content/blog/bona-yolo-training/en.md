---
title: "Training a detector for a robot vacuum"
date: "2026-10-10"
updated: "2026-10-10"
language: en
project: yolov7-robotics
excerpt: "YOLO experiments during my Bona internship: household objects, imbalanced data, Focal Loss, and the cost of training every idea for a full day."
cover: /images/bona/household-input.webp
coverAlt: "A low-angle indoor input photograph retained in the old YOLO project, showing a slipper and cables"
tags: [YOLO, Computer Vision, Focal Loss, PyTorch]
draft: false
---

During my 2022–2023 internship at Bona Robotics, the company wanted to add neural-network vision to a robot vacuum’s perception. Range sensors and infrared could provide obstacle information; a camera offered a way to identify what was in front of the robot.

I worked on detection models using the company’s existing data. Collection and annotation were outside my main responsibility, and I did not deploy the model on robot hardware. My work involved network changes, losses, training choices, ablation experiments, and training on Huawei servers. I worked with YOLOv7 and later also trained YOLOv5.

Looking back, the useful questions are fairly concrete: why did some examples remain difficult, how could I tell whether a change helped, and was every idea worth a full day of training? A separate real-time visual-control prototype from the same period introduced another question: what should happen after the detector finds a target?

## The camera sees a room from near the floor

![Slipper, cables, and reflective tiles in a low-angle indoor image](/images/bona/household-input.webp "A retained input example: look at the slipper, cables, and floor reflections. This is not a detection result, and membership in the final training set is unconfirmed.")

This photograph explains the task more readily than a network diagram. A slipper, cables, and furniture share a view close to reflective tiles. The model needs both an identity and a location. An image-level label saying “shoe present” would leave the robot without a position to act on.

A retained household configuration lists `leg`, `wires`, `shoes`, and `paperBall`. It identifies objects considered in the project, though it does not establish the final checkpoint’s class list.

YOLO predicts boxes, classes, and scores. A backbone extracts visual features, feature fusion brings information from different scales together, and the detection head produces predictions. I could change the feature-extraction modules or change which errors received attention during training.

## A network change needs a reason

I tried lightweight modules such as MobileNet, attention, activation changes, and replacements at backbone or bottleneck locations. Imbalanced classes and difficult examples in the company data motivated the experiments.

I did not understand every structural choice deeply at the time. Knowing that a module could be inserted was easier than explaining why it should help this particular problem. I ran ablations, but also spent considerable time training candidates until their loss stopped falling.

Today I would begin by separating the errors:

| Observation | First things to inspect |
| --- | --- |
| Small objects disappear | Input resolution, object sizes, multiscale features |
| Boxes land in the wrong place | Labels, coordinate transforms, localization loss |
| Two classes get confused | Class examples, confusion patterns, targeted augmentation |
| Background produces false detections | False-positive images, score threshold, negative examples |

This is how I would investigate now, rather than a claim that every failure above occurred then. It turns “try another module” into a testable question: which errors should this change reduce?

## What Focal Loss changes

Loss was one of the things I changed. Dense detection has many easy background examples; object classes can also differ in frequency. Focal Loss weights examples by their current difficulty. Class weights apply a static adjustment by class. Those are different choices.

For a binary example, let $p_t$ be the probability assigned to the correct label. Focal Loss is:

$$
\mathrm{FL}(p_t)=-\alpha_t(1-p_t)^\gamma\log p_t.
$$

$\alpha_t$ is a static weight; $\gamma$ controls how strongly easy examples are downweighted. With $\gamma=2$:

| $p_t$ | $(1-p_t)^2$ | Effect on the loss term |
| --- | --- | --- |
| 0.9 | 0.01 | Strongly downweighted |
| 0.5 | 0.25 | Some weight retained |
| 0.1 | 0.81 | Much less downweighting |

*These are calculated teaching examples, not project measurements. The factor also participates in differentiation, so these values are not gradient multipliers.*

Here is a standalone illustration. `logits` are outputs before sigmoid and `targets` are binary labels. This is not recovered historical training code.

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

Here, positives receive static weight 0.25 and negatives 0.75. Multiclass weighting needs its own design; compare [Torchvision’s binary implementation](https://docs.pytorch.org/vision/main/generated/torchvision.ops.sigmoid_focal_loss.html). Default parameters do not guarantee an improvement. See the [Focal Loss paper](https://arxiv.org/abs/1708.02002) for the formulation.

The [official YOLOv7 loss code](https://github.com/WongKinYiu/yolov7/blob/main/utils/loss.py) already includes a Focal Loss branch. My contribution was experimenting with and evaluating training choices on the data; neither YOLO nor Focal Loss was my invention.

My later recollection was an improvement of roughly five percentage points in `mAP@0.5` after adding Focal Loss relative to the original baseline. The experiment tables have not been recovered, and several retained configurations set `fl_gamma` to zero. Those files cannot verify that experiment or isolate the contribution of the other changes. It remains a retrospective result without a recoverable full comparison.

## A day of training for every idea gets expensive

I often trained a change for more than a hundred epochs, until the loss stopped improving. A complete experiment could take a day. With structure, loss, and weighting all available to change, the candidate list grew faster than I could test it.

In a later review, I wondered whether the early part of training could filter ideas sooner. There is a qualification: **loss values from different objectives cannot rank detectors directly.** Focal Loss changes the scale of easy-example losses. A lower number than ordinary cross entropy does not by itself establish better detection.

Today I would use two budgets. Give candidates the same short run to check that training is healthy and inspect validation trends; then train promising candidates fully. A short run can reject a slow starter, so borderline candidates deserve another look. Final selection still needs consistent validation, rather than early loss alone.

For ablations, I would keep the question narrow. Changing only the loss means keeping splits, resolution, augmentation, and training budget fixed. Useful individual changes can then be tested in combination. Otherwise, a higher score leaves the cause unclear.

`mAP@0.5` averages class AP, with an IoU threshold of 0.5 for matching boxes. It captures more of the detection task than image-classification accuracy, but an average can hide a class that got worse. I would inspect class Precision, Recall, AP, and error images alongside it. This describes how I would evaluate a new experiment, rather than reconstructing missing historical records.

## From detection to movement in a separate prototype

The game-screen prototype connected detector output to control. It was a different task from the household detector; its TensorRT and PID code was not a robot deployment.

The retained implementation follows this path:

```text
Window or screen capture
  → Resize and pad to 640×640
  → TensorRT inference: boxes and scores
  → Restore coordinates and select a target
  → Target offset from the image center
  → Control calculation and relative movement
  → Read the next frame
```

Two decisions follow detection. Several boxes may be present, so the program selects one: the retained prototype uses the nearest target to the frame center, with a distance limit and a vertical offset. The selected box also changes between frames. Applying the whole error directly as a movement can produce overshoot or jitter, which makes the control rule matter.

The saved controller uses P, I, and D horizontally and mainly P vertically. P responds to current error, I accumulates past error, and D responds to its change. This is an empirical prototype rather than a symmetric two-dimensional PID controller. The prototype builds on official YOLOv7, and the README describes the control package as team-written.

The archive contains `.pt`, `.onnx`, and `.trt` files. Its README advises compiling the TensorRT engine on the target machine and records an RTX 3070 / CUDA 11.7 environment. Weights and an engine built for a particular environment need separate handling; portability depends on [TensorRT’s hardware and version constraints](https://docs.nvidia.com/deeplearning/tensorrt/latest/inference-library/engine-compatibility.html). The retained material establishes the implementation path, but does not provide a complete latency comparison.

I worked on household detection experiments and also explored connecting detections to real-time control. If I began that work again, I would open the missed and false detections first, write down which errors the next experiment should reduce, and only then open the model configuration. I would want that question settled before waiting another day for training.
