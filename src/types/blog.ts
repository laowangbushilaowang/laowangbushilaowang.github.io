import type { Locale } from "@/lib/locale";
export type BlogFrontmatter = {
  title: string;
  date: string;
  updated: string;
  excerpt: string;
  language: Locale;
  project: string;
  cover?: string;
  coverAlt?: string;
  tags: string[];
  draft?: boolean;
};
export type BlogPostSummary = BlogFrontmatter & {
  slug: string;
  readingTimeMinutes: number;
};
export type BlogPost = BlogPostSummary & { content: string };
export type TocItem = { id: string; text: string; depth: number };
