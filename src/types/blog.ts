export type BlogFrontmatter = {
  title: string;
  date: string;
  excerpt: string;
  tags?: string[];
  draft?: boolean;
};

export type BlogPostSummary = BlogFrontmatter & {
  slug: string;
  readingTimeMinutes: number;
};

export type BlogPost = BlogPostSummary & {
  content: string;
};
