---
title: "From robot vacuums to game screens: working with YOLO"
date: "2026-10-10"
updated: "2026-10-10"
language: en
project: yolov7-robotics
excerpt: "Company-data detection experiments and a personal visual aim-assistance prototype: separate goals, training decisions and real-time engineering lessons."
cover: /images/bona/household-detection.webp
coverAlt: "A household detection example preserved in my old presentation"
tags: [YOLO, Computer Vision, Varifocal Loss, TensorRT, Ascend]
draft: false
---

This article covers two YOLO projects: improving household detection with company data during my Bona internship, and collecting game images for a visual aim-assistance prototype. They had different data and goals. The company section covers model experiments and training migration; the personal section follows the loop from data to detections, actions and further improvements.

## Company work: household detection for robot vacuums

During my internship at Bona in 2022–2023, I trained YOLO on existing company data to recognize objects near the floor. Range sensors provided obstacle information; images could help distinguish shoes, cables and furniture. I changed network components, attention modules and losses, and used ablations to compare them.

I remember a loss-only change improving `mAP@0.5` by about five percentage points over the original baseline. I considered Focal and Varifocal, but no longer remember which produced that improvement. The experiment table and configuration have not been recovered.

![Household objects with detection boxes in an archived presentation](/images/bona/household-detection.webp "An archived detection example showing object locations and classes; overall accuracy requires validation-set evaluation.")

A low camera angle brings shoes, cables, occlusion and reflections into the same view. One archived configuration lists `leg`, `wires`, `shoes` and `paperBall`. I worked on model changes, training and evaluation. I did not collect or annotate this company dataset, or deploy the model on robot hardware.

### Changing the model for shoes, cables and clutter

The targets differed substantially. Shoes had recognizable outlines; cables were thin and elongated. Furniture could obscure an object, while reflections added distracting texture. One detector had to handle all of them. Larger models also meant longer experiments on my single 2080 Ti.

I explored two directions: changing backbone and bottleneck components, including integrating YOLOv5 modules into YOLOv7 and trying MobileNet-style lightweight blocks; and changing attention to reweight existing features. I also tried activations and losses, using ablations to compare changes.

```text
Image → Backbone: extract features
      → Neck: fuse scales
      → Head: predict classes, boxes and scores
```

A bottleneck is an internal block; the neck is the scale-fusion part of the detector. Changing one modifies feature computation, while changing the other modifies how resolutions interact. At the time I could sometimes connect a block before I fully understood why it belonged there.

#### Attention: suppress clutter without losing thin targets

I remember comparing channel attention, spatial attention and their combination. In household detection, the distinction is useful: channel attention weights feature responses, while spatial attention weights locations.

