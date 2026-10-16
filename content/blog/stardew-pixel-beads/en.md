---
title: "Turning Stardew characters into bead patterns"
date: "2026-10-16"
updated: "2026-10-16"
language: "en"
project: "stardew-pixel-beads"
excerpt: "One pixel per bead still leaves background removal, palette mapping and readable instructions. The most useful correction was turning a skin-colored shirt back to white."
cover: "/images/stardew-beads/characters.webp"
coverAlt: "Two characters extracted from a game screenshot, shown in the source palette without ground shadows"
tags: [Pixel Art, Swift, Image Processing]
draft: false
---

I wanted bead patterns of two Stardew Valley characters, preferably smaller than an iPhone mini while retaining their hats, clothes and expressions. An early design simplified a photograph too aggressively. I switched to a game screenshot: the pixel design was already there, so redrawing it was unnecessary.

This was a small Codex-assisted making project. Its outputs are transparent character PNGs, per-cell color charts and bead counts. The character art comes from the game screenshot; my work here was directing extraction and pattern preparation.

## One pixel per bead starts with the silhouette

The two-character screenshot is only 56×38 pixels. Removing edge-connected background and separating the figures initially gave two 15×33 bounds. Their yellow ground shadows were still included. After I asked to remove those, both character bodies became **15×31**.

Transparent cells stay empty. Enlarged previews retain hard pixel edges rather than smoothing in new colors. The bounds depend on the hat, hair and pose in this image; a 16×29 size from a different image was not a template to impose on it.

## A screen color is not a bead product

The first palette used source HEX values. A color such as `#EEEEEE` describes an on-screen value, not a bag of “number 10” beads. After I chose Artkal mini, the palette was mapped to [C-series codes](https://www.artkalfusebeads.com/pages/c-color-chart).

That mapping needed a correction. A group of white-shirt pixels on the right character had been assigned a skin color. The preview looked muddy. That group changed from `C23` to `C01`, alongside adjustments to hair, face and clothing groups.

![Source colors, first bead mapping and revised mapping](/images/stardew-beads/palette-comparison.webp)

*Left to right: source palette, first code mapping, revised mapping. Cropped and aligned from actual outputs. Compare the shirt beside the tie: the first mapping is skin-colored; the revision is light. These are previews, not physical beadwork.*

The script uses a hand-written correspondence table. Numerically similar colors can erase the distinction between skin and clothing. A few wrong beads matter in a small figure. The screen palette remains approximate; the RGB table is not a physical color calibration.

## Making the chart usable cell by cell

The PNG chart labels each filled cell with its `Cxx` code and leaves empty cells blank. A side panel shows the figure and counts by color. Swift AppKit draws the grid, coordinates and text; counts come from the same cell data.

![A detail of the bead chart and color counts](/images/stardew-beads/pattern-detail.webp)

*A crop from the actual pattern. Cells carry bead codes and the right panel counts pieces; the revised shirt uses 13 `C01` beads. Enlarge to inspect.*

| Pattern | Grid | Filled cells | Bead colors used |
|---|---|---:|---:|
| Left character | 15×31 | 392 | 22 |
| Right character | 15×31 | 333 | 21 |
| Later additional character | 16×28 | 356 | 15 |

A later image arrived as an enlarged JPEG. Its compression artifacts should not become extra bead colors. The extraction first recovered the grid using its fivefold enlargement, sampled block centers, then grouped colors into a limited palette before preparing a 16×28 figure. That is an approximate reconstruction, unlike reading the original PNG.

The outputs shown here are patterns and screen previews, without a physical color-match check.
