import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { BlogFrontmatter, BlogPost, BlogPostSummary } from "@/types/blog";

const blogDirectory = path.join(process.cwd(), "content/blog");

function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function getAllPosts(): BlogPostSummary[] {
  if (!fs.existsSync(blogDirectory)) {
    return [];
  }

  const files = fs
    .readdirSync(blogDirectory)
    .filter((file) => file.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b));

  const posts = files
    .map((file) => {
      const fullPath = path.join(blogDirectory, file);
      const source = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(source);
      const frontmatter = data as BlogFrontmatter;
      const slug = file.replace(/\.md$/, "");

      return {
        slug,
        title: frontmatter.title,
        date: frontmatter.date,
        excerpt: frontmatter.excerpt,
        tags: frontmatter.tags,
        draft: frontmatter.draft,
        readingTimeMinutes: estimateReadingTime(content)
      };
    })
    .filter((post) => !post.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

export function getPostBySlug(slug: string): BlogPost | null {
  const fullPath = path.join(blogDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const source = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(source);
  const frontmatter = data as BlogFrontmatter;

  return {
    slug,
    title: frontmatter.title,
    date: frontmatter.date,
    excerpt: frontmatter.excerpt,
    tags: frontmatter.tags,
    draft: frontmatter.draft,
    readingTimeMinutes: estimateReadingTime(content),
    content
  };
}
