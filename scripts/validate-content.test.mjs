import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { validateContent } from "./validate-content.mjs";
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-content-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const dir of ["content/blog/note", "public/images"])
    fs.mkdirSync(path.join(root, dir), { recursive: true });
  fs.writeFileSync(path.join(root, "public/images/cover.svg"), "<svg/>");
  fs.writeFileSync(
    path.join(root, "content/projects.json"),
    JSON.stringify([
      { id: "project", cover: "/images/cover.svg", article: "note" },
    ]),
  );
  for (const lang of ["en", "zh"])
    fs.writeFileSync(
      path.join(root, `content/blog/note/${lang}.md`),
      `---\ntitle: Example\nexcerpt: Example\ndate: "2026-10-09"\nupdated: "2026-10-09"\nlanguage: ${lang}\nproject: project\ncover: /images/cover.svg\ncoverAlt: A diagram\n---\nText`,
    );
  return root;
}
test("accepts a complete pair", (t) =>
  assert.deepEqual(validateContent(fixture(t)), []));
test("rejects a missing translation", (t) => {
  const root = fixture(t);
  fs.unlinkSync(path.join(root, "content/blog/note/zh.md"));
  assert.match(validateContent(root).join(" "), /bilingual pair/);
});
test("rejects a public article whose counterpart is draft", (t) => {
  const root = fixture(t),
    file = path.join(root, "content/blog/note/zh.md");
  fs.writeFileSync(
    file,
    fs.readFileSync(file, "utf8").replace("---\n", "---\ndraft: true\n"),
  );
  assert.match(validateContent(root).join(" "), /bilingual pair/);
});
test("rejects broken images and unknown project associations", (t) => {
  const root = fixture(t),
    file = path.join(root, "content/blog/note/en.md");
  fs.writeFileSync(
    file,
    fs
      .readFileSync(file, "utf8")
      .replace("project: project", "project: nonexistent") +
      "\n![diagram](/images/missing.svg)",
  );
  const errors = validateContent(root).join(" ");
  assert.match(errors, /unknown project/);
  assert.match(errors, /missing public asset/);
});
test("rejects divergent shared facts in a translation", (t) => {
  const root = fixture(t),
    file = path.join(root, "content/blog/note/zh.md");
  fs.writeFileSync(
    file,
    fs
      .readFileSync(file, "utf8")
      .replace('updated: "2026-10-09"', 'updated: "2026-10-10"'),
  );
  assert.match(validateContent(root).join(" "), /inconsistent updated/);
});

test("publication time is optional, valid, and shared by translations", (t) => {
  const root = fixture(t);
  const en = path.join(root, "content/blog/note/en.md");
  const zh = path.join(root, "content/blog/note/zh.md");
  const stamp = 'publishedAt: "2026-10-09T13:00:43Z"\n';
  for (const file of [en, zh]) {
    fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("---\n", "---\n" + stamp));
  }
  assert.deepEqual(validateContent(root), []);
  fs.writeFileSync(zh, fs.readFileSync(zh, "utf8").replace("13:00:43", "13:01:43"));
  assert.match(validateContent(root).join(" "), /inconsistent publishedAt/);
  fs.writeFileSync(en, fs.readFileSync(en, "utf8").replace("2026-10-09T13:00:43Z", "invalid"));
  assert.match(validateContent(root).join(" "), /invalid publishedAt/);
});
