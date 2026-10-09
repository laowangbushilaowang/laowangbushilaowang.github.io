---
title: "Touch feedback for a remote browser on iPhone"
excerpt: "The input-to-image loop behind a private SwiftUI client: connection reuse, stale pointer positions, coordinate mapping, and browser sessions that outlive the phone screen."
language: "en"
date: "2026-10-09"
publishedAt: "2026-10-09T13:00:43Z"
updated: "2026-10-09"
project: "private-iphone-workbench"
tags: ["SwiftUI", "SSH", "Remote browser"]
---

I could see the remote login page on my iPhone, but dragging a control was still difficult. My finger moved ahead of the image. When the next screenshot arrived, I had to work out where the previous movement had ended.

A remote browser needs a short feedback loop: send a position, let the page respond, and bring the new image back. Forwarding clicks and periodically refreshing screenshots can produce a working connection without producing an accurate drag. My private iPhone workbench made that difference hard to miss.

The app is a mobile front end for my local workbench. SwiftUI handles ordinary records, task progress, and parameters; a remote browser view appears when I need to interact with the original website. I set the workflow and interaction requirements and reported problems from use. Codex helped implement and check the changes. This post explains the touch path, including a timing result that did not establish a performance improvement.

## What a movement waits for

The phone displays a screenshot from remote Chrome. SwiftUI reads a gesture position and sends a request over SSH to a fixed gateway. The gateway forwards it to a browser controller, which dispatches a mouse event through Chrome DevTools Protocol, captures a screenshot, and sends JPEG data back to the app.

A movement therefore includes input transport, browser execution, image capture and encoding, return transport, and local display. The early implementation also opened a new SSH connection for every movement and closed it after the response. A drag repeatedly exercised that single-request path.

I wanted visible feedback during the drag, rather than a final image after release. The revised implementation keeps an authenticated SSH connection and command channel while the interaction screen is open. Requests and responses are newline-delimited JSON. The channel closes when it is no longer needed. Apple's [SwiftNIO SSH](https://github.com/apple/swift-nio-ssh) supplies the SSH building blocks; the app implements its request handling and lifecycle around them.

This persistent channel is not a continuous video stream. Each pointer request still waits for a screenshot before the next movement can be processed. Reuse removes repeated connection setup and gateway-command startup. It leaves image capture in the loop.

## Reuse did not make the image instantly responsive

A device diagnostic from October 9, 2026 contains one complete timing sample:

| Measurement | Time |
| --- | ---: |
| Fetch a frame through the single-request, fresh-connection path | 1,011 ms |
| Open the persistent browser connection and channel | 96 ms |
| Fetch one frame through that connection | 2,459 ms |

The diagnostic ran those operations in order. The first two attempts to read its output found the browser unavailable; a later read retrieved the complete result above.

The slower frame used the reused connection. That does not show that reuse caused the slowdown. It also gives me no basis for subtracting two rows and advertising a speedup. These were single observations at different times, without controlled page state, server waiting, or network conditions.

They do make “it is all the SSH handshake” an inadequate explanation. The 96 ms measurement covers opening the persistent path, not an isolated handshake. Frame retrieval combines capture, gateway processing, and transfer. Those parts still need separate measurements. A better connection object gives the user no help while the picture remains two seconds behind.

The current capture code tries JPEG quality 52, falls back to 34 when the returned data is too large, and bounds its Base64 length. That limits frame size at the cost of clarity. It does not bound latency. [CDP screenshot capture](https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-captureScreenshot) is one stage in a longer request.

## Keeping the latest position

Queue every `onChanged` callback and a slow connection accumulates positions the finger has already left. The user can release while the server is still working through the middle of the drag. Returned images then describe earlier movements.

The app keeps a `pointerLatest` value instead. While a request is pending, gesture callbacks replace that value rather than append another send task. After receiving an image, the sender reads the latest position again.

This is the main branch of the actual Swift loop, with the initial press, error handling, and cleanup omitted:

```swift
while true {
    let next = pointerLatest ?? last
    if abs(next.x - last.x) + abs(next.y - last.y) >= 2 {
        let moved = try await control.pointerMove(next)
        browserFrame = scenePhase == .active ? moved : nil
        last = next
        continue
    }
    if pointerFinished {
        let released = try await control.pointerUp(next)
        browserFrame = scenePhase == .active ? released : nil
        return
    }
    try await Task.sleep(for: .milliseconds(50))
}
```

The loop waits briefly when the position differs by less than two browser-coordinate units. Otherwise, it sends the latest point. Release has a separate flag and still produces a release event. Coalescing movement does not discard the press and release that define the gesture.