**Channels are learned features, not RGB colors.** [SE](https://arxiv.org/abs/1709.01507) globally averages each channel and uses a small network to generate weights. With 256 channels and reduction ratio 16, that network follows 256 → 16 → 256. The feature dimensions stay unchanged.

**Spatial attention retains location information.** CBAM's spatial branch combines the channel-wise mean and maximum through a 7×7 convolution to generate location weights. Suppressing reflections or texture may help, but a weak cable response could be suppressed too. [Author implementation](https://github.com/Jongchan/attention-module/blob/master/MODELS/cbam.py)

[CBAM](https://arxiv.org/abs/1807.06521) applies channel weighting before spatial weighting. Its channel branch uses both average and maximum pooling, unlike SE.

```text
Features → Channel weighting → Spatial weighting → Detection
           Which responses?   Which locations?
```

These mechanisms explain both the motivation and the tradeoff. Better shoe detection need not mean better cable detection. Per-class AP, recall and false positives reveal changes that average mAP can hide. The roughly five-point gain I remember from a loss-only replacement does not establish an attention-module gain.

#### Integrating YOLOv5 and lightweight blocks

I tried integrating YOLOv5 modules into YOLOv7. That was component replacement, distinct from using a complete YOLOv5 training template later in the competition. Shared names such as `Conv` or `Bottleneck` do not guarantee compatible arguments or connections.

YOLOv5's C3 illustrates the interface issue: one path runs through bottlenecks, another takes a shorter route, and their outputs are concatenated and fused. Replacing a class name is only part of integration. [YOLOv5 implementation](https://github.com/ultralytics/yolov5/blob/v6.2/models/common.py)

| Interface | What must match | Failure if it does not |
| --- | --- | --- |
| Channels | Input `c1` and output `c2` | Next convolution cannot accept the tensor |
| Downsampling | Stride and spatial dimensions | Scale-fusion concatenation fails |
| Residual path | Shapes on both sides of addition | Channel or spatial mismatch |
| YAML and parser | Arguments, repetition count and feature indices | Wrong construction or wrong feature routing |

For example, a block occupying `[B, 128, 40, 40] → [B, 256, 20, 20]` must preserve that contract when replaced. These dimensions illustrate an interface; actual channels depend on the configuration. Replacing a block while preserving its output requires less downstream work than replacing an entire backbone. A new backbone needs compatible outputs for the neck's scales. Standard YOLOv7 uses detection strides 8, 16 and 32, producing 80×80, 40×40 and 20×20 feature maps for a 640×640 input. [Original configuration](https://github.com/WongKinYiu/yolov7/blob/main/cfg/training/yolov7.yaml)

MobileNet-style blocks were my lightweight direction. MobileNetV2 illustrates the approach: expand channels with a pointwise convolution, apply depthwise spatial convolution, then project to the output channels. Residual connections require compatible shapes. The expanded intermediate features still consume memory; fewer parameters alone do not determine training memory or inference latency. [MobileNetV2](https://arxiv.org/abs/1801.04381)

Ghost blocks use a different approach: generate a smaller set of features with regular convolution, then produce more with cheaper transformations. Both YOLOv5 and YOLOv7 contain Ghost components. Using one Ghost bottleneck is different from replacing the backbone with GhostNet. [GhostNet](https://arxiv.org/abs/1911.11907), [YOLOv7 implementation](https://github.com/WongKinYiu/yolov7/blob/main/models/common.py)

The distinction I took away was between connecting a component and improving detection. A successful forward pass checks only part of the integration; training, gradients and exported outputs still matter. Lightweight blocks also trade computation against representation. For cables, the question is whether thin-target features survive that trade, compared on the same validation set. A promising module name cannot answer it.

### Focal and Varifocal address different questions

I considered both losses. Ordinary Focal Loss reduces the contribution of easy examples, which matters when easy background predictions vastly outnumber harder cases. Class weighting addresses a different imbalance: how much different classes contribute.

Consider two predictions: an easy background location receives probability 0.9 for its correct label, while a difficult target receives only 0.1. Focal Loss reduces the easy example's contribution so it leaves more room for the difficult one.

For correct-label probability $p_t$, ordinary cross-entropy is $-\log p_t$. Focal Loss adds a modulation factor:

$$
\mathrm{FL}(p_t)=-\alpha_t(1-p_t)^\gamma\log p_t.
$$

With $\gamma=2$, that factor is 0.01 at $p_t=0.9$, versus 0.81 at $p_t=0.1$. $\alpha_t$ supplies a static weight; $\gamma$ controls suppression of easy examples. These are arithmetic examples, not experiment results. [Focal Loss paper](https://arxiv.org/abs/1708.02002)

This matters when a detector has vast numbers of easy background predictions: individually small losses can dominate in aggregate. Hard examples can also include bad labels, so increasing $\gamma$ is not a guarantee of improvement.

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

### The Ascend competition: get training running first

After the company work, I participated in a Huawei competition and tried training on Ascend NPU hardware. Software compatibility became the first obstacle before model changes could be evaluated.

The environment adapted PyTorch to the platform. YOLO encountered several version or operator-support errors. I suspected a matrix-related function, but no minimal reproduction or historical logs remain, so I cannot call it a confirmed vendor bug. We eventually used a YOLOv5 template for training on the Ascend server.

My experience was that migration was cumbersome and training was slow. Time intended for model work went into compatibility problems. That describes my environment at the time, not every Ascend setup; identifying the bottleneck would require those versions and logs.

Today I would start with an already adapted model, run a few training steps and check inputs, loss and parameter updates before adding changes. For a suspected operator problem, a small independent input compared across platforms would be easier to diagnose than the whole detector. [Ascend PyTorch documentation](https://www.hiascend.com/document/detail/zh/Pytorch/2600/index/index.html)


## Personal work: visual aim assistance from game images

### What made me try it

Imagine a frame with the crosshair at the center and a target moving sideways. By the time the detector returns a box, the target has moved. A program responding to that box follows an earlier position. Recognition can be correct while the action is late: visual aim assistance has to handle the delay between seeing and moving.

The starting point was Call of Duty. I saw someone use AI to recognize the game image and drive aim assistance, and wanted to try that approach myself. At the time, I felt memory-reading assistance was outdated. That was my motivation, rather than a claim that vision had no limitations of its own.

My prototype needed to find targets in captured frames and connect their positions to movement. I collected and annotated the data myself, then worked on capture, inference and control. The archived images below are from my prototype in Apex, not the Call of Duty demonstration that inspired it.

![Game view and detection preview shown side by side](/images/bona/game-live-detection.webp "My archived prototype in an Apex scene: game image on the left, detection preview on the right.")

### The project loop

The process can be understood in four stages, with errors observed during use feeding back into the data:

1. **Collect and label:** capture game frames, label targets and include confusing teammates.
2. **Train and export:** train a lightweight detector, export ONNX and build a TensorRT engine.
3. **Run:** capture frames, detect and select a target, then send its position error to control.
4. **Inspect and collect again:** review misses, mistaken detections and movement, collect the missing scenes and correct labels before retraining.

```text
1. Collect / label → 2. Train / export → 3. Run → 4. Inspect / collect again
        ↑                                                │
        └──────────── New images and corrected labels ───┘
```

The first pass needs manual labels. Once a model exists, it can suggest annotations for human correction. The following sections follow that loop rather than treating each tool as an independent topic.

### 1. Data: distinguish teammates as well as finding enemies

Mouse clicks triggered short bursts of capture, with frames taken at millisecond intervals. I do not remember the exact interval. It let me gather images from the current scene quickly.

![A person annotated in an old game image](/images/bona/game-annotation.webp "The original labelImg annotation canvas, with local paths cropped out. This screenshot comes from the person-labeling stage.")

An enemy-only task has an awkward near-match: a teammate can look similar. I also labeled teammates so the model could explicitly learn the distinction. In my experience this made mistaken detections easier to control, although I no longer have the full comparison or an accuracy figure.

Red, blue or white annotation boxes are display choices. Training uses class IDs and coordinates; the input image should not contain the human-drawn boxes.

### 2. Model: training and accelerated export

Native model inference was slow, so I used a lightweight model and the PyTorch → ONNX → TensorRT engine path. For this application, single-frame delay and memory mattered more than large-batch throughput.

ONNX represents the exported graph; TensorRT builds an execution engine for the environment. ONNX alone is not an acceleration switch. The archive contains `.pt`, `.onnx` and `.trt` files, and `detect_trt.py` retains engine loading, CUDA tensor preparation and inference execution. [TensorRT deployment guide](https://docs.nvidia.com/deeplearning/tensorrt/latest/getting-started/quick-start-guide.html)

Capture and inference improvements supported the real-time pipeline, but the full timing table is missing. I cannot reconstruct a total delay or speedup. Once boxes appeared, the program still needed to choose a target and decide how far to move.

### 3. Runtime: from one frame to an action

Following execution order separates the responsibilities:

```text
Pixels → Preprocessing → TensorRT detections → Target selection → Error → PID → Action
```

#### Capture and coordinates

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

#### Where the milliseconds go

I got capture down to a few milliseconds. The next question was where the remaining time went: fast capture still produces outdated positions if the model takes too long to process them.

| Stage | Approach and lesson |
| --- | --- |
| Capture | Compare PIL, Python capture libraries and Windows paths; capture reached a few milliseconds |
| Preprocessing and transfers | Resize, normalize and prepare GPU inputs; include copying costs when timing |
| Model inference | Use a lightweight detector and ONNX → TensorRT acceleration; time single-image inference separately |
| Detection results and control | Process boxes, select a target, compute the error and produce a control adjustment |

Stage timings tell me whether further capture work would help or whether the model and inference need attention. I would also measure the complete loop, because returning a detection box leaves result processing and actions still to do.

The old `Done. (...)` timer starts before capture. Different versions include drawing or control at different positions, so it cannot be copied as “YOLO inference time.” A new GPU benchmark would need warm-up and CUDA events or clearly synchronized boundaries. I would measure a sustained run and report the median and slower P95, rather than selecting the fastest frame.

#### Target selection and control

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

#### Related reading: YOLO and Kalman for UAV search

I remember reading a UAV paper associated with a university in Sichuan or Chongqing, but cannot recover its title. While revisiting the topic I found [Fast UAV Object-Searching in Large-Scale and Complex Environments](https://researchers.westernsydney.edu.au/en/publications/fast-uav-object-searching-in-large-scale-and-complex-environments/), a 2025 *IEEE Transactions on Cybernetics* paper involving Sichuan University. It combines YOLO and Kalman filtering for object-position estimation in cluttered, occlusion-prone environments, then uses that information for UAV search.

It illustrates the division between detecting what is visible in a frame and estimating position using information across frames. UAV search additionally needs path planning; my prototype mainly connected screen positions to control. This is related reading found later, not the paper I remember from the project. Its abstract does not establish a PID component.

### 4. Use the result to decide what to change

I collected images, annotated them, trained, inspected missed or mistaken detections, then captured the missing scenes. A preliminary model could provide rough labels for manual correction. Skipping that correction would feed its own mistakes back into training.

If I rebuilt the dataset now, I would split by capture segment or scene. Frames a few milliseconds apart are nearly identical; a random frame split can make validation look better than performance in a new scene.

Different failures lead to different work. Confusing teammates with enemies sends me back to examples and labels. Outdated positions call for measuring capture, inference and control separately. Correct boxes with unstable movement call for checking target switches, estimation and control parameters. A new detector is not the answer to every failure.

The result was a prototype spanning collection, annotation, training, real-time detection and relative control. The presentation contains demonstration images; the archive retains `detect_trt.py` and `control.py`. Millisecond capture is a recollection, and the full timing table is missing. The work builds on existing YOLO methods, with the README describing the control package as team-written.

The useful lesson was to examine the model in use: collect examples of what it misses, measure the stage that is slow, and inspect control when detection is correct but movement is not.
