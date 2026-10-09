import fs from "node:fs";
import path from "node:path";
const root = path.resolve("out");
const errors = [];
let pages = 0;
function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
    );
}
for (const file of walk(root).filter((p) => p.endsWith(".html"))) {
  pages++;
  const html = fs.readFileSync(file, "utf8");
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = match[1].replaceAll("&amp;", "&");
    if (/^(?:https?:|mailto:|tel:|data:|#)/.test(url)) continue;
    const bare = decodeURIComponent(url.split(/[?#]/)[0]);
    if (!bare) continue;
    const target = bare.startsWith("/")
      ? path.join(root, bare)
      : path.resolve(path.dirname(file), bare);
    if (
      !fs.existsSync(target) &&
      !fs.existsSync(path.join(target, "index.html"))
    )
      errors.push(`${path.relative(root, file)}: ${url}`);
  }
}
for (const old of ["bridging-ai-and-biomedicine", "research-notes-2025"])
  if (fs.existsSync(path.join(root, "blog", old)))
    errors.push(`Draft exported: ${old}`);
if (errors.length) {
  console.error([...new Set(errors)].join("\n"));
  process.exit(1);
}
console.log(
  `Static export passed: ${pages} HTML pages, local links/assets, and removed generic posts.`,
);