This tradeoff has a limited use. For ordinary controls, avoiding playback of stale positions is useful. For handwriting, intermediate points are part of the content and cannot simply be dropped. Even a control can behave differently under a large coordinate jump; that needs testing on the actual page.

An interrupted drag creates another problem: the phone locks or disconnects while the server still considers the mouse pressed. Leaving the view or losing the active scene marks the gesture finished. The error path attempts a release. The browser controller also has a 20-second pointer timeout that attempts release and clears its state. That is a fallback after interruption, not a normal way to end a gesture.

Idle frame refresh checks the same busy and gesture state, so it does not launch another periodic read during a drag. This reduces contention between two uses of the channel. Movement requests still wait for images, so the slow part of the feedback loop remains.

## Coordinates after zooming

Displaying the image is only half of accurate input. Its size on the phone differs from the browser's coordinate space. Forwarding screen coordinates directly becomes increasingly wrong as the image is enlarged.

The app maps a gesture location within the image layer back to the screenshot. With proportional scaling, screenshot width `frame.width`, and displayed width `displayWidth`, the main calculation is:

```swift
let scale = Double(frame.width) / Double(displayWidth)
let x = min(Double(frame.width), max(0, Double(location.x) * scale))
let y = min(Double(frame.height), max(0, Double(location.y) * scale))
```

The important detail is where `location` comes from: the gesture layer on the image, rather than the whole screen. If the server captures only a horizontal region of the remote page, it adds that region's `viewOffset` back to x before dispatching the [CDP mouse event](https://chromedevtools.github.io/devtools-protocol/tot/Input/#method-dispatchMouseEvent).

Zoom introduces a gesture conflict too. Is the finger panning the enlarged image or dragging something inside the remote page? I kept an explicit switch between moving the image and operating the page. In pan mode, the remote-input overlay stops accepting touches and the ScrollView handles positioning. Switching back forwards gestures to the browser. It is an extra button, but the destination of the gesture is visible.

Ordinary text input does not need to fight remote pixels. Login details use a native form and are sent to fixed fields on the current page. Verification that needs me stays on the original website. This is a screenshot retained during development:

![Historical simulator screenshot of the native login form with a test email and enabled submit button](/images/projects/private-iphone-workbench/native-login-form.webp)

*Actual version 1.0 simulator UI with a test email and example password. The status bar and lower blank space were cropped, then the image was compressed. It shows form readiness, not a successful login or the current 1.6 interface.*

## Leaving the screen while retaining the session

The touch channel follows the phone view. The remote browser needs a different lifecycle.

“Done” leaves the image and releases the phone's interaction connection; a server task may continue. Releasing memory stops the remote browser process. Signing out changes authentication state. Early versions blurred those actions: restarting the controller could lose the login held in a temporary browser environment.

Later versions use a persistent browser profile. `parked` means the process is stopped while the profile remains available for reopening. That preserves local browser state; it cannot prevent the website from expiring a session.

The small server also needs to choose which browser gets its memory. The code can retain one idle, authenticated browser when available memory permits. Before another browser-based task starts, it parks the first browser and checks startup headroom. Returning to the app's home screen should not delete a login. Retaining a login should not require Chrome to hold memory indefinitely either.

The status probe distinguishes `closed`, `parked`, `login_required`, `verification_required`, `ready`, and `unknown`. In this interface, `ready` means the expected list page is visible. It does not pronounce the next task successful.

## What ran on the phone

Version confusion interrupted acceptance testing in this project. Reports that a new build had been installed conflicted with the controls I could actually see. I later asked to continue debugging in the simulator so I could keep using my phone. A build, an installation on a particular device, and a usable interaction need separate checks.

An earlier phone version read records through its device key. I saw the remote login page on the physical phone and reported the difficult taps and drags. The frame timings above also came from the phone. In the October 9 records reviewed for this post, version 1.6 was updated in the simulator while the phone retained an earlier build. The simulator's new layout was not evidence of a phone update.

For this review, seven gateway tests and one browser-status test file passed using temporary data and simulated pages. They cover bounded request parameters, omission of private content from ordinary lists, separate parsing of successive JSON lines, and keeping the system-Python gateway independent of portal dependencies. They do not measure touch responsiveness. The historical simulator build record establishes that build's completion.

My next change would separate input acknowledgement from frame retrieval: deliver coordinates promptly, control the image-update rate, and associate displayed frames with processed input. I would then repeat fresh and reused connection measurements on the same device and page, recording capture, transfer, and display separately. That comparison is still future work.

For the next acceptance test, I would use the same control: follow it while dragging, stop catching up after release, and reconnect without leaving a mouse button held down.
