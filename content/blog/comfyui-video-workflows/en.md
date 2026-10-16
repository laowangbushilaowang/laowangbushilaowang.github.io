---
title: "Trying ComfyUI video with my own reference photos"
date: "2026-10-16"
updated: "2026-10-16"
language: "en"
project: "comfy-video"
excerpt: "An action clip, an unsuccessful outfit change and a surprising memory setting on an A6000. A small experiment with existing video workflows."
cover: "/images/comfy/fight-frames.webp"
coverAlt: "Frames at 1, 7 and 13 seconds of the generated action clip; not live footage"
tags: [ComfyUI, Video Generation, MiniMax H3]
draft: false
---

I wanted to put my own reference photos into a short action video: two people fighting, with some cinematic movement. I barely understood ComfyUI's connections, so I asked Codex to find importable workflows and adapt them to the models already on the server. This used existing ComfyUI and MiniMax H3 capabilities. My changes concerned model configuration, reference roles and prompts.

A 15-second portrait clip came out of it. The characters moved, and the prompt influenced camera changes and scenes. Motion and identity were still far from reliably natural. That led to more specific questions: what did each reference control, why was generation so slow, and how could one segment continue into another?

## Connecting the right inputs

The workflow's models had different jobs. Qwen3-VL encoded the text and reference images. H3 sampled audiovisual latents. Video and audio VAEs decoded those into frames and sound, which were assembled into an MP4. The sampler's `Samples` output was not yet an image sequence ready to save.

```text
Text + references → conditioning → H3 sampling
                                       ↓
                            video + audio decoding → MP4
```

Importing a workflow initially produced a Missing Model error. Its loaders referenced quantized weights, while the server had BF16 files. The loader selections had to match what was actually installed. **A workflow JSON does not install its model weights or custom nodes.**

I also changed the prompt's division of labor. The photos supplied appearance; the text concentrated on actions, camera movement and timing rather than describing the people again.

![Three frames from the action clip](/images/comfy/fight-frames.webp)

*Frames at 1, 7 and 13 seconds from my generated clip, resized for this page. These are model-generated images. The sequence moves from a nighttime fight into another setting; prompt influence should not be confused with reliable control over motion or identity.*

## Why was a 48 GB GPU offloading?

The combination of 15 seconds, high resolution and BF16 ran slowly. The initial diagnosis focused on model size, but I questioned whether the GPU was really too small.

The check showed an **RTX A6000 with 48 GB**, with roughly **30 GB free** at that moment. The process command then revealed:

```text
--novram
--disable-all-custom-nodes
```

`--novram` selected a memory-saving mode that moved more model work between system memory and the GPU. Offloading alone did not establish that the physical GPU capacity was inadequate. The [ComfyUI argument definitions](https://github.com/Comfy-Org/ComfyUI/blob/master/comfy/cli_args.py) document these options.

Custom nodes were disabled too, so adding an acceleration node would not make it available automatically. I collected the diagnostic details for Codex on the server, without restarting the running generation.

I do not have a controlled before-and-after timing comparison from the adjustment. Nor would removing the flag guarantee enough memory for every BF16 model and intermediate tensor. The useful troubleshooting order was to inspect the actual GPU and occupancy, check the launch mode, then consider precision, resolution and optional acceleration.

## Longer clips and stricter control

Fifteen seconds felt short, so I tried adapting the three-segment workflow from [Herrgotts H3 Infinite Continuation Suite](https://github.com/HerrgottMargott/Herrgotts-H3-Infinite-Continuation-Suite). Its continuation passes audiovisual latent context forward, uses keyframes to guide segment endpoints and handles joins. Those mechanisms belong to the upstream project.

With Codex's help, I prepared a 736×1280 version requesting three ten-second segments: select the installed BF16 weights, remove the optional SageAttention node and change the story prompts. Each segment had a role—opening, development and ending. The server still disabled custom nodes, so this adapted workflow did not produce a verified continuous clip of my own.

A later outfit-change test exposed a simpler control failure. The prompt assigned identity to the first reference and clothing only to the second. It explicitly asked the model not to copy the second person's face.

![Opening and fourth-second frames from the outfit test](/images/comfy/outfit-frames.webp)

*The generated output at 0 and 4 seconds. The clothes changed, but so did the person. It failed the intended identity-preserving outfit change.*

These are the two saved outputs. Duration means media length, not generation time.

| Output | Resolution | Duration | Sampling steps |
|---|---|---:|---:|
| Action clip | 768×1376 | 15.083 s | 20 |
| Outfit test | 480×864 | 5.167 s | 20 |

The outfit request was five seconds. This workflow converted that into a valid H3 frame count of the form `17n + 5`: 120 became 124 frames, or about 5.167 seconds at 24 fps.

These experiments separated a working graph from a successful result. The graph could produce video, while the more demanding instructions—this person, those clothes, continuous movement—still required inspection. Writing “preserve identity” in the prompt did not stop the model from replacing both the outfit and its wearer.
