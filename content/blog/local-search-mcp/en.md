---
title: "A search entry point for local Qwen"
date: "2026-10-16"
updated: "2026-10-16"
language: "en"
project: "local-search-mcp"
excerpt: "My local model had browser access but rarely searched. A small MCP made discovery one call—and exposed why returning five results was a weak test."
cover: "/images/local-search/search-results.svg"
coverAlt: "Two saved tests of the same query: generic Bing product pages and DuckDuckGo links to official search documentation"
tags: [MCP, Qwen Code, TypeScript]
draft: false
---

My local Qwen setup often kept trying things locally instead of looking up unfamiliar problems. Its configuration explained part of that behavior: built-in search was disabled, while Playwright was connected. The model could operate a browser, but searching still required it to assemble a sequence of browser actions.

I asked Codex to build a small TypeScript MCP service using the existing MCP SDK, Playwright and Cheerio. It exposed that task as `local_web_search`. This was a tool integration, without changing or training the model.

## Find a URL, then read the page

The tool accepts a query and returns titles, links and snippets. It reads search-result HTML through a reusable Playwright request context, without launching a visible browser for every query.

A call looks like this:

```json
{
  "query": "Qwen Code enable web search tool configuration",
  "limit": 5
}
```

I kept the original Playwright MCP too. The search service finds candidate pages; Playwright opens a chosen page to inspect its content or interact with it.

That distinction also answered my question at the time: had we added an MCP or a Skill? We had added a callable tool, then used `QWEN.md` rules to tell the model when to select it. No new Qwen Skill was installed. The [MCP server concepts](https://modelcontextprotocol.io/docs/learn/server-concepts) describe this tool layer.

## Five results can still be the wrong results

The first integration check required only a nonempty result list. That was easy to satisfy. A query about configuring Qwen Code search returned five generic Qwen product pages.

![Saved results from two tests of the same query](/images/local-search/search-results.svg)

*Reformatted from saved outputs: the same query in two tests before and after the change, showing the first two results from each. This is not a search-engine screenshot or a retrieval benchmark.*

The revised service checked requested `site:` strings and rough keyword coverage in the returned material. If Bing failed those checks, it tried DuckDuckGo. The response identified the engine actually used and explained the fallback.

For this query, the fallback returned Qwen Code's official Web Search documentation first. Integration tests also exercised structured MCP output and rejection of out-of-range inputs. A real Qwen session selected the search tool during testing.

The relevance check was still a string heuristic. Another query containing an error message returned dictionary-like pages for “failed.” Candidate links still needed inspection. Nor did a successful request establish that the model would consistently choose search or avoid getting stuck in a long conversation.

The useful change was giving “look this up” an obvious callable entry point. The implementation was small. Checking whether the returned pages actually addressed the question remained the more interesting part.
