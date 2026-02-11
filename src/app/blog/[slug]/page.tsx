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
    <Container className="py-8 md:py-14">
      <article className="mx-auto max-w-3xl rounded-2xl border border-line/70 bg-paper/90 p-5 shadow-card sm:p-6 md:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{formatDate(post.date)}</p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-accent sm:text-4xl md:mt-4 md:text-5xl">{post.title}</h1>
        <p className="mt-4 text-sm text-muted">{post.readingTimeMinutes} min read</p>

        <div
          className="article-content prose prose-slate mt-8 max-w-none text-base leading-relaxed prose-headings:font-display prose-headings:text-accent prose-p:text-muted prose-a:text-accent"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </Container>
  );
}
