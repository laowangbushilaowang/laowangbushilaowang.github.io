---
title: Reading the HG532 command injection
date: '2026-10-16'
publishedAt: '2026-10-16T12:35:29Z'
updated: '2026-10-16'
language: en
translationKey: hg532-command-injection
project: hg532-security-notes
excerpt: A short note on how URL fields cross into shell syntax, and what to check when reading a small experiment script.
tags: [Security, Firmware, Reading notes]
---

How does a firmware-upgrade interface end up executing a command unrelated to an upgrade? CVE-2017-17215 in the Huawei HG532 makes the problem fairly concrete: a request supplies a URL, but characters in that URL can become shell syntax during processing.

In 2024, I collected an HG532 firmware image and two experiment scripts in my [cyberproject repository](https://github.com/laowangbushilaowang/cyberproject). This is a short reading note around those materials. Check Point discovered and disclosed the vulnerability; my focus here is the failure it illustrates and how to read a script intended to trigger it.

## Where a URL becomes a command

The interface handles firmware upgrades. A client sends a SOAP message, an XML document containing information for the upgrade. Two of its fields, `NewStatusURL` and `NewDownloadURL`, contain URLs.

[Check Point's disclosure](https://research.checkpoint.com/2017/good-zero-day-skiddie/) describes shell metacharacters in those fields reaching command execution. The relevant path can be summarized as:

```text
URL in a SOAP request
    ↓
Upgrade handler reads the field
    ↓
Field content reaches a shell command
    ↓
Some characters are interpreted as syntax
```

A string can be ordinary data to a URL-handling function and have another meaning to a shell. Valid XML only establishes that the message has the expected structure. It says nothing about whether a field is safe to include in a command.

Authentication addresses a separate question: who can call the interface? The handler still needs to prevent input from changing what the program executes. [Huawei's notice](https://www.huawei.com/br/psirt/security-notices/2017/huawei-sn-20171130-01-hg532-en) explicitly describes an authenticated attacker. The issue concerns affected versions, rather than every HG532 device.

## Follow the value into the request

The first script is short: read input, insert it into XML, send an HTTP request, and print the response status and body. Following that sequence makes it easy to distinguish supplied input from the fixed template.

The other script has a string-construction problem. It defines a command variable, but its XML template contains literal concatenation text instead of interpolating that variable. A harmless example shows the difference:

```python
name = "notes"
f"<name>{name}</name>"
# <name>notes</name>

f'<name>" + name + "</name>'
# <name>" + name + "</name>
```

The `f` prefix does not substitute variable names by itself; the braces matter. Reading only the variable declaration gives the wrong impression of what will be sent. Following the constructed string reveals the actual request content.

There is another distinction after the request leaves the client. An HTTP status and response body tell us how the service responded. Establishing what ran on the device requires an observation on that side. A script printing that it is attempting something supplies no such observation.

I would inspect the constructed request body first, then ask what effect it should have on the device.
