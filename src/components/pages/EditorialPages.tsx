import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PageIntro } from "@/components/motion/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import { Tag } from "@/components/ui/Tag";
import { projects } from "@/content/projects";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { localizedPath as lp, alternates, type Locale } from "@/lib/locale";
import { renderMarkdown } from "@/lib/markdown";
import { ArticleImages } from "@/components/blog/ArticleImages";
import type { ProjectItem } from "@/types/content";
export { Home } from "./HomePage";
const t = (l: Locale, en: string, zh: string) => (l === "zh" ? zh : en);
export function pageMetadata(
  path: string,
  title: string,
  description: string,
): Metadata {
  return {
    title: `${title} | Bohan Wang`,
    description,
    alternates: alternates(path),
  };
}
function ProjectCard({ p, locale }: { p: ProjectItem; locale: Locale }) {
  return (
    <article className="h-full rounded-2xl border border-line/70 bg-paper/90 p-4 shadow-card sm:p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-xl text-accent sm:text-2xl">
          <Link
            href={lp(`/projects/${p.id}`, locale)}
            className="hover:underline"
          >
            {t(locale, p.title, p.titleZh || p.title)}
          </Link>
        </h2>
      </div>
      <p className="mt-2 text-xs text-muted">
        {t(locale, p.period, p.periodZh || p.period)} ·{" "}
        {t(locale, p.role, p.roleZh)}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        {t(locale, p.summary, p.summaryZh || p.summary)}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {p.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
      <Link
        href={lp(`/projects/${p.id}`, locale)}
        className="mt-5 inline-flex text-sm font-semibold text-accent hover:underline"
      >
        {t(locale, "Project details", "项目详情")} →
      </Link>
    </article>
  );
}
export function Projects({ locale }: { locale: Locale }) {
  return (
    <Container className="space-y-10 py-8 md:space-y-16 md:py-14">
      <PageIntro
        eyebrow={t(locale, "Projects", "项目")}
        title={t(locale, "Research and personal projects", "研究与个人项目")}
        description={t(
          locale,
          "The projects I work on, including my role and related articles.",
          "我做过的研究和个人项目，以及我的分工和相关文章。",
        )}
      />
      <section className="grid gap-4 md:grid-cols-2 md:gap-5">
        {projects.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.03}>
            <ProjectCard p={p} locale={locale} />
          </Reveal>
        ))}
      </section>
    </Container>
  );
}
export function Project({ slug, locale }: { slug: string; locale: Locale }) {
  const p = projects.find((p) => p.id === slug);
  if (!p) notFound();
  const posts = getAllPosts(locale).filter((post) => post.project === p.id);
  return (
    <Container className="py-8 md:py-14">
      <Link href={lp("/projects", locale)} className="text-sm text-accent">
        ← {t(locale, "Projects", "项目")}
      </Link>
      <PageIntro
        eyebrow={t(locale, p.period, p.periodZh || p.period)}
        title={t(locale, p.title, p.titleZh || p.title)}
        description={t(locale, p.summary, p.summaryZh || p.summary)}
      />
      <section className="mt-10 max-w-3xl rounded-2xl border border-line bg-paper/90 p-5 md:p-7">
        <h2 className="font-display text-2xl text-accent">
          {t(locale, "My work", "我做的部分")}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          {t(locale, p.ownership, p.ownershipZh)}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {p.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        {p.links?.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="mt-5 mr-5 inline-block text-sm font-semibold text-accent hover:underline"
          >
            {link.label} ↗
          </a>
        ))}
      </section>
      {posts.length > 0 && (
        <section className="mt-10 max-w-3xl">
          <h2 className="font-display text-2xl text-accent">
            {t(locale, "Related writing", "相关文章")}
          </h2>
          {posts.map((post) => (
            <article
              key={post.slug}
              className="mt-4 rounded-xl border border-line bg-paper/90 p-5"
            >
              <Link
                href={lp(`/blog/${post.slug}`, locale)}
                className="font-display text-xl text-accent hover:underline"
              >
                {post.title}
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {post.excerpt}
              </p>
            </article>
          ))}
        </section>
      )}
    </Container>
  );
}
export function Blog({ locale }: { locale: Locale }) {
  return (
    <Container className="space-y-10 py-8 md:space-y-16 md:py-14">
      <PageIntro
        eyebrow={t(locale, "Blog", "博客")}
        title={t(locale, "Notes on my projects", "项目笔记")}
        description={t(
          locale,
          "How I built things, what went wrong, and what I would change.",
          "记录怎么做的、哪里没做好，以及下一次会怎么改。",
        )}
      />
      <section className="space-y-4 pb-4">
        {getAllPosts(locale).map((post, i) => (
          <Reveal key={post.slug} delay={i * 0.04}>
            <article className="rounded-2xl border border-line bg-paper/90 p-5 md:p-6">
              <p className="text-xs text-muted">
                {post.date} · {post.readingTimeMinutes}{" "}
                {t(locale, "min read", "分钟阅读")}
              </p>
              <h2 className="mt-3 font-display text-2xl text-accent sm:text-3xl">
                <Link
                  href={lp(`/blog/${post.slug}`, locale)}
                  className="hover:underline"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {post.excerpt}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </article>
          </Reveal>
        ))}
      </section>
    </Container>
  );
}
export async function Article({
  slug,
  locale,
}: {
  slug: string;
  locale: Locale;
}) {
  const post = getPostBySlug(slug, locale);
  if (!post) notFound();
  const { html, toc } = await renderMarkdown(post.content);
  const project = projects.find((p) => p.id === post.project);
  return (
    <article className="article-page" lang={locale === "zh" ? "zh-CN" : "en"}>
      <header className="article-header editorial-container">
        <Link className="back-link" href={lp("/blog", locale)}>
          ← {t(locale, "Blog", "博客")}
        </Link>
        <p className="eyebrow">{post.tags.join(" · ")}</p>
        <h1>{post.title}</h1>
        <p className="article-deck">{post.excerpt}</p>
        <div className="article-meta">
          <span>Bohan Wang / 王博涵</span>
          <time dateTime={post.date}>{post.date}</time>
          <span>
            {post.readingTimeMinutes} {t(locale, "min read", "分钟阅读")}
          </span>
          <span>
            {t(locale, "Updated", "更新于")} {post.updated}
          </span>
        </div>
        {post.cover && (
          <Image
            className="article-cover"
            priority
            src={post.cover}
            alt={post.coverAlt || post.title}
            width={1100}
            height={620}
          />
        )}
      </header>
      <div className="article-layout editorial-container">
        <aside className="article-toc">
          <details open>
            <summary>{t(locale, "Contents", "目录")}</summary>
            <nav aria-label={t(locale, "Table of contents", "文章目录")}>
              {toc.map((item) => (
                <a
                  className={item.depth === 3 ? "toc-sub" : ""}
                  href={`#${item.id}`}
                  key={item.id}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </details>
        </aside>
        <div>
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <ArticleImages locale={locale} />
          <footer className="article-end">
            {project && (
              <Link href={lp(`/projects/${project.id}`, locale)}>
                {t(locale, "Related project", "相关项目")} →{" "}
                {t(locale, project.title, project.titleZh || project.title)}
              </Link>
            )}
            <Link href={lp(`/blog/${slug}`, locale === "zh" ? "en" : "zh")}>
              {t(locale, "中文版", "English")} ↗
            </Link>
          </footer>
        </div>
      </div>
    </article>
  );
}
export function articleMetadata(slug: string, locale: Locale): Metadata {
  const post = getPostBySlug(slug, locale);
  if (!post) return {};
  return {
    ...pageMetadata(lp(`/blog/${slug}`, locale), post.title, post.excerpt),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated,
      locale: locale === "zh" ? "zh_CN" : "en_US",
      ...(post.cover
        ? { images: [{ url: post.cover, alt: post.coverAlt }] }
        : {}),
    },
  };
}
export function Research({ locale }: { locale: Locale }) {
  return (
    <Container className="space-y-10 py-8 md:space-y-16 md:py-14">
      <PageIntro
        eyebrow={t(locale, "Research", "研究")}
        title={t(locale, "Research interests", "研究方向")}
        description={t(
          locale,
          "Image reconstruction, single-cell time modeling, and spatial transcriptomics.",
          "图像重建、单细胞时间建模和空间转录组。",
        )}
      />
      <section className="grid gap-4 md:grid-cols-2 md:gap-5">
        {projects
          .filter((p) =>
            ["bu-thesis", "tempofactor", "spatial-neural-field"].includes(p.id),
          )
          .map((p) => (
            <ProjectCard key={p.id} p={p} locale={locale} />
          ))}
      </section>
    </Container>
  );
}
