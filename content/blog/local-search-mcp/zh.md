---
title: "给本地 Qwen 加一个搜索入口"
date: "2026-10-16"
updated: "2026-10-16"
language: "zh"
project: "local-search-mcp"
excerpt: "浏览器已经接上，模型却还是不爱搜索。我补了一个小 MCP，把找网页缩成一次调用，也碰到了“有结果，但没搜对”的问题。"
cover: "/images/local-search/search-results.svg"
coverAlt: "同一查询两次测试的结果摘录：Bing 为泛产品页，DuckDuckGo 为官方搜索文档"
tags: [MCP, Qwen Code, TypeScript]
draft: false
---

用本地 Qwen 时，我发现它遇到陌生问题，仍然经常留在本地反复尝试，不主动上网找资料。查配置才看见：当时内置搜索关着，只连了 Playwright。模型能操作浏览器，但一次搜索需要自己组织打开页面、输入关键词、读结果等动作。

我让 Codex 补了一个小的 TypeScript MCP 服务，用现成的 MCP SDK、Playwright 和 Cheerio，把这几步收成 `local_web_search`。没有修改 Qwen 的模型，也没有给它另外训练搜索能力。

## 搜索找链接，浏览器读正文

新工具接收查询词，返回标题、链接和摘要。底层读取搜索结果页的 HTML，复用 Playwright 的请求上下文，不必每次启动可见浏览器。

例如这样调用：

```json
{
  "query": "Qwen Code enable web search tool configuration",
  "limit": 5
}
```

我保留了原来的 Playwright MCP。搜索服务负责找到候选网页，Playwright 再打开具体页面，核对正文或做交互。两个工具承担的是不同的步骤。

这也是我当时问“MCP 还是 Skill”的原因：这里实际增加的是一个能被调用的工具；`QWEN.md` 里的规则再告诉模型，遇到需要查资料的问题先用它。这次没有给 Qwen 新装 Skill。[MCP 的工具概念](https://modelcontextprotocol.io/docs/learn/server-concepts)可以帮助区分这两层。

## 五条结果，不一定搜对了

初版的测试只检查“有没有返回结果”，很容易过。同一个配置查询，Bing 能返回 5 条 Qwen 产品页面，却没有回答怎样配置搜索。

![同一查询在两次测试中的搜索结果摘录](/images/local-search/search-results.svg)

*按当时保存的输出重新排版，左右是同一查询在修改前后的两次测试，各展示前两条。不是搜索引擎页面截图，也不是检索质量基准。*

后来加了一个粗略检查：指定了 `site:` 却没有对应网址，或者标题、摘要中的关键词覆盖太低，就改用 DuckDuckGo。返回结果同时写明实际引擎和回退原因，方便检查发生了什么。

这次配置查询回退后，第一条成了 Qwen Code 的官方 Web Search 文档，集成测试也确认了 MCP 能返回结构化结果、拒绝超出范围的参数。Qwen 的实际会话中还出现过主动选择搜索工具的调用。

不过，这个相关性判断只看字符串，仍然会看走眼。另一条报错查询就返回过“failed”的词条。因此工具只负责提供候选来源，正文还要打开看。模型会不会选择搜索、长会话会不会卡住，也不能用一次搜索成功来保证。

这个小工具最有用的地方，是把“去网上查一下”变成一个明确的调用入口。实现本身很小，后面更值得花时间检查的是：返回的网页，究竟有没有回答当前的问题。
