---
title: "From robot vacuums to game screens: working with YOLO"
date: "2026-10-10"
updated: "2026-10-11"
language: en
project: yolov7-robotics
excerpt: "Company-data detection experiments and a personal visual aim-assistance prototype: separate goals, training decisions and real-time engineering lessons."
cover: /images/bona/household-detection.webp
coverAlt: "Household detection example"
tags: [YOLO, Computer Vision, Varifocal Loss, TensorRT, Ascend]
draft: false
---

This article covers two YOLO projects: improving household detection with company data during my Bona internship, and a game-vision course project completed with a classmate, using images I collected and annotated for an aim-assistance prototype. They had different data and goals. The company section covers model experiments and training migration; the personal section follows the loop from data to detections, actions and further improvements.

## Company work: household detection for robot vacuums

During my internship at Bona in 2022–2023, I trained YOLO on existing company data to recognize objects near the floor. Range sensors provided obstacle information; images could help distinguish shoes, cables and furniture. With limited data, uneven class counts and differing detection performance, I explored structural changes and losses, using ablations to compare them.

The work took place in 2022–2023. I separate data, architecture, loss and training decisions below, rather than combine gains from different runs.

![Household objects with detection boxes in an archived presentation](/images/bona/household-detection.webp "An archived detection example showing object locations and classes; overall accuracy requires validation-set evaluation.")

A low camera angle brings shoes, cables, occlusion and reflections into the same view. One archived configuration lists `leg`, `wires`, `shoes` and `paperBall`. I worked on model changes, training and evaluation. I did not collect or annotate this company dataset, or deploy the model on robot hardware.

### Start with the data: more labels did not guarantee better detection

The loss experiments started with the data. I remember some classes performing well while less-represented classes lagged, and suspecting overfitting. The class annotation counts were:

| Class | Training | Validation | Test |
| --- | ---: | ---: | ---: |
| Furniture legs `leg` | 3,488 | 885 | 446 |
| Cables `wires` | 799 | 208 | 106 |
| Shoes `shoes` | 1,836 | 465 | 259 |
| Paper balls `paperBall` | 1,831 | 542 | 224 |

These are class annotation counts, not counts of independent images; one image can contain several objects. Training leg annotations outnumbered cables by roughly 4.4 to one. Shoes and paper balls each had more than twice the cable annotations.

But quantity was not the whole story. **legs had the most annotations but poorer detection performance.** I suspected label noise in that class. Training objectness loss kept falling while validation objectness loss rose, which was the direct signal that made me suspect overfitting. Quantity, consistency and visual coverage needed separate attention. More data, label review and stronger regularization were therefore worth considering.

That was the motivation for changing the loss. Class weighting adjusts each class's contribution; Focal reduces the influence of easy predictions. Neither repairs incorrect labels. A mislabeled example may look difficult to the model and receive more weight.

