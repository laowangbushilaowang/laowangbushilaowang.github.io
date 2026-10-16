---
title: Symbol matching and door detection in drawings
date: '2026-10-16'
publishedAt: '2026-10-16T13:10:45Z'
updated: '2026-10-16'
language: en
translationKey: drawing-symbols-and-doors
project: drawing-vision
excerpt: "Two drawing tasks, two data conditions: template search for query symbols and a detector/classifier pipeline for doors. What helped, what rejected real targets, and where the remaining misses came from."
tags: [Computer vision, OpenCV, Object detection]
---

The assessment had two tasks: find instances of a supplied symbol in a drawing, and detect doors while distinguishing their handedness.

I worked with Codex on implementation and experiments, reviewing the drawings and deciding what to investigate next. An early result looked encouraging: every one of 25 development reference locations was matched. On other drawings, though, the output still included text, wall lines, and similar-looking symbols. The small evaluation table and the full drawings gave different impressions.

The useful questions became more specific. What happens when a symbol changes scale or orientation? Can a filter discard a real match? And when a door is missed, was its location never found, or was a good candidate lost later?

## The data determined where training made sense

The two tasks came with different kinds of information.

- **Symbols:** 12 drawings and 17 query images, without complete location annotations. I started with query-based template search and a limited set of manually reviewed development regions.
- **Doors:** 96 images with matching TXT annotations, containing 1,490 boxes across four numeric classes. Classes 2 and 3 supplied 1,330 single-door examples for the target task.

![Actual query, drawing detail, and supplied door annotation](/images/drawing-vision/inputs-en.webp)

*Examples of the supplied inputs. The orange door box comes from the annotation file; it is not a detection result.*

Completing the symbol annotations before training would have turned the first task into a data-production job. I wanted to see how far an existing visual example could take us. For doors, the available labels supported training a YOLO detector and a ResNet18 crop classifier. The networks came from open-source implementations; the surrounding work concerned the data, search, verification, and evaluation.

## Symbol search started with crop, scale, and orientation

A query is not necessarily a clean copy of something in the drawing. It may include an adjoining wall line. The corresponding symbol may also be smaller or rotated.

The basic operation was OpenCV's `matchTemplate`: slide a template across the image and score each local window. I cropped the symbol core, then searched across sizes and four right-angle orientations. The development sequence illustrates why these changes mattered:

| Input and search | Matched reference locations / 25 |
| --- | ---: |
| Full query, direct matching | 0 |
| Crop to the symbol core | 9 |
| Add scale search | 16 |
| Add four orientations | 22 |

*These are development references from group A, reused during method adjustment. Some symbol-label semantics still need review; this table does not establish performance across the drawing collection.*

![Actual crop-only and scale-search comparison](/images/drawing-vision/scale-search-en.webp)

*The middle example produces no output. Scale search finds the symbol on the right; 0.894 is a similarity score.*

Each change addresses the alignment of the two pixel arrays being compared. Light smoothing, size filtering, and duplicate suppression were added to the same search process.

### What did the gray and “ink” scores measure?

