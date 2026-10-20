import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
const source = ts.transpileModule(fs.readFileSync("src/lib/project-order.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { sortProjects, sortProjectPosts } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);

test("older work stays older even when its article was published later", () => {
  const posts = [
    { project: "older", slug: "older-work-new-post", projectDate: "2021-02", date: "2026-10-20" },
    { project: "recent", slug: "recent-work-old-post", projectDate: "2026-09", date: "2026-10-01" },
  ];
  assert.deepEqual(sortProjectPosts(posts).map((p) => p.slug), ["recent-work-old-post", "older-work-new-post"]);
  assert.equal(posts[0].slug, "older-work-new-post");
});

test("partial dates and unknown dates sort consistently across languages and groups", () => {
  const projects = [
    { id: "unknown", projectDate: null, tier: "primary" },
    { id: "year", projectDate: "2025", tier: "secondary" },
    { id: "month", projectDate: "2025-06", tier: "primary" },
    { id: "day", projectDate: "2025-06-23", tier: "secondary" },
    { id: "new", projectDate: "2026-01", tier: "primary" },
  ];
  const sorted = sortProjects(projects);
  assert.deepEqual(sorted.map((p) => p.id), ["new", "day", "month", "year", "unknown"]);
  assert.deepEqual(sorted.filter((p) => p.tier === "primary").map((p) => p.id), ["new", "month", "unknown"]);
  assert.deepEqual(sorted.filter((p) => p.tier === "secondary").map((p) => p.id), ["day", "year"]);
});


test("projects and posts keep the same tie order within a month", () => {
  const projects = [{ id: "beta", projectDate: "2026-02" }, { id: "alpha", projectDate: "2026-02" }];
  const posts = [{ project: "beta", slug: "a-note", projectDate: "2026-02" }, { project: "alpha", slug: "z-note", projectDate: "2026-02" }];
  assert.deepEqual(sortProjectPosts(posts).map((p) => p.project), sortProjects(projects).map((p) => p.id));
});
