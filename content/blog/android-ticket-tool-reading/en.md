---
title: "How Appium controls an Android phone"
date: "2026-10-16"
updated: "2026-10-16"
language: "en"
project: "ticket-tool-research"
excerpt: "A short reading note on open-source Android tools: connecting a phone, locating a control, and checking what happened after a click."
tags: [Android, Automation, Appium, Code Reading]
draft: false
---

I started by wondering how concert-ticket automation worked. While comparing [WECENG/ticket-purchase](https://github.com/WECENG/ticket-purchase) and [Guyungy/damaihelper](https://github.com/Guyungy/damaihelper), I reached a more concrete question: I had an Android phone, but how would Python on my computer control it? I later read [currycan/HaTickets](https://github.com/currycan/HaTickets) too. These are third-party projects; this is a short code-reading note.

## What Appium does in the middle

`ticket-purchase` creates an Android session through `webdriver.Remote`, selecting the UiAutomator2 driver. Python describes lookups and clicks, Appium Server receives WebDriver requests, and the driver and device-side components perform the operations. “Remote” refers to the protocol connection; the server can run on the same computer. [Appium's architecture](https://appium.io/docs/en/latest/intro/appium/)

HaTickets takes a different entry point: the Python [`uiautomator2`](https://github.com/openatx/uiautomator2) library connects through `u2.connect`, without a separate Appium Server.

![Appium and Python uiautomator2 control paths](/images/ticket-reading/control-paths.svg)

*A schematic based on the implementations and official documentation. Both paths ultimately read and operate the device UI.*

Seeing a device in ADB is only the connection stage. A failed session points toward the service or driver; a working session that cannot find a button points toward the screen or locator. Separating those questions is more useful than reinstalling everything after each error.

## After finding a button, check where the page went

UI automation can locate controls through text, resource IDs and accessibility descriptions in the control hierarchy. It does not always need image recognition. Custom-drawn regions may expose less information, depending on the app. [Android UI Automator documentation](https://developer.android.com/training/testing/other-components/ui-automator)

One `ticket-purchase` approach finds an element, reads its bounds and taps the center. HaTickets also has a `PageProbe` that checks the current Activity before inspecting key controls as needed. One identifies a location; the other helps establish the current page state.

The return path was worth following. One flow called its final click helper, ignored the return value, then returned `True`. Reaching the end of a function does not establish that the UI completed the intended action. HaTickets distinguishes page readiness, reaching a confirmation screen and the eventual result.

Timing needs the same care. A quickly returned click command is not a quickly completed workflow. A shorter delay may simply read the previous screen sooner and require more retries. I did not run a device or ticket-purchase test. The useful outcome was a way to read these tools: trace the connection, the locator and the next-page confirmation, rather than comparing functions named “fast click.”
