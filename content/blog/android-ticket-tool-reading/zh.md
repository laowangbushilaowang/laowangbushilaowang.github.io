---
title: "票务工具阅读：Appium 怎样控制一台安卓手机"
date: "2026-10-16"
updated: "2026-10-16"
language: "zh"
project: "ticket-tool-research"
excerpt: "从几份开源票务工具追到 Android UI 自动化：电脑怎样找到手机上的按钮，为什么点击更快未必整段更快，以及程序该如何确认操作完成。"
tags: [Android, Automation, Appium, Code Reading]
draft: false
---

我最初看这些项目，是想弄明白演唱会代抢到底怎样工作。找到几份开源代码后，问题很快变得具体：我有安卓机，电脑上的 Python 程序怎么控制它？Appium 在中间负责什么？

当时拿来比较的是 [WECENG/ticket-purchase](https://github.com/WECENG/ticket-purchase) 和 [Guyungy/damaihelper](https://github.com/Guyungy/damaihelper)。后续资料里还有 [currycan/HaTickets](https://github.com/currycan/HaTickets)。这篇是一次工具选型和源码阅读，几套实现都来自各自的开源作者。

沿着代码看下去，我更感兴趣的是手机自动化本身：把页面上的一次操作交给程序，究竟需要哪些环节。

## Appium 在电脑和手机之间做什么

先看 `ticket-purchase` 的移动端。Python 里会创建一个 `webdriver.Remote`，指定 Android 和 UiAutomator2，然后请求一个自动化会话。

这里的 Remote 容易让人误解。它表示脚本通过 WebDriver 协议向服务端发指令，服务端完全可以就在同一台电脑上。Python 写“查找元素”“点击”，Appium Server 接收请求，再由 Android 驱动把这些请求交给手机端的自动化组件。[Appium 的原理说明](https://appium.io/docs/en/latest/intro/appium/)把客户端、服务端和平台驱动的职责分得很清楚。

几个经常一起出现的名字，各管一段：

| 组件 | 在这条链路里做什么 |
|---|---|
| Python 客户端 | 描述查找、点击、读取页面等步骤 |
| Appium Server | 接收 WebDriver 请求，交给对应驱动 |
| UiAutomator2 Driver 与设备端组件 | 把 Android 操作落到手机上 |
| ADB | 提供设备通信，以及辅助组件安装、启动等能力 |

所以，电脑能列出已连接设备，还只是连接层准备好了。后面仍要建立会话、打开应用、读取页面，并确认目标控件能够定位。

HaTickets 的 Mobile 代码走了另一条入口：使用 [openatx 的 `uiautomator2` Python 库](https://github.com/openatx/uiautomator2)，通过 `u2.connect` 连接设备。它省去了单独运行 Appium Server 的这一层，但仍然依赖 Android 设备端的自动化能力。

![Appium 与 Python uiautomator2 的控制链路](/images/ticket-reading/control-paths.svg)

*依据两套源码和官方文档整理的控制链路示意。两条路线的入口不同，都要在设备上完成页面读取和操作。图中省略了安装、端口转发等细节。*

读到这里，环境报错也比较容易分层：找不到设备，先看连接；建不了会话，看服务与驱动；会话已经建立却找不到按钮，再看页面和定位方式。没必要每次都把整个环境重装一遍。

## 脚本先要认出按钮和页面

手机自动化不一定要先截屏，再用视觉模型认图。Android 的 UI Automator 可以访问控件层级及其可访问属性，用这些信息定位和操作界面。具体能读到多少，取决于应用怎样构建界面；自绘区域也可能缺少有用的文本或控件属性。[Android 官方文档](https://developer.android.com/training/testing/other-components/ui-automator)介绍了这类跨应用 UI 测试能力。

这也解释了代码里为什么会同时出现好几种定位方式：

- **资源 ID、文本、可访问描述**：描述“要找哪个控件”，页面小幅移动时仍可能有效。
- **XPath 或控件层级关系**：在容器里继续找子元素，适合需要限定范围的地方。
- **坐标**：直接点一个位置，读取开销可以更少，但依赖当前布局。

`ticket-purchase` 的一个做法是先找到元素，再读取边界，点击中心坐标。它至少把坐标与这一次查到的控件联系起来。若直接复用上一次页面的坐标，弹窗、键盘或列表变化都可能让落点变成别的东西。

我觉得更有用的一层是先识别页面状态。HaTickets 把页面探测单独做成 `PageProbe`：先看当前 Activity，也就是 Android 当前显示的界面组件；必要时再检查关键控件。业务流程根据探测结果决定下一步。

用一个非交易的设置页说明，这种写法大致是：

```python
# 解释控制顺序的伪代码
page = inspect_screen()
if page.kind == "settings":
    find_button(label="Display").click()
    wait_until_screen_is("display_settings")
```

这比记录一串固定点击位置多做了一步判断，也方便解释失败：是原页面没有认对、控件没有找到，还是点击后没有进入预期页面。

## 等待、查找与点击：时间花在哪里

我最初也关心这些工具能不能比人更快。但只看“快速点击”这样的函数名，回答不了这个问题。

一次操作链里，有建立连接和会话的准备时间，也有重复查找控件、传递指令、等待应用加载和读取结果的时间。把某个 `sleep` 调小，只改变其中一项。

`ticket-purchase` 的源码会减少部分等待、查到元素后执行坐标手势；HaTickets 则有页面探测缓存、局部重试和分步骤计时。这些都是减少开销的实现选择。要比较它们，需要先统一起点和终点：

| 计时范围 | 能回答什么 |
|---|---|
| 建立连接到会话可用 | 环境准备有多慢 |
| 某个页面到下一个页面确认出现 | 一段 UI 流程花了多久 |
| 点击命令发送到返回 | 指令调用本身的开销 |
| 从开始到最终结果得到确认 | 整段流程是否更快完成 |

这几种时间不能互相替代。尤其在页面切换后，等待目标状态出现仍然有作用。去掉等待，如果只是更早读取到旧页面，程序可能会用更多重试把省下的时间花回去。

因此我会先看等待条件是否对应真实页面，再看有没有反复读取同一份信息。框架少一层，可能省去一些调用开销；完整流程的速度还取决于应用响应和检查次数，需要单独测。

## 怎样判断一轮操作完成了

源码里还有一处比点击速度更值得看。

我读到的 `ticket-purchase` 版本，在最后一步调用提交按钮的 helper 后，没有继续检查这个调用的返回值，随后就返回 `True`。这意味着函数走到末尾，与界面或服务端实际完成了什么，可能不是同一件事。这个判断来自[该文件的控制流](https://github.com/WECENG/ticket-purchase/blob/master/damai_appium/damai_app_v2.py)，不是一次实际订单测试。

HaTickets 则把探测就绪、到达确认页、提交结果等情况分开，并通过结果检查来决定结局。确认结果未知时，也有单独的停止分支。

这让我读自动化项目时多看一个地方：点击以后，它读了什么？一个返回值如果只说明“指令发出去了”，上层就不该把它解释成“业务已经成功”。同样的问题也会出现在网页表单、文件上传和后台任务里。

## 这几份项目分别值得看什么

重新对照这些项目，我会沿着具体入口读，而不只比较它们列了多少功能：

| 项目 | 这次阅读的重点 |
|---|---|
| `ticket-purchase` | Appium 会话、控件定位、等待和点击如何组成一段移动端流程 |
| `HaTickets` | Python uiautomator2 入口、页面状态、局部恢复和不同运行结局 |
| `damaihelper` | Web 控制台怎样连接任务编排和日志；README 明确区分默认 dry-run 与实际效果 |

读这类代码，我会先从程序入口追到设备连接，再找一段页面切换，最后看返回值怎样传到日志。这样既能知道它怎样控制手机，也能看出哪些地方仍需要拿真实设备验证。至于是否更快、能否完成某个实际任务，要等这些条件和计时范围都明确以后再比较。
