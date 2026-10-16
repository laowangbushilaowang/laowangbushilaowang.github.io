---
title: "Reading ticket tools: how Appium controls an Android phone"
date: "2026-10-16"
updated: "2026-10-16"
language: "en"
project: "ticket-tool-research"
excerpt: "Following a few open-source ticket tools into Android UI automation: device connections, element lookup, page state, and what a successful function return actually means."
tags: [Android, Automation, Appium, Code Reading]
draft: false
---

I began looking at ticket tools because I wanted to understand how automated concert-ticket services worked. Once I found a few repositories, my questions became more concrete: I had an Android phone, so how would a Python program control it? What did Appium do in between?

The initial comparison involved [WECENG/ticket-purchase](https://github.com/WECENG/ticket-purchase) and [Guyungy/damaihelper](https://github.com/Guyungy/damaihelper). Later material also included [currycan/HaTickets](https://github.com/currycan/HaTickets). This is a tool-selection and code-reading note about those authors’ implementations.

The part that interested me most was the mobile automation underneath: what has to happen for a program to perform an action on a phone screen?

## The path from Python to the phone

The mobile entry in `ticket-purchase` creates a `webdriver.Remote` session, specifying Android and UiAutomator2.

“Remote” describes the protocol boundary: the script sends WebDriver requests to a server, which may run on the same computer. Python describes actions such as locating an element or clicking it. Appium Server receives the request, and an Android driver translates it into device-side automation. Appium’s [architecture introduction](https://appium.io/docs/en/latest/intro/appium/) explains this client–server division.

| Component | Responsibility in this path |
|---|---|
| Python client | Describe element lookup, interaction, and screen inspection |
| Appium Server | Receive WebDriver requests and dispatch them to a driver |
| UiAutomator2 Driver and device components | Carry out Android automation |
| ADB | Device communication and supporting installation or launch operations |

Seeing a device in the connected-device list establishes part of the connection layer. A session, application launch, readable screen, and usable locator still have to follow.

HaTickets’ Mobile code uses a different entry: the [openatx `uiautomator2` Python library](https://github.com/openatx/uiautomator2), connecting through `u2.connect`. This removes the separate Appium Server layer from that path, while still relying on automation components on the Android device.

![Appium and Python uiautomator2 control paths](/images/ticket-reading/control-paths.svg)

*A schematic based on the implementations and official documentation. Both routes inspect and interact with the device; installation and port-forwarding details are omitted.*

That division also makes failures easier to locate. A missing device is a connection problem. A failed session points toward the server or driver setup. A working session that cannot find a button calls for inspecting the current screen and locator.

## Find the control, then understand the screen

Phone automation does not always begin with a screenshot and a vision model. Android UI Automator can use the UI hierarchy and accessible properties to locate controls. What it exposes depends on how the application builds its interface; custom-drawn areas may provide little useful structure. The [Android documentation](https://developer.android.com/training/testing/other-components/ui-automator) describes this cross-application UI testing capability.

This explains why the repositories contain several locator styles:

- **Resource IDs, text, and accessibility descriptions** identify a control and may tolerate small layout changes.
- **XPath or hierarchy relationships** narrow the search to a container or child element.
- **Coordinates** target a position with potentially less inspection overhead, but depend on the current layout.

One `ticket-purchase` helper first locates an element, reads its bounds, and clicks the center. That ties the position to a control found on the current screen. Reusing an old position is more fragile when a dialog, keyboard, or list change moves the target.

HaTickets adds an explicit page-probing layer. Its `PageProbe` first checks the current Android Activity—the active screen component—and inspects controls when needed. The workflow then chooses an action from the detected state.

A non-transactional settings example captures the idea:

```python
# Pseudocode illustrating the control order
page = inspect_screen()
if page.kind == "settings":
    find_button(label="Display").click()
    wait_until_screen_is("display_settings")
```

Compared with a fixed list of taps, this adds a useful diagnostic distinction: was the initial screen wrong, was the control missing, or did the expected transition fail to occur?

## Where the time goes

I also wanted to know whether these tools could act faster than a person. A function named “fast click” cannot establish that on its own.

An action sequence includes connection and session setup, repeated element searches, command transport, application loading, and result inspection. Reducing a `sleep` changes only part of that sequence.

The implementations contain different choices: shorter waits and coordinate gestures in `ticket-purchase`; page-probe caching, local retries, and step timing in HaTickets. To compare them, the starting and finishing conditions need to agree.

| Timing boundary | What it measures |
|---|---|
| Connection start to a usable session | Environment setup |
| One screen to a confirmed next screen | A UI transition or sequence |
| Sending a click command to its return | Command-call overhead |
| Start to confirmation of the final result | End-to-end completion |

These timings answer different questions. Waiting for the expected state after a transition can still be necessary. If a shorter wait merely reads the previous screen sooner, additional retries may consume the time it appeared to save.

I would first inspect whether the wait condition matches a meaningful screen state, then look for redundant reads. Removing a framework layer may reduce some call overhead. End-to-end speed also depends on application responses and how often the program checks them.

## What does a successful return mean?

One detail in the source was especially revealing.

In the `ticket-purchase` version I read, the final submission helper’s return value is not checked before the enclosing function returns `True`. Reaching the end of that function can therefore mean something different from completing the intended operation. This is a static observation about [the file’s control flow](https://github.com/WECENG/ticket-purchase/blob/master/damai_appium/damai_app_v2.py), rather than an order test.

HaTickets distinguishes outcomes such as probe readiness, arrival at a confirmation screen, and submission results. It checks the result before assigning an outcome, with a separate stopping branch when confirmation remains unknown.

That gives me another place to look when reading automation code: what does it inspect after clicking? If a return value establishes only that a command was sent, the caller should preserve that meaning. Web forms, uploads, and background tasks have the same distinction.

## What I took from each repository

| Repository | The part I focused on |
|---|---|
| `ticket-purchase` | Appium sessions, locators, waits, and a mobile action sequence |
| `HaTickets` | The Python uiautomator2 entry, page state, local recovery, and distinct outcomes |
| `damaihelper` | A Web console connected to task orchestration and logs; its README separates default dry-run behavior from real-world effectiveness |

My reading order is to follow the entry point into the device connection, trace one screen transition, and then follow the return value into the logs. That reveals how the program controls the phone and which assumptions still need device testing. A speed comparison becomes useful once those conditions and timing boundaries are explicit.