The original matcher already combined two scores: `TM_CCOEFF_NORMED` on grayscale images and `TM_CCORR_NORMED` after inversion. I later separated their calculations to understand how they treated dark strokes differently. Both are [built-in OpenCV methods](https://docs.opencv.org/4.x/de/da9/tutorial_template_matching.html).

Let $T$ be the template's pixel vector, $P$ the candidate window, and `sim` the normalized dot product. The combination was:

$$
\begin{aligned}
g &= \operatorname{sim}(T-\bar T,\ P-\bar P) \\
k &= \operatorname{sim}(255-T,\ 255-P) \\
s &= (g+k)/2
\end{aligned}
$$

The first score subtracts each image's mean and compares relative intensity changes. The second makes white pixels zero and black pixels 255, then compares the vectors without mean subtraction. “Ink” is a convenient name for that inverted-image score; it does not extract a skeleton or understand the symbol.

![Two actual windows compared with the same query](/images/drawing-vision/similarity-windows.webp)

*Each row shows the query core, transformed template, actual window, and context. The top row matches an existing reference: gray 0.7407, ink 0.8844. The lower wall-line distractor scores 0.7191 and 0.8639. Panels are cropped from the same diagnostic.*

Both the target and the distractor received higher scores. That example made me separate an increased score from improved discrimination. Adding another score does not automatically make the decision more useful.

### A circle filter that rejected the query itself

The original pipeline also checked a configured circular perimeter. It sampled 32 directions around a manually specified center and radius, rejecting candidates without enough nearby dark pixels.

But the queries were not all perfect circles. Would those parameters still line up after resizing? One native query failed its own check: 23 directions passed, while the cutoff required at least 24.

![Original query beside the configured circle samples](/images/drawing-vision/circle-self-check.webp)

*The original query is on the left. The existing sampling configuration is overlaid on the right; some red sample locations fall outside the symbol's contour.*

I chose to disable this hard veto while retaining the other search and verification settings. The complete pipeline gave the following results on the same 40 development references:

| Circle veto | TP / FP / FN |
| --- | --- |
| Enabled | 33 / 22 / 7 |
| Disabled | 34 / 26 / 6 |

*Reused development references, with FP defined by their matching rules. Other settings and thresholds were frozen. A separate 25-location reference remained at 25 / 0 / 0.*

Disabling the filter recovered one reference target and added four unmatched outputs. F1 fell from 0.695 to 0.680. I accepted the additional candidates to remove a hard rule with a demonstrated rejection problem. The pipeline still depends on manual query crops and its existing template-size constraints.

I also tried YOLOE and pretrained TMR. The query adaptations and local comparisons in this attempt did not outperform the retained matcher, so those integrations were not adopted.

## Door detection separated location from handedness

The door task first needed to preserve detail. Shrinking an entire drawing compresses thin lines and small doors. The pipeline instead used overlapping tiles and mapped detections back to the original image. Related floors and revisions were grouped by drawing source: 29 families, split into 67 training, 15 validation, and 14 test images.

Handedness needed an explicit convention too. After rotating the opening to horizontal with the swing arc above it, I named the door by its hinge side. The supplied files contained numeric classes rather than an official class dictionary, so this convention came from visual inspection.

Augmentation had an easy-to-miss consequence: a reflection changes handedness. The four-class training code swaps labels 2 and 3 whenever it mirrors an image. Flipping only the image would teach the model that the opposite handedness has the same label.

The pipeline developed into several stages:

1. **Propose locations.** YOLO detects candidate doors in tiles.
2. **Inspect the crop.** ResNet18 reviews left, right, and background. Background here includes non-target crops such as text, furniture, and wall corners.
3. **Return to the drawing.** Merge overlapping boxes and use detector/classifier scores for output decisions. Later versions also compared resolutions and auxiliary proposals.

### Learning the neighboring classes as well

The original annotations included two other groups resembling sliding/window-like structures and double or folding doors. They were outside the requested output, but visually close to it. I proposed training all four classes, then retaining only the single-door classes, so the model could learn explicit distinctions between these neighbors.

These were the results from several iterations. Each version used a validation-selected operating point, then revisited the same test drawings. This is a version comparison; the total gain cannot be assigned to one isolated change.

| Version | mAP50 | Recall | TP / FP / FN |
| --- | ---: | ---: | --- |
| Later one-class complete pipeline | 81.8% | 73.1% | 141 / 12 / 52 |
| Four-class detector, direct target output | 83.3% | 76.2% | 147 / 17 / 46 |
| Four-class detector + review and auxiliary proposals | 82.9% | 76.7% | 148 / 11 / 45 |

*Measured against supplied annotations. A correct match needs IoU≥0.50 and the correct side. Thresholds were selected on validation. mAP summarizes ranked predictions; the counts describe the selected operating points.*

![Actual door crops before and after four-class training](/images/drawing-vision/door-comparison.webp)

*Left: the one-class complete pipeline in the table. Right: the four-class complete pipeline. The top row recovers a door; both versions miss the lower one. Green boxes are correct matches, orange boxes are missed references.*

The complete four-class pipeline found more doors and reduced false outputs. Its mAP50 was slightly below direct four-class output, while its selected operating point had fewer false positives and slightly higher recall. Those measurements answer different questions.

## Where did a missed door disappear?

The complete pipeline correctly located and classified 148 of 193 test doors, leaving 45 incorrect or missed references. Of 159 outputs, 11 were false positives: precision 93.1%, recall 76.7%.

Among the 152 doors matched to a valid location, 148 had the right side: 97.4%. That high conditional figure leaves out doors without a valid location match. The full result still needs the denominator of 193.

![Location and handedness errors on validation and test](/images/drawing-vision/door-errors-en.webp)

*Rows are reference classes, columns predicted classes. On test, four location-qualified matches have the wrong side, and 41 references lack a location-qualified final output. The unmatched row counts outputs without a matching reference; it is separate from the classifier's background category.*

Tracing candidates showed that some real doors had been detected and then downweighted. The current score multiplies detector confidence by the square root of the selected direction probability. One pale-line door had detector score 0.882, but the reviewer assigned background probability 0.784, leaving only 0.123 for its most likely side. The resulting `0.882 × √0.123 ≈ 0.309` falls below the 0.35 output threshold. In the final overlay, that looks much like a door that never produced a candidate.

Removing the background category was not a straightforward fix. Replacing the reviewer with an existing binary checkpoint recovered some doors and also admitted more furniture, text, and other distractors. Under a comparable false-positive budget, this replacement retained fewer true doors, so I did not adopt it. The classifiers had different training histories: the comparison tests a practical checkpoint replacement rather than isolating the effect of a background class.

The average also hid a strong source difference. Four office drawings contributed 38 of the 45 misses, with only 52 of 90 doors correctly found. The other ten drawings contributed 96 correct detections out of 103 references. I would examine these difficult styles and misclassified crops before deciding whether to add data, change the reviewer, or replace the detector.

A short RF-DETR screening run did not produce a replacement for the retained pipeline either. Training, validation, and a repeatedly inspected test set have different roles. Performance on drawings from new sources still needs a separate evaluation.
