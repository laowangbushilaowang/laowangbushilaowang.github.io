---
title: "Playing Slay the Spire 2 through MCP on a Mac"
date: "2026-10-16"
updated: "2026-10-16"
language: "en"
project: "sts2-mcp-on-mac"
excerpt: "A short open-source setup note: a missing Mac build file, a few turns of tool-driven play, and a modded-save issue after removal."
cover: "/images/sts2/mcp-loop.svg"
coverAlt: "State and action flow between the game Mod, Python MCP server and Codex"
tags: [MCP, Agents, macOS, Games]
draft: false
---

I saw people using AI to play Slay the Spire 2 and wanted to try it. [CharTyr/STS2-Agent](https://github.com/CharTyr/STS2-Agent) already supplied the game Mod and MCP server. With Codex's help, I connected it on a Mac, patched one build script, and played a few turns.

## Getting state out of the game

This setup does not recognize cards from screenshots. A C# Mod reads the hand, energy and enemies; Python wraps its local API as MCP tools; Codex chooses the next action.

![The Mod, MCP and decision loop](/images/sts2/mcp-loop.svg)

*A schematic of the local v0.5.2 integration, not a game screenshot. CharTyr created the framework. State reaches the model, an action returns to the game, and the loop reads again.*

The Mac setup used a source build. Compilation succeeded, but health stayed unavailable. Comparing the shell and Windows scripts exposed a missing `mod_id.json` copy. The game needed three files:

```text
mods/
  STS2AIAgent.dll
  STS2AIAgent.pck
  mod_id.json
```

After adding the file check and copy, and addressing enable settings and installation location, the game returned `ready`. The small patch remains in the local working copy. Checking whether the Mod loaded, then whether MCP could read state, was more useful than starting with the model's behavior.

## Playing a card can change its index

I required a fresh `state` and `available_actions` read before each action. The first session put the Ironclad against a Nibbit:

| Action | Observed response |
|---|---|
| Turn 1: Bash, then Strike | Enemy HP 42 → 34 → 25; energy exhausted |
| End turn and wait | Turn 2; player HP 80 → 68, three energy |
| Turn 2: Strike, then two Defends | Enemy HP 25 → 16; block 0 → 5 → 10 |

Initially, hand index 3 meant Bash. Once Bash was played, index 3 meant Strike. Reading a hand once and queuing several numeric indexes would lose that mapping. Playing, drawing and discarding all require fresh indexes.

After ending the turn, the screen still said `COMBAT`, but no actions were available. The agent had to wait for the next action window. Some compact card text also retained numeric placeholders, so damage reasoning needed fuller responses rather than remembered card rules alone.

I stopped during turn two. This tested state reads, actions and waiting, not a complete run. The session called MCP tools directly; it did not load a playing Skill. The repository's Skill and multi-agent handoff are upstream features.

## Removing the files did not clear every state

A few days later, I asked to uninstall the Mod because the game kept entering its `modded` save branch. The three files were moved out with a backup, but the next launch still behaved that way. The settings retained an enabled Mod entry, and vanilla and modded saves were stored separately.

I did not delete or merge saves, or verify a later settings cleanup and return to vanilla. The practical lesson was small but useful: inspect state and actions when connecting a tool, then inspect retained settings and saves when disabling it. Removing the executable files may leave part of the integration behind.
