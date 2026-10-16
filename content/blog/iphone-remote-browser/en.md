---
title: An iPhone workbench for a small server
excerpt: Even an account query was running out of memory. Separating lightweight requests, browser work, and phone interaction—and withdrawing one paging experiment.
language: en
date: "2026-10-09"
publishedAt: "2026-10-09T13:00:43Z"
updated: "2026-10-16"
translationKey: iphone-remote-browser
project: private-iphone-workbench
tags: [SwiftUI, Linux, Remote browser]
---

I wanted to move work that depended on my computer onto a server, then use an iPhone to inspect orders and manage tasks. The server had 2GB of RAM. Several browsers running together were an obvious concern.

The problem became concrete when even an account query reported insufficient memory. A connection and a working button were only the beginning. What was consuming the memory? Why did a query need an entire website? If slower storage was acceptable, why not use swap?

Those questions shaped this private app. I supplied the workflow, interface requirements, and feedback from use; Codex helped implement and check the changes. The native interface uses SwiftUI, with Apple's [SwiftNIO SSH](https://github.com/apple/swift-nio-ssh) underneath the SSH connection.

## Keep execution on the server

The phone needed to show orders and account information, edit parameters, and display progress. A remote browser was useful when I actually needed the original website.

The early interface bundled too much into selecting parameters and starting a complete workflow. It was awkward when I only wanted a query or needed to archive something after the main task. I asked for pages arranged around how I used the desktop workbench: account and session, inputs and parameters, execution, follow-up work, and order management. Common controls stay visible; less frequent ones can fold away.

The phone and Mac workbench use the same cloud task queue. Once the server accepts a task, leaving the phone screen does not end it. Returning reads that task's state. A lost response should recover the original request rather than create another one.

```text
iPhone / Mac: select, submit, inspect progress
                         ↓
Server: save task → queue → execute → save result
                         ↓
Attach the phone to an existing browser when human input is needed
```

*Responsibilities at a glance. The phone view and server task have separate lifetimes.*

The phone tells me what is happening and lets me choose the next action. Work that must keep running belongs on the server.

## Avoid starting a browser for a query

I initially asked about compression and swap. There was also a more direct application change available: stop launching a full browser where a request would do.

An account query needs a result. Earlier paths could start a browser, load a complete homepage, and make the request from there. The chat interface, scripts, and rendering state came along for a query that did not need them.

The implementation developed two paths:

- **Ordinary queries and management operations** reuse the desktop workbench's HTTPS modules and display structured results in native views.
- **Login, session recovery, or interaction with the website** uses the browser associated with that account.

There was an intermediate approach too: retain the account's browser context but release the full homepage after a successful query. A lightweight page helps paths that still require that context. A direct request avoids starting Chrome for an ordinary query altogether.

This addresses a different cost from reducing screenshot quality. Smaller images can reduce encoding and transfer work while leaving the full browser resident on the server.

## Let heavy tasks take turns

The remaining browser work needs a budget.

The cloud worker processes queued tasks serially. Before another kind of heavy operation starts, it parks the browser that is no longer needed and checks available memory. Parking stops the process while retaining its profile: the local browser data used when it next starts.

Keeping that data does not require keeping the process alive. It avoids preparing a completely new browser environment each time, while allowing its memory to be reclaimed. The website can still expire a session; a saved profile is no promise of permanent login.

Some limits are explicit in service configuration and startup logic:

| Component | Configuration or rule | Purpose |
|---|---|---|
| Resident browser service | 600 MiB hard memory limit | Bound the service and its browser processes |
| Cloud task worker | 900 MiB hard memory limit | Leave room for other services |
| New payment-task browser | At least 1,000 MiB available after parking the previous browser | Reserve cold-start headroom; resuming an existing window has separate checks |

*Configuration and admission conditions, rather than measured process footprints.*

I also asked for window management on the phone: show retained windows and the task occupying them, attach to an original window, or close it to release memory. An insufficient-memory message is much less useful when it leaves me unable to see what can be closed.

Leaving an image, parking a browser, and signing out are separate actions. Closing a phone view must not casually terminate the server window belonging to a running task.

## One swap approach was withdrawn

My reasoning was simple: I could accept slower access if disk space helped the small server cope.

Disk swap stores inactive pages on disk. Zswap first compresses pages into a RAM cache to reduce some disk I/O, consuming CPU and RAM itself. The [kernel's zswap documentation](https://docs.kernel.org/admin-guide/mm/zswap.html) explains this relationship. A compression cache therefore has a cost; repeated swapping of actively used data can still make interaction worse.

The project acquired an encrypted paging prototype: a regular file, a loop device, then dm-crypt and swap, alongside zswap. That storage stack was later reviewed and found to carry a low-memory deadlock risk. Writing pages out could require filesystem allocation while the machine was already trying to reclaim memory.

A [Linux Block discussion](https://www.spinics.net/lists/linux-block/msg133309.html) explains that particular dependency. It does not make ordinary direct swap files equivalent to the loop-plus-encryption stack. The project withdrew activation of the prototype, retaining status inspection and guarded recovery. I do not count it as a successful capacity upgrade.

The worker's `MemorySwapMax=2G` also specifies an allowance; it does not create swap storage. A backing device, its available space, and a process limit are separate things. The [cgroup documentation](https://docs.kernel.org/admin-guide/cgroup-v2.html) accounts for memory and swap separately.

I kept the application changes: fewer browser launches, serial execution, window reuse, and startup checks. Paging can help with pressure, but its backing storage needs separate scrutiny. Adding gigabytes of swap to 2GB of RAM does not turn them into equally fast memory.

## Use the remote image where it is needed

Ordinary forms use native controls. The remote image handles interaction with the original site. This native login form comes from early development:

![Native login form in the private iPhone workbench](/images/projects/private-iphone-workbench/native-login-form.webp)

*Actual version 1.0 simulator UI with a test email and example password, cropped and compressed. It illustrates the form, not a successful login or the current source version.*

Remote interaction is a send-action, capture-image, display loop. I found dragging difficult when the image lagged behind my finger. The implementation later reused an SSH channel and retained only the latest unsent movement position. Release remains a separate event, so the server does not keep replaying old movements after the finger lifts. Zoomed images also need image-local coordinates mapped back to the browser.

Those changes leave capture in the loop. One physical-device diagnostic recorded frame retrievals of 1,011 ms and 2,459 ms through the two paths, once each. It does not establish a speedup. Dropping intermediate movement points is also unsuitable for operations such as drawing, where the path itself matters.

Native views need interaction testing too. I encountered an order list that loaded but crashed when I opened its detail view; a successful JSON request could not reveal that problem. The source later added type-erasure boundaries around its paged views. A successful build, a working simulator screen, and a usable installation on my phone still require separate checks.

The app's purpose is to let me find a task, understand its progress, and manage the windows it occupies from my phone. The current source contains these divisions and resource rules. Smooth physical-device dragging, sustained operation, and complete business workflows still need their own acceptance checks.
