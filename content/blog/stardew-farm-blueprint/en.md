---
title: "A three-stage blueprint for a Stardew farm"
date: "2026-10-16"
updated: "2026-10-16"
language: "en"
project: "stardew-farm-planner"
excerpt: "A sheep-and-cloth line, a growing winery, and enough room for two players to move. A small local planner that turned farm advice into tile coordinates, entrance checks and staged construction plans."
cover: "/images/stardew/planner-interface.webp"
coverAlt: "The local Stardew planner with map layers and a building-coordinate panel"
tags: [Stardew Valley, Canvas, Spatial planning, Codex]
draft: false
---

When I started this plan, I had just unlocked Ginger Island and placed a few dozen crystalariums near the mine entrance. The farm had eight fish ponds. I wanted a sheep-and-cloth operation, a gradual move into wine, and a layout that worked for two players leaving home.

The request sounded reasonable: make it attractive, profitable and easy to navigate, without demolishing the existing farm.

Early blueprints sent a road through a pond. A later version put one through the crop field. Buildings crowded the barn, leaving too little room at its entrance. I was planning a quieter farming life and had acquired a traffic problem instead.

With Codex, I turned the plan into a local web tool: a map rendered with game assets, tile coordinates for buildings and roads, three construction stages, and checks for overlaps and entrances. The result is a blueprint I can inspect one decision at a time.

## Keep the current farm working

![The starting farm layout supplied for planning](/images/stardew/starting-layout.webp)

*The original layout photograph shows Stardew Planner on screen. The central crop field, eight ponds at lower left and animal area on the right were the starting constraints. The browser chrome has been cropped away.*

I was not looking for a single maximum-profit strategy. I wanted to keep a wool-to-cloth line while building wine capacity, and to retain a variety of fish even if I reduced the number of ponds. Construction order mattered as much as the destination.

Wine production also requires more than empty space for kegs. [Crafting a keg](https://stardewvalleywiki.com/Keg) needs oak resin, and operating it needs a continuing supply of fruit. The plan therefore treats the tapper forest, greenhouse and island crops as part of keg expansion. Otherwise, a new machine row can simply become a new row of idle machines.

The chosen sequence used Shepherd for the cloth line while building wine capacity, deferred a switch to Artisan until kegs and fruit supply were ready, and moved the reduction from eight ponds to six into the middle stage.

These are construction rules fitted to my preferences. They are not a solved global profit optimum or a claim that one machine count suits every save.

## A sprite, a footprint and an entrance

“Put the animals on the east side” was not detailed enough to build from. It did not locate the barn's tiles, its door, or the silo that might obstruct the approach.

Taking inspiration from [Stardew Planner](https://stardew.info/), I put the design on an 80-by-65-tile standard-farm grid. A Canvas renders the map at 16 source pixels per tile, with buildings drawn from a sprite sheet.

Three pieces of geometry have different jobs:

| Information | What it determines |
|---|---|
| Sprite pixel bounds | How the roof and walls appear |
| Ground footprint | Which tiles are occupied and whether buildings overlap |
| Entrance offset | Where the player must stand to enter |

The roof extends above the footprint. Treating the entire image as occupied ground would make the collision model wrong. The renderer anchors the sprite to the footprint's lower edge, while overlap checks use a separate ground rectangle.

For example, the sheep barn is anchored at `(60, 33)` with a `7×4` footprint. Its entrance offset is `(3, 4)`, placing the approach tile at `(63, 37)`:

```javascript
building = { col: 60, row: 33, width: 7, height: 4 };
entry = { x: building.col + 3, y: building.row + 4 };
// Then check standing room and access to a road.
```

This is a shortened example from the actual configuration. A layout revision now has specific coordinates to change, rather than an instruction to move something “a little farther over.”

## Can the player get from the door to a road?

The problems I kept identifying in the drawings became explicit checks: overlapping buildings, roads crossing the modeled water or fields, occupied expansion reserves, and obstructed entrances.

Entrance access adds a small search. Starting at the approach tile, inspect neighboring walkable tiles in four directions, then their neighbors, until a road is reached or there are no new tiles to visit. This breadth-first search answers a narrow question: **can this entrance reach a road tile?**

```text
Building configuration → occupied tiles → entrance tile
                                               ↓
                                Standing room and width
                                               ↓
                                    Search for a road
```

The scope matters. Reaching any road does not prove the entire road network is connected. Water is represented by hand-written approximate regions, and the tool does not reproduce every terrain, fence, machine or NPC collision rule in the game. Skipping water while drawing a road does not automatically find a detour either.

I use these checks alongside visual inspection. All three current stage views load without warnings from this checker. Actual placement still needs checking in the game.

## Three stages instead of one distant end state

An early plan has to be possible to start. A middle plan has to extend it. Only the final plan is concerned with the larger production layout. All three share coordinates and layers, making additions and reserved space easier to compare.

![Early-stage farm blueprint](/images/stardew/early-map.webp)

*The early plan keeps eight ponds while organizing roads, tappers and animals. It also reserves later construction space. These are planned placements, not completed upgrades in the save.*

![Middle-stage farm blueprint](/images/stardew/mid-map.webp)

*The middle plan reduces ponds to six and adds animal and processing facilities. Major zones retain their locations, so expansion does not begin with an empty map every time.*

![Late-stage farm blueprint](/images/stardew/late-map.webp)

*The late plan adds sheds, cabins and travel facilities. Ginger Island supply has a separate written plan and is not drawn on this main-farm map. These are screenshots of the existing local planner, using game artwork credited below.*

I also kept asking what the remaining empty land was for. Reserves eventually received both a purpose and an activation condition: a western area could support more trees when resin or timber became a bottleneck; a southeastern area could become more sheds or a garden. Translucent markers make those options visible without pretending the buildings already exist.

The daily route groups work by frequency. Animals, greenhouse and frequently used processors belong in a convenient circuit; ponds and the cellar follow their own cycles. This is a designed work sequence, not an algorithmically proven shortest route.

## A map needs a next-action list

The web page answers where things go. A small Python script answers what to work on next, using manually entered building levels, machine counts, professions and supply information.

It can prioritize a first processing shed, remind me to build resin supply alongside kegs, or defer a profession change until preset keg and fruit-supply conditions are met. Each action includes a reason and target instead of a generic instruction to expand.

The implementation is deliberately small: evaluate rules, sort by fixed priority, print the list. It does not import a game save or synchronize the web page's three layouts. The state file and weekly tracker still contain initialization data, so goals such as finishing chores before noon or earning more after a profession change are not measured outcomes.

What I have built is a three-stage visual blueprint, coordinate and entrance checks, and a construction checklist. Profit simulation and automatic layout optimization remain outside it. On the next AI-assisted revision, I would supply footprints, entrances and protected areas before asking for more machines. That gives me a way to catch the next barn whose door has disappeared behind the plan.

*Codex assisted implementation; I supplied requirements, preferences and layout judgments. Map and sprite assets came through Stardew Planner and the Wiki. Stardew Planner is by Henrik Peinar; Stardew Valley artwork belongs to ConcernedApe.*