A class-performance gap alone does not establish overfitting. Improving training performance alongside rising validation loss or flat or falling validation AP gives a more direct signal. Counts, annotation quality and object difficulty can also explain a gap. For detection I would distinguish per-class AP, recall and false positives rather than call everything accuracy. [Training diagnostics](https://docs.ultralytics.com/yolov5/tutorials/tips-for-best-training-results)

### Establishing a baseline before changing components

I compared YOLOv7 with and without pretrained weights. Both runs used 300 epochs and a batch size of 8:

| Initialization | Validation mAP@0.5 | Model file size |
| --- | ---: | ---: |
| No pretrained weights | 73.8% | 76 MB |
| Pretrained weights | 77.4% | 76 MB |

The pretrained run reached a strong result around epoch 40 and then deteriorated, so I selected its best checkpoint. Training from scratch was still converging slowly at epoch 300. Initialization was already an important decision before any architecture change. These numbers compare initialization; they are not a loss-function ablation.

Some company runs used two RTX 2080 Ti cards. My recollection of day-long single-card trials concerns other experiments, rather than one shared hardware configuration for every row.

### Changing the model for shoes, cables and clutter

The targets differed substantially. Shoes had recognizable outlines; cables were thin and elongated. Furniture could obscure an object, while reflections added distracting texture. One detector had to handle all of them. Larger models also meant longer experiments on the available 2080 Ti hardware.

I explored two directions: changing backbone and bottleneck components, including integrating YOLOv5 modules into YOLOv7 and trying MobileNet-style lightweight blocks; and changing attention to reweight existing features. I also tried activations and losses, using ablations to compare changes.

```text
Image → Backbone: extract features
      → Neck: fuse scales
      → Head: predict classes, boxes and scores
```

A bottleneck is an internal block; the neck is the scale-fusion part of the detector. Changing one modifies feature computation, while changing the other modifies how resolutions interact. At the time I could sometimes connect a block before I fully understood why it belonged there.

#### Changing blocks and locations: the actual results

I first tested attention and lightweight components on YOLOv7-tiny. This architecture comparison used a non-pretrained tiny baseline, separate from the later pretrained model comparison.

| Configuration | Change location | mAP@0.5 | mAP@0.5:0.95 |
| --- | --- | ---: | ---: |
| YOLOv7-tiny baseline | — | 66.2% | 36.4% |
| CA | After Backbone P2–P5 | 65.9% | 33.5% |
| SE | End of Backbone | 66.0% | 36.5% |
| CBAM | After Backbone P1 and P2 | 64.7% | 35.8% |
| CBAM | In the Head | 67.1% | 37.2% |
| MobileNetV2 components | Lightweight tiny structure | 66.4% | 36.7% |
| GnConv | Convolution replacement | 65.0% | 36.3% |

**CBAM lost performance near the front of the Backbone, but improved slightly in the Head.** That is more informative than saying I tried channel and spatial attention: placement changes how the detector uses features.

Channel attention weights feature responses; spatial attention weights locations. [SE](https://arxiv.org/abs/1709.01507) mainly does the former, while [CBAM](https://arxiv.org/abs/1807.06521) combines both. Suppressing clutter may also suppress a thin cable, so the principle alone cannot establish a benefit.

These configurations change both the block and its location. One unsuccessful placement does not make CBAM unsuitable everywhere. The tiny MobileNetV2 variant largely retained the score while reducing the model file from about 11.6 to 10.3 MB. GnConv did not improve this configuration.

Replacing the full YOLOv7 Backbone was a separate comparison:

| Full-model configuration | mAP@0.5 | mAP@0.5:0.95 | Model file |
| --- | ---: | ---: | ---: |
| YOLOv7 baseline | 73.8% | 43.2% | 76 MB |
| MobileNetV2 Backbone | 69.8% | 40.9% | 47.4 MB |
| MobileNetV3 Backbone | 67.4% | 37.5% | 46 MB |

Both replacements reduced file size and detection scores. The MobileNetV3 variant retained SPPF, leaving two pyramid-style components in the structure. Shrinking the Backbone did not automatically produce a sensible overall architecture.

I also combined CA with changes to upsampling, downsampling and activations, obtaining 67.5% / 37.3% with a 20.6 MB model file. That result belongs to the combined variant; it cannot be credited to CA alone. Prepared but unrun configurations are not listed as results.

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

### Model selection: what accuracy and timing can tell us

The main validation results below supported model selection. Training batches, pretraining and configurations differed, so a cross-model difference is not a component's isolated contribution.

| Model / configuration | Validation mAP@0.5 | Model file | Amortized validation inference |
| --- | ---: | ---: | ---: |
| YOLOv5s, reference | 69.5% | 14 MB | — |
| YOLOv7, no pretraining | 73.8% | 76 MB | — |
| YOLOv7, pretrained | 77.4% | 76 MB | 4.3 ms |
| YOLOv6s, pretrained | 75.9% / 76.9%¹ | 36.2 MB | 2.79 ms |
| YOLOv7-tiny, 640 configuration | 72.6% | 11.6 MB | 1.6 ms |
| YOLOv6-tiny | 74.1% | 31.6 MB | 2.15 ms |
| YOLOv6n | 64.8% | 9.32 MB | 1.02 ms |

¹ Two YOLOv6s results differ and have not been fully matched to their checkpoints. Both are retained rather than selecting the higher as a definitive score. A dash means no paired timing. Most variants used 300 training epochs, versus 200 for YOLOv6n; YOLOv5 results are references.

The validation program divides accumulated inference time by the number of processed images. This is not batch-one response latency and excludes capture, preprocessing and control. Different validation batches and environments prevent a controlled claim about speedup. [YOLOv7 timing implementation](https://github.com/WongKinYiu/yolov7/blob/main/test.py)

Full YOLOv7 scored higher; tiny had a smaller file and shorter recorded inference. YOLOv6n saved more computation but lost detection performance. These comparisons helped define what accuracy cost was acceptable for a smaller model.

#### Anomalous results need checking before interpretation

| Anomalous entry | What needs checking |
| --- | --- |
| tiny validation input 640 → 512, score 71.6% → 40.8% | The drop is large; confirm matching weights, metric columns, preprocessing and validation settings before attributing it to resolution |
| One CA configuration scored 31.8%, versus 65.9% in the architecture comparison | The configurations are not fully paired; these cannot establish one CA effect |
| Varifocal validation: inference 1.0 ms, NMS 60.3 ms | Focal validation reported NMS at 0.8 ms; this does not establish that Varifocal caused slow postprocessing |
| Focal validation reported `Premature end of JPEG file` | Inspect the affected image and decoded input; the warning alone does not establish an effect on the score |

These values are preserved, but excluded from the normal selection comparison. Weight identity, inputs, thresholds, candidate-box counts and repeatable timing need checking first. Those are diagnostic questions, not established causes.

The 60.3 ms NMS value is one validation output, not established steady-state latency. It must also stay separate from the game's 4 ms single-frame TensorRT timing. Inference, postprocessing and full response time need distinct definitions.

### Focal and Varifocal address different questions

Two company-data loss trials have complete validation outputs: 586 images, 2,100 object annotations, 640×640 inputs and validation batch size 32.

| Loss trial | Precision | Recall | mAP@0.5 | mAP@0.5:0.95 |
| --- | ---: | ---: | ---: | ---: |
| Focal | 78.1% | 66.9% | 72.6% | 42.2% |
| Varifocal | 71.6% | 70.6% | 74.0% | 43.2% |

Varifocal scored **1.4 percentage points higher** on mAP@0.5 and had higher recall, but lower precision. It did not improve every aspect of detection. The validation implementation selects precision and recall at each run’s maximum mean F1. The operating points may differ, so these values do not establish a change in false positives at one shared threshold and are not substitutes for AP.

The class breakdown shows where the difference appeared:

| Class | Focal AP@0.5 | Varifocal AP@0.5 | Change, percentage points |
| --- | ---: | ---: | ---: |
| Furniture legs | 50.1% | 52.9% | +2.8 |
| Cables | 74.3% | 76.0% | +1.7 |
| Shoes | 82.9% | 84.1% | +1.2 |
| Paper balls | 83.2% | 82.9% | −0.3 |

Furniture legs remained the hardest class. The validation size and inputs match, but training budgets and checkpoints have not been fully paired. These are two loss-trial results, rather than a verified single-variable ablation.

I separately remember a loss-only improvement of about five percentage points, without remembering whether Focal or Varifocal produced it. That recollection cannot be merged with this 1.4-point difference. The game-data loss comparison appears separately later.

I considered Focal and Varifocal and also increased weighting for less-represented classes. Class weighting changes a class’s contribution, while ordinary Focal changes an example’s contribution according to prediction difficulty. Ordinary Focal Loss reduces the contribution of easy examples, which matters when easy background predictions vastly outnumber harder cases. Class weighting addresses a different imbalance: how much different classes contribute.

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

### Training budgets: when to stop an experiment

I had one 2080 Ti. I often trained a configuration for over a hundred epochs until loss barely changed; a full trial could take about a day. That limited how many ideas I could test.

Looking back, I would screen candidates with a common shorter budget once validation behavior begins to stabilize, then train promising ones thoroughly. Slow starters deserve a second look. Loss values themselves are not directly comparable across loss functions: a weighting change can make them smaller without improving detection.

I also ran into out-of-memory failures with oversized batches. Training stores intermediate activations and gradients as well as weights. Today I would complete a step at a small batch size, measure peak memory, then increase it. Gradient accumulation and mixed precision are possible new experiments, not optimizations I can claim to have used then.

#### Revisiting the split and training budget

I wrote a random-split program for more than 2,900 images, using 90% for training and 10% for validation. The original YOLOv7-tiny used batch size 12 and a budget of 1,000 epochs; its best checkpoint was at epoch 303:

| Metric | Result |
| --- | ---: |
| Precision | 81.24% |
| Recall | 71.69% |
| mAP@0.5 | 77.95% |
| mAP@0.5:0.95 | 46.46% |

There was no new attention block behind this result. The split and training budget changed, so subtracting an earlier score would not measure a module's contribution. Checking data and training arrangements could be more useful than another architectural replacement. A random split can still put similar scenes on both sides, so 77.95% does not directly establish performance on unseen scenes.

![Training and validation losses for household detection](/images/bona/company-training-loss.webp "Training losses above keep falling while validation objectness loss below rises. This is a household-detection run, not the game model or the later 90:10 split experiment.")

This curve explains why I returned to the data. Fitting the training samples better did not improve validation behavior. It supports concern about overfitting, but does not isolate the contributions of imbalance, label noise or repeated scenes.

#### Other ways to train with limited, uneven data

The method should match what is missing: quantity, variation or reliable labels.

| Method | Purpose | Tradeoff or check |
| --- | --- | --- |
| Pretraining and fine-tuning | Reuse features rather than learn everything from limited data | Partial freezing can save resources; excessive freezing can limit adaptation |
| Label review, collection and augmentation | Add reliable examples and appearance variation | Transform boxes with images; cropping must handle thin-target labels correctly |
| Sampling and class weighting | Give scarce targets more training exposure | Sampling selects images, potentially with multiple classes; repeated rare images can overfit |
| Regularization and early stopping | Limit fitting to the training data | Select checkpoints using validation, rather than waiting for training loss to stop falling |

Partial freezing followed by unfreezing is one fine-tuning route, with the freeze extent chosen through validation. Newly introduced modules still need training. [Transfer-learning example](https://docs.ultralytics.com/yolov5/tutorials/transfer-learning-with-frozen-layers)

**Cross-validation checks evaluation stability.** Three-fold validation trains three independent models, rotating one validation fold against two training folds. Compare per-class AP means and variation. Each fold starts from the same pretrained initialization, not the model from the previous fold. Keep the final test set outside model selection. This creates neither new independent data nor balanced training automatically. [Cross-validation guide](https://scikit-learn.org/stable/modules/cross_validation.html)

If images share a capture segment or scene, keep that group within one fold. Detection images may contain multiple classes; fold assignment needs to consider instance counts and class presence, rather than assign each image one arbitrary label for ordinary stratification.

On one 2080 Ti, cross-validation costs additional training runs. Screening on a fixed validation set first and checking a few finalists across folds is more practical. Each method addresses a different issue; the choice depends on the data and the training budget.

### The Ascend competition: get training running first

After the company work, I participated in a Huawei competition and tried training on Ascend NPU hardware. Software compatibility became the first obstacle before model changes could be evaluated.

The environment adapted PyTorch to the platform. YOLO encountered several version or operator-support errors. I suspected a matrix-related function, but no minimal reproduction or historical logs remain, so I cannot call it a confirmed vendor bug. We eventually used a YOLOv5 template for training on the Ascend server.

My experience was that migration was cumbersome and training was slow. Time intended for model work went into compatibility problems. That describes my environment at the time, not every Ascend setup; identifying the bottleneck would require those versions and logs.

Today I would start with an already adapted model, run a few training steps and check inputs, loss and parameter updates before adding changes. For a suspected operator problem, a small independent input compared across platforms would be easier to diagnose than the whole detector. [Ascend PyTorch documentation](https://www.hiascend.com/document/detail/zh/Pytorch/2600/index/index.html)


## Personal work: visual aim assistance from game images

### What made me try it

Imagine a frame with the crosshair at the center and a target moving sideways. By the time the detector returns a box, the target has moved. A program responding to that box follows an earlier position. Recognition can be correct while the action is late: visual aim assistance has to handle the delay between seeing and moving.

The starting point was Call of Duty. I saw someone use AI to recognize the game image and drive aim assistance, and wanted to try that approach myself. At the time, I felt memory-reading assistance was outdated. That was my motivation, rather than a claim that vision had no limitations of its own.

This prototype became a neural-network course project coauthored with a classmate. I collected and annotated my game images and worked on training and the real-time program. The prototype needed to find targets in captured frames and connect their positions to movement. I collected and annotated the data myself, then worked on capture, inference and control. The archived images below are from my prototype in Apex, not the Call of Duty demonstration that inspired it.

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

The game-data loss comparison used 2,000 epochs, batch size 32 and images resized to 640×640:

| Loss | AP@0.5 |
| --- | ---: |
| Focal Loss | 90.58% |
| Varifocal Loss | 91.12% |

Varifocal improved the score by **0.54 percentage points**. This was a modest improvement on game data, separate from the company experiments discussed earlier.

We also extended training to roughly 4,500 epochs. Validation did not keep improving, and we subsequently chose a budget around 2,000 epochs.

![Training and validation losses for the game model](/images/bona/game-training-loss.webp "Training losses are above, validation losses below. Training objectness loss keeps falling while validation objectness loss rises later. The original horizontal axis is labeled Step.")

The two objectness panels explain why waiting longer was unhelpful: fitting the training data better was no longer improving validation behavior.

### 3. Runtime: from one frame to an action

Following execution order separates the responsibilities:

```text
Pixels → Preprocessing → TensorRT detections → Target selection → Error → PID → Action
```

#### Capture and coordinates

I compared several capture paths:

| Capture package / interface | Capture time |
| --- | ---: |
| PIL | 18 ms |
| win32gui | 10 ms |
| pyautogui | 20 ms |
| mss | 12 ms |

The Windows path was fastest in this comparison. It required more interface code, but capture ran on every frame. My recollection of later getting down to a few milliseconds concerns subsequent work; it does not replace these comparison values.

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

Inference was measured separately:

| Model format | Single-frame inference |
| --- | ---: |
| PyTorch `.pt` | 11 ms |
| TensorRT `.trt` | 4 ms |

Inference became about 2.75 times faster, while overall image processing still took roughly 18–26 ms. Capture, preprocessing and result handling remained. After accelerating the model, capture deserved more attention.

These timings describe this prototype, rather than guaranteed performance on another machine. The program's `Done. (...)` timer starts before capture and must not be presented as neural-network inference time alone.

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

#### Seeing a related idea in a later UAV paper

While building this prototype in 2022–2023, I was already thinking about connecting detection, position estimation across frames and control. YOLO could find a target, but boxes could jitter, targets could move, and a returned position could already be outdated. An accurate detection in one frame did not settle how to act on it.

Years later I came across [Fast UAV Object-Searching in Large-Scale and Complex Environments](https://researchers.westernsydney.edu.au/en/publications/fast-uav-object-searching-in-large-scale-and-complex-environments/), a 2025 *IEEE Transactions on Cybernetics* paper involving Sichuan University. It combines YOLO and Kalman filtering for object-position estimation in cluttered, occlusion-prone environments, then uses that information for UAV search. What caught my attention was the connection to the chain I had considered years earlier in a game prototype, now developed in a different application as a published study.

My starting point was connecting screen positions to control. The paper also develops search strategies, viewpoint generation and path planning. Reading it made the distance between a working prototype and a complete research study clearer: problem definition, method development and experiments all need further work. My own attempt was small, but the question of what happens after detection was worth pursuing.

### 4. Use the result to decide what to change

I collected images, annotated them, trained, inspected missed or mistaken detections, then captured the missing scenes. A preliminary model could provide rough labels for manual correction. Skipping that correction would feed its own mistakes back into training.

If I rebuilt the dataset now, I would split by capture segment or scene. Frames a few milliseconds apart are nearly identical; a random frame split can make validation look better than performance in a new scene.

Different failures lead to different work. Confusing teammates with enemies sends me back to examples and labels. Outdated positions call for measuring capture, inference and control separately. Correct boxes with unstable movement call for checking target switches, estimation and control parameters. A new detector is not the answer to every failure.

We connected collection, annotation, training, real-time detection and relative control into a working prototype. My data preparation and training work formed part of a jointly authored course project; the control package also carried team attribution.

The useful lesson was to examine the model in use: collect examples of what it misses, measure the stage that is slow, and inspect control when detection is correct but movement is not.
