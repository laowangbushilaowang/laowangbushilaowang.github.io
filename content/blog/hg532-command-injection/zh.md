---
title: HG532：升级接口里的命令注入
date: '2026-10-16'
publishedAt: '2026-10-16T12:35:29Z'
updated: '2026-10-16'
language: zh
translationKey: hg532-command-injection
project: hg532-security-notes
excerpt: 围绕一份 HG532 固件和两份实验脚本，解释 URL 为什么会被当作命令，以及读脚本时应该核对什么。
tags: [Security, Firmware, Reading notes]
---

一个叫“升级”的接口，为什么能执行原本不属于升级流程的命令？HG532 的 CVE-2017-17215 是个很直观的例子：请求提供的是 URL，设备处理它时，却让其中的字符参与了 shell 解释。

2024 年，我把一份 HG532 固件和两份实验脚本放进了 [cyberproject 仓库](https://github.com/laowangbushilaowang/cyberproject)。这里围绕这些材料整理一则短笔记。漏洞由 Check Point 发现并披露；我关心的是它为什么发生，以及怎样读懂一份声称能触发它的脚本。

## URL 在哪里变成了命令

接口原本负责固件升级。客户端用 SOAP，也就是 XML 格式的消息，提交升级所需的信息。其中 `NewStatusURL` 和 `NewDownloadURL` 是两个 URL 字段。

[Check Point 的披露](https://research.checkpoint.com/2017/good-zero-day-skiddie/)说明，这些字段允许 shell 元字符进入命令执行过程。按披露整理，问题出在下面这条处理链中：

```text
SOAP 请求里的 URL
    ↓
升级接口读取字段
    ↓
字段内容进入 shell 命令
    ↓
部分字符被作为语法解释
```

同一段文字，作为 URL 参数时是数据，交给 shell 后却可能有另一种含义。XML 格式正确，也不能保证其中的数据适合拿去拼命令。

认证也解决不了这个问题。认证决定谁能调用接口，接口仍要保证输入不会改变程序原定的执行方式。[华为公告](https://www.huawei.com/cn/psirt/security-notices/2017/huawei-sn-20171130-01-hg532-cn)明确描述了认证后的攻击者这一前提；它涉及受影响版本，不能扩展成所有 HG532 都有同样的问题。

## 读脚本，要跟到实际发出的内容

第一份脚本的结构很短：接收输入，填进 XML，发出 HTTP 请求，再打印响应状态和正文。沿着这个顺序读，很快就能分清哪些内容来自输入，哪些是固定模板。

另一份脚本有个容易漏掉的字符串问题：前面定义了命令变量，后面的 XML 模板却保留了字面量拼接文本，并没有把那个变量填进去。把网络请求先放在一边，用一个普通例子就能看懂这种差别：

```python
name = "notes"
f"<name>{name}</name>"
# <name>notes</name>

f'<name>" + name + "</name>'
# <name>" + name + "</name>
```

外面写了 `f`，字符串里的变量也要通过花括号替换。只看前面定义的变量，很容易以为程序会发送它；顺着数据构造往下读，才知道请求里实际装了什么。

还要把 HTTP 响应和设备上的执行效果分开。状态码、响应正文可以说明请求得到了怎样的处理；要确认设备执行了什么，还需要设备侧的观察。脚本打印了一行“正在尝试”，本身并不回答这个问题。

读这类脚本，我会先把请求体展开看清，再判断它应该在设备上产生什么效果。
