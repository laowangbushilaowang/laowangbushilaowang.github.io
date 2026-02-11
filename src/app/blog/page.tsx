import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageIntro } from "@/components/motion/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import { Tag } from "@/components/ui/Tag";
import { LocalizedText } from "@/components/i18n/LocalizedText";
import { getAllPosts } from "@/lib/blog";
import { formatDate } from "@/lib/format";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <Container className="space-y-10 py-8 md:space-y-16 md:py-14">
      <PageIntro
        eyebrow={<LocalizedText en="Blog" zh="博客" />}
        title={<LocalizedText en="Notes on AI, data, and research practice" zh="AI、数据与研究实践笔记" />}
        description={<LocalizedText en="A minimalist writing space for technical reflections and research process notes." zh="用于记录技术思考与研究过程的简洁写作空间。" />}
      />

      <section className="space-y-4 pb-4">
        {posts.length === 0 ? (
          <Reveal>
            <p className="rounded-xl border border-dashed border-line bg-paper/80 p-6 text-sm text-muted">
              <LocalizedText en="No posts yet. Add markdown files in" zh="暂无文章。可在" /> <code>content/blog</code> <LocalizedText en="to publish new entries." zh="中添加 Markdown 发布。" />
            </p>
          </Reveal>
        ) : (
          posts.map((post, idx) => (
            <Reveal key={post.slug} delay={idx * 0.04}>
              <article className="rounded-2xl border border-line/70 bg-paper/90 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-card sm:p-5 md:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{formatDate(post.date)}</p>
                <h2 className="mt-3 font-display text-2xl text-accent sm:text-3xl">
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
