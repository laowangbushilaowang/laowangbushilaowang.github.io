import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
const source = ts
  .transpileModule(fs.readFileSync("src/lib/markdown.ts", "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  })
  .outputText.replace(
    /from "([^"]+)"/g,
    (_, p) => `from "${import.meta.resolve(p)}"`,
  );
const { renderMarkdown } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);
test("renders math and highlighted code", async () => {
  const { html } = await renderMarkdown(
    "$$\nx^2 + y^2\n$$\n\n```python\nanswer = 42\n```",
  );
  assert.match(html, /katex-display/);
  assert.match(html, /language-python/);
  assert.match(html, /hljs-number/);
});
test("table of contents follows actual deduplicated heading IDs", async () => {
  const { html, toc } = await renderMarkdown(
    "## Same\n\n### Same\n\n## 中文标题",
  );
  assert.equal(toc[0].id, "same");
  assert.equal(toc[1].id, "same-1");
  for (const entry of toc) assert.ok(html.includes(`id="${entry.id}"`));
});
test("keeps captions beside figures and escapes untrusted HTML", async () => {
  const { html } = await renderMarkdown(
    '![Description](/images/example.svg "Schematic, not a result.")\n\n<script>alert(1)</script>\n\n```html\n<script>alert(1)</script>\n```',
  );
  assert.match(html, /<figure>/);
  assert.match(html, /<figcaption>Schematic, not a result\.<\/figcaption>/);
  assert.ok(!html.includes("<script>"));
  assert.match(html, /&#x3C;/);
});
