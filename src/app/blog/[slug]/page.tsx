import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { markdownToHtml } from "@/lib/markdown";
import { formatDate } from "@/lib/format";

type BlogPostPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post not found"
    };
  }

  return {
    title: `${post.title} | Blog`,
    description: post.excerpt
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const html = await markdownToHtml(post.content);

  return (
    <Container className="py-10 md:py-16">
      <article className="mx-auto max-w-3xl rounded-2xl border border-line/70 bg-paper/90 p-8 shadow-card md:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{formatDate(post.date)}</p>
        <h1 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl">{post.title}</h1>
        <p className="mt-4 text-sm text-muted">{post.readingTimeMinutes} min read</p>

        <div
          className="article-content prose prose-slate mt-8 max-w-none text-base leading-relaxed prose-headings:font-display prose-headings:text-ink prose-p:text-muted prose-a:text-accent"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </Container>
  );
}
