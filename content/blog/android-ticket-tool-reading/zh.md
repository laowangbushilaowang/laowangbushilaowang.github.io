---
title: "Appium 怎样控制安卓手机"
date: "2026-10-16"
updated: "2026-10-16"
language: "zh"
project: "ticket-tool-research"
excerpt: "读几份开源工具，弄明白电脑怎样控制安卓机，以及查到按钮、发出点击和确认结果之间的差别。"
tags: [Android, Automation, Appium, Code Reading]
draft: false
---

我最初想弄明白演唱会代抢怎样工作。比较 [WECENG/ticket-purchase](https://github.com/WECENG/ticket-purchase) 和 [Guyungy/damaihelper](https://github.com/Guyungy/damaihelper) 时，问题变得更具体：我有安卓机，电脑上的 Python 程序怎么控制它？后来又读了 [currycan/HaTickets](https://github.com/currycan/HaTickets)。这些都是第三方项目，这里记几条源码阅读的认识。

## Appium 在中间做什么

`ticket-purchase` 通过 `webdriver.Remote` 创建 Android 自动化会话，选择 UiAutomator2 驱动。Python 描述查找和点击，Appium Server 接收 WebDriver 请求，再由驱动与手机端组件完成操作。这里的 Remote 指协议调用，服务端可以就在同一台电脑上。[Appium 官方说明](https://appium.io/docs/en/latest/intro/appium/)

HaTickets 的移动端则用 Python [`uiautomator2`](https://github.com/openatx/uiautomator2) 库，通过 `u2.connect` 连接设备，不需要单独运行 Appium Server。

![Appium 与 Python uiautomator2 的控制链路](/images/ticket-reading/control-paths.svg)

*根据两套源码与官方文档整理的示意。入口不同，最终都要在设备上读取页面、执行操作。*

ADB 能找到手机，只说明连接准备好了。建不了会话，要查服务和驱动；会话已建立却找不到按钮，则要查页面和定位条件。把问题分到这一层，就不用遇到报错便重装所有东西。

## 找到按钮之后，还要看页面去了哪里

UI 自动化可以通过控件层级里的文本、资源 ID 和可访问描述定位，不一定需要截图识别；自绘区域能提供多少信息，则取决于应用的实现。[Android UI Automator 文档](https://developer.android.com/training/testing/other-components/ui-automator)

`ticket-purchase` 有先找到控件、读取边界、点击中心坐标的做法。HaTickets 另有 `PageProbe`，先判断当前 Activity，再按需看关键控件。前者解决点哪里，后者帮助判断现在处于哪个页面。

我觉得阅读时最值得多追一步的是返回值：一处流程调用最后一个点击 helper 后，没检查返回值就返回了 `True`。函数走完，并不能说明页面真的完成了目标动作。HaTickets 则把页面就绪、到达确认页和最终结果分开处理。

速度也一样。点击指令返回得快，不等于整段流程完成得快；少等几百毫秒，可能只是更早读到旧页面，再花时间重试。我没有做真机或实际购票测试，所以这次收获主要是怎样读控制链路：从连接到定位，再看到下一页的确认，而不是比较几个“快速点击”的函数名。
