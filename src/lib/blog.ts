import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { BlogFrontmatter, BlogPost, BlogPostSummary } from "@/types/blog";
import type { Locale } from "./locale";
import { projects } from "@/content/projects";
import { sortProjectPosts } from "./project-order";
const directory = path.join(process.cwd(), "content/blog");
export function getPostBySlug(
  slug: string,
  locale: Locale = "en",
): BlogPost | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const filename = path.join(directory, slug, `${locale}.md`);
  if (!fs.existsSync(filename)) return null;
  const { data, content } = matter(fs.readFileSync(filename, "utf8"));
  const frontmatter = data as BlogFrontmatter;
  if (frontmatter.draft || frontmatter.language !== locale) return null;
  const characters = (content.match(/[\u3400-\u9fff]/g) || []).length;
  const words = content
    .replace(/[\u3400-\u9fff]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  const project = projects.find((p) => p.id === frontmatter.project);
  return {
    ...frontmatter,
    projectDate: project?.projectDate ?? null,
    projectTier: project?.tier ?? "secondary",
    projectPeriod: project?.period ?? "",
    projectPeriodZh: project?.periodZh ?? project?.period ?? "",
    slug,
    content,
    readingTimeMinutes: Math.max(1, Math.ceil(characters / 350 + words / 220)),
  };
}
export function getAllPosts(locale: Locale = "en"): BlogPostSummary[] {
  if (!fs.existsSync(directory)) return [];
  return sortProjectPosts(
    fs.readdirSync(directory, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => getPostBySlug(e.name, locale))
      .filter((p): p is BlogPost => p !== null),
  );
}
