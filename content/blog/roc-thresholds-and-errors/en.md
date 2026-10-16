---
title: ROC curves, thresholds, and the cost of errors
date: '2026-10-16'
publishedAt: '2026-10-16T12:19:13Z'
updated: '2026-10-16'
language: en
translationKey: roc-thresholds-and-errors
project: roc-evaluation-coursework
excerpt: A course note on the denominators behind Precision and FPR, a threshold point versus a whole ROC curve, and what a fairness metric leaves unanswered.
tags: [Machine learning, Model evaluation, Coursework]
---

A 2023 CS640 assignment put model evaluation and algorithmic fairness side by side. The first part asked me to calculate a confusion matrix, interpret ROC curves, and adjust a threshold. The second asked what it would take to call a decision system fair.

The arithmetic was only part of the exercise. Eighteen false positives mean different things depending on the denominator. Raising an alert threshold may reduce false alarms while also losing positives that a lower threshold would catch.

These are course notes built around that assignment. The figures come from the supplied questions; my code and answers are in the [original notebook](https://github.com/laowangbushilaowang/701_ass/blob/main/701_ass1/ROC_Analysis_and_Ethics.ipynb).

## Start with the denominator

The assignment began with implementing a confusion matrix. I used rows for true labels and columns for predictions, then checked the function against scikit-learn using arrays of zeros and ones. Swapping the axes changes the interpretation of the counts, so the convention needs to be explicit.

Here is matrix A from the assignment, with class 1 treated as positive:

![Confusion matrix A supplied in the assignment](/images/roc-ethics/confusion-matrix.webp)

*Course figure: 52 actual positives and 48 actual negatives, with TP=26, FP=18, TN=30, and FN=26.*

Three useful rates follow directly:

$$
\begin{aligned}
\mathrm{TPR} &= \frac{26}{26+26} = 0.5 \\
\mathrm{FPR} &= \frac{18}{18+30} = 0.375 \\
\mathrm{Precision} &= \frac{26}{26+18} \approx 0.5909
\end{aligned}
$$

TPR, or Recall, asks how many of the 52 actual positives were found. FPR asks how many of the 48 actual negatives were incorrectly flagged.

Precision starts from the predictions instead: of the 44 positive predictions, how many were correct? **FPR is therefore not `1 − Precision`.** Both involve false positives, but one divides by actual negatives and the other by positive predictions.

A count of 18 false positives leaves both questions open. Someone reviewing alerts may care about how many they must inspect to find a real problem. An evaluator also needs to know how often normal samples get flagged. The intended question determines which rate is useful.

## A threshold point is not a ROC curve

Turning a score into a binary prediction requires a threshold. At one fixed threshold, a confusion matrix gives one point on the ROC plot. Moving the threshold produces the curve.

Matrix A gives the point `(FPR=0.375, TPR=0.5)`. That single point cannot reconstruct the whole curve or determine its AUC.

![Two ROC curves supplied as a course illustration](/images/roc-ethics/roc-curves.webp)

*Course illustration. Curve 1 lies above curve 2, offering a higher TPR at the same FPR through the interior of the plot.*

Another question asked how to reduce false alarms. Under the rule that higher scores are more likely to be classified positive, raising the threshold reduces the set of positive predictions. That can remove false alarms, but it can also remove true detections.

Fewer alerts do not by themselves establish a better model. Choosing the operating point requires comparing the cost of a missed problem with the cost of investigating another alert. The curve describes available trade-offs; using the system still requires selecting a point.

The same distinction matters in my [YOLO project](../bona-yolo-training/): Precision and Recall at an operating point need to be distinguished from AP, which summarizes a curve. A lower value at one point does not establish that the whole curve got worse.

## Equalizing one rate leaves other questions

The later questions introduced deferral: the model can leave some cases undecided and pass them to another process. This creates options, but also questions about who waits, who handles the deferred cases, and what happens if that process makes mistakes.

[Canetti and colleagues](https://arxiv.org/abs/1810.02003) study fairness properties of deferring classifiers and discuss costs to both individuals and decision-makers. Evaluating only the automatically decided cases can miss what the deferred group experiences.

[Suresh and Guttag's framework](https://arxiv.org/abs/1901.10002) considers harm throughout data collection, model development, and deployment. How labels are measured and how predictions are used can matter beyond the choice of a threshold.

My answer is to treat equality of a particular rate as a specific property to investigate. I would also examine who receives the errors, how deferred cases are handled, and whether the labels fit the task. Matching one rate cannot settle whether the whole system is fair.
