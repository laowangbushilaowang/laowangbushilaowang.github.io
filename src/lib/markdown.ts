import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import type { Element, Root, RootContent } from "hast";
import type { TocItem } from "@/types/blog";
function plain(node: RootContent): string {
  return node.type === "text"
    ? node.value
    : "children" in node
      ? node.children.map(plain).join("")
      : "";
}
export async function renderMarkdown(markdown: string) {
  const toc: TocItem[] = [];
  const file = await remark()
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeHighlight)
    .use(rehypeKatex)
    .use(() => (tree: Root) => {
      function walk(parent: Root | Element) {
        parent.children.forEach((node, index) => {
          if (node.type !== "element") return;
          if (/^h[23]$/.test(node.tagName))
            toc.push({
              id: String(node.properties.id),
              text: plain(node),
              depth: Number(node.tagName[1]),
            });
          if (
            node.tagName === "p" &&
            node.children.length === 1 &&
            node.children[0].type === "element" &&
            node.children[0].tagName === "img"
          ) {
            const img = node.children[0];
            const caption = img.properties.title;
            delete img.properties.title;
            img.properties.loading = "lazy";
            img.properties.decoding = "async";
            parent.children[index] = {
              type: "element",
              tagName: "figure",
              properties: {},
              children: [
                img,
                ...(caption
                  ? [
                      {
                        type: "element" as const,
                        tagName: "figcaption",
                        properties: {},
                        children: [
                          { type: "text" as const, value: String(caption) },
                        ],
                      },
                    ]
                  : []),
              ],
            };
          } else walk(node);
        });
      }
      walk(tree);
    })
    .use(rehypeStringify)
    .process(markdown);
  return { html: String(file), toc };
}
export async function markdownToHtml(markdown: string) {
  return (await renderMarkdown(markdown)).html;
}
