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

### Structure and attention: know where a change happens

I tried backbone and bottleneck replacements, including lightweight MobileNet-style components, as well as attention and activation changes. At the time, I could sometimes connect a component before I understood why it belonged there. An ablation helped test whether a change actually contributed, while keeping other conditions fixed.

```text
Image → Backbone: extract features
      → Neck: combine features across scales
      → Head: predict boxes, classes and scores
```

A bottleneck is an internal component, not another name for the neck. Lightweight convolutions change computation and representation; attention reweights features; scale fusion changes how information at different resolutions is combined. A head replacement can also affect matching, losses and export compatibility.

#### Channel, spatial and combined attention

I remember comparing channel attention, spatial attention and a combination of the two. If I designed that experiment again, I would use SE and CBAM to isolate what each change does.

**Channel attention weights feature responses.** These channels are learned features, not RGB colors. [SE](https://arxiv.org/abs/1709.01507) globally averages each channel, passes the resulting vector through a small network, then multiplies the predicted weights into the original features. With 256 channels and reduction ratio 16, the intermediate vector has 16 entries and the output has 256 weights. The feature shape stays unchanged.

**Spatial attention weights locations.** CBAM's spatial branch takes the mean and maximum across channels, concatenates the resulting maps, and applies a 7×7 convolution and sigmoid to produce spatial weights. Background suppression might help, but a weak cable response could also be suppressed. [Author implementation](https://github.com/Jongchan/attention-module/blob/master/MODELS/cbam.py)

**CBAM applies channel attention followed by spatial attention.** Its channel branch combines global average and maximum pooling through a shared small network, differing from SE's average-only aggregation. The combination reweights features twice before prediction. [CBAM paper](https://arxiv.org/abs/1807.06521)

```text
Fused features F
  → Channel weights: F₁ = F × M_channel(F)
  → Spatial weights: F₂ = F₁ × M_spatial(F₁)
  → Detection head: predict classes and boxes
```

#### Where I would insert it in YOLOv7

I would start at one fused feature output in the neck, keeping the input and output shape unchanged and leaving the loss alone. That gives a comparison of channel weighting, spatial weighting and their combination.

| Variant | Change | What I would inspect |
| --- | --- | --- |
| Baseline | Original YOLOv7 | Misses and false positives for shoes, cables and furniture legs |
| + SE | Channel weighting at the chosen location | Fewer background false positives, but possibly weaker cable responses |
| + Spatial | CBAM spatial branch only | Recall under occlusion and false positives on reflective floors |
| + CBAM | Channel then spatial at the same location | Whether the combination beats either branch and justifies its latency |

First I would change one location. If it helped, I would compare a late backbone location with a neck fusion output. Standard YOLOv7 predicts at strides 8, 16 and 32: a 640×640 input produces feature maps of 80×80, 40×40 and 20×20. The higher-resolution branch deserves attention for cables, but also costs more computation. Adding a module at every scale would not automatically be an improvement. [Original configuration](https://github.com/WongKinYiu/yolov7/blob/main/cfg/training/yolov7.yaml)

Editing YAML is only part of integration. The model parser must recognize the custom module and pass its channel count correctly. Inserting layers also requires checking downstream feature references. After a forward pass works, I would check gradients, training and ONNX / TensorRT export.

I would not assume that the most elaborate module wins. One possible outcome is fewer shoe false positives but more missed cables, leaving average mAP almost unchanged. Another is slightly better accuracy at a latency cost that the real-time task cannot afford. I would compare per-class AP, recall, false positives at the same threshold and single-image latency, then combine useful structural changes with a loss change. My remembered five-point gain from a loss-only replacement does not establish the outcome of these attention comparisons.

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
