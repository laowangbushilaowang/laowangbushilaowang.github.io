import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageIntro } from "@/components/motion/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import { Tag } from "@/components/ui/Tag";
import { getAllPosts } from "@/lib/blog";
import { formatDate } from "@/lib/format";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <Container className="space-y-16 py-10 md:py-16">
      <PageIntro
        eyebrow="Blog"
        title="Notes on AI, data, and research practice"
        description="A minimalist writing space for technical reflections and research process notes."
      />

      <section className="space-y-4 pb-4">
        {posts.length === 0 ? (
          <Reveal>
            <p className="rounded-xl border border-dashed border-line bg-paper/80 p-6 text-sm text-muted">
              No posts yet. Add markdown files in <code>content/blog</code> to publish new entries.
            </p>
          </Reveal>
        ) : (
          posts.map((post, idx) => (
            <Reveal key={post.slug} delay={idx * 0.04}>
              <article className="rounded-2xl border border-line/70 bg-paper/90 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{formatDate(post.date)}</p>
                <h2 className="mt-3 font-display text-3xl text-ink">
                  <Link href={`/blog/${post.slug}`} className="hover:text-accent">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {post.tags?.map((tag) => <Tag key={tag}>{tag}</Tag>)}
                  <span className="ml-auto text-xs font-medium text-muted">{post.readingTimeMinutes} min read</span>
                </div>
              </article>
            </Reveal>
          ))
        )}
      </section>
    </Container>
  );
}
