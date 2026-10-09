import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
export function validateContent(root) {
  const errors = [];
  const projects = JSON.parse(
    fs.readFileSync(path.join(root, "content/projects.json"), "utf8"),
  );
  const ids = new Set(projects.map((p) => p.id));
  if (ids.size !== projects.length) errors.push("Duplicate project id");
  function asset(url, where) {
    if (!url?.startsWith("/") || !fs.existsSync(path.join(root, "public", url)))
      errors.push(`${where}: missing public asset ${url}`);
  }
  projects.forEach((p) => {
    if (p.cover) asset(p.cover, p.id);
  });
  const directory = path.join(root, "content/blog");
  const published = new Set();
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      if (
        entry.name.endsWith(".md") &&
        !matter(fs.readFileSync(path.join(directory, entry.name), "utf8")).data
          .draft
      )
        errors.push(`Legacy flat post must stay draft: ${entry.name}`);
      continue;
    }
    const posts = ["en", "zh"].map((locale) => {
      const file = path.join(directory, entry.name, `${locale}.md`);
      return fs.existsSync(file) ? matter(fs.readFileSync(file, "utf8")) : null;
    });
    if (posts.every((p) => !p || p.data.draft)) continue;
    if (posts.some((p) => !p || p.data.draft))
      errors.push(`${entry.name}: missing published bilingual pair`);
    posts.forEach((post, index) => {
      if (!post || post.data.draft) return;
      const locale = ["en", "zh"][index],
        data = post.data,
        where = `${entry.name}/${locale}`;
      for (const field of [
        "title",
        "excerpt",
        "date",
        "updated",
        "language",
        "project",
      ])
        if (typeof data[field] !== "string" || !data[field].trim())
          errors.push(`${where}: missing ${field}`);
      if (data.language !== locale) errors.push(`${where}: wrong language`);
      if (!ids.has(data.project)) errors.push(`${where}: unknown project`);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(data.date) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(data.updated) ||
        data.updated < data.date
      )
        errors.push(`${where}: invalid dates`);
      if (data.publishedAt !== undefined &&
          (typeof data.publishedAt !== "string" ||
           !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(data.publishedAt) ||
           !Number.isFinite(Date.parse(data.publishedAt)) ||
           data.publishedAt.slice(0, 10) !== data.date))
        errors.push(`${where}: invalid publishedAt`);
      if (data.cover) {
        asset(data.cover, where);
        if (!data.coverAlt) errors.push(`${where}: missing coverAlt`);
      }
      for (const match of post.content.matchAll(
        /!\[([^\]]*)\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g,
      )) {
        if (!match[1]) errors.push(`${where}: empty image alt`);
        asset(match[2], where);
      }
      published.add(entry.name);
    });
    if (posts[0] && posts[1])
      for (const key of ["date", "publishedAt", "updated", "project", "cover"])
        if (posts[0].data[key] !== posts[1].data[key])
          errors.push(`${entry.name}: inconsistent ${key}`);
  }
  for (const p of projects)
    if (p.article && !published.has(p.article))
      errors.push(`${p.id}: article is not published`);
  return errors;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = validateContent(process.cwd());
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  console.log(
    "Content passed: bilingual pairs, metadata, project links, draft policy, and image assets.",
  );
}
