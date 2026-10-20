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
function ProjectCard({ p, locale, compact = false }: { p: ProjectItem; locale: Locale; compact?: boolean }) {
  return (
    <article data-project-id={p.id} data-project-date={p.projectDate ?? ""}
      className={compact
        ? "h-full rounded-xl border border-line/70 bg-paper/70 p-4 sm:p-5"
        : "h-full rounded-2xl border border-line/70 bg-paper/90 p-4 shadow-card sm:p-5 md:p-6"}>
      <h3 className={compact ? "font-display text-lg text-accent sm:text-xl" : "font-display text-xl text-accent sm:text-2xl"}>
        <Link href={lp(`/projects/${p.id}`, locale)} className="hover:underline">
          {t(locale, p.title, p.titleZh || p.title)}
        </Link>
      </h3>
      <p className="mt-2 text-xs text-muted">{t(locale, p.period, p.periodZh || p.period)}</p>
      <p className={compact ? "mt-3 line-clamp-3 text-sm leading-relaxed text-muted" : "mt-4 text-sm leading-relaxed text-muted"}>
        {t(locale, p.summary, p.summaryZh || p.summary)}
      </p>
      {!compact && <div className="mt-5 flex flex-wrap gap-2">
        {p.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
      </div>}
      <Link href={lp(`/projects/${p.id}`, locale)} className="mt-4 inline-flex text-sm font-semibold text-accent hover:underline">
        {t(locale, "Project details", "项目详情")} →
      </Link>
    </article>
  );
}

export function Projects({ locale }: { locale: Locale }) {
  const groups = [
    { tier: "primary", id: "main-projects", title: t(locale, "Main projects", "主要项目") },
    { tier: "secondary", id: "other-projects", title: t(locale, "Other projects and notes", "其他项目与笔记") },
  ] as const;
  return (
    <Container className="space-y-10 py-8 md:space-y-16 md:py-14">
      <PageIntro eyebrow={t(locale, "Projects", "项目")}
        title={t(locale, "Research and personal projects", "研究与个人项目")}
        description={t(locale,
          "Work, internships, theses, and formal academic projects come first. Personal tools and practice follow. Each group runs from newer projects to older ones.",
          "工作、实习、论文和正式学校项目在前，个人工具与实践在后。各组按项目时间从新到旧排列。")}
      />
      <nav aria-label={t(locale, "Project groups", "项目分组")} className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-accent">
        {groups.map((g) => <a key={g.id} href={`#${g.id}`} className="hover:underline">
          {g.title} <span className="ml-1 font-normal text-muted">{projects.filter((p) => p.tier === g.tier).length}</span>
        </a>)}
      </nav>
      {groups.map((g) => <section key={g.id} id={g.id} data-project-tier={g.tier} aria-labelledby={`${g.id}-heading`}
        className="scroll-mt-28 space-y-5 border-t border-line pt-7 md:space-y-7 md:pt-9">
        <h2 id={`${g.id}-heading`} className="font-display text-2xl text-accent sm:text-3xl">{g.title}</h2>
        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {projects.filter((p) => p.tier === g.tier).map((p, i) => <Reveal key={p.id} delay={Math.min(i * 0.03, 0.12)}>
            <ProjectCard p={p} locale={locale} compact={g.tier === "secondary"} />
          </Reveal>)}
        </div>
      </section>)}
    </Container>
  );
}
export function Project({ slug, locale }: { slug: string; locale: Locale }) {
  const p = projects.find((p) => p.id === slug);
  if (!p) notFound();
  const posts = getAllPosts(locale).filter((post) => post.project === p.id);
  const details = locale === "zh" ? p.detailsZh : p.details;
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
      {details && details.length > 0 && (
        <section className="mt-10 max-w-3xl space-y-4">
          <h2 className="font-display text-2xl text-accent">
            {t(locale, "Implementation and results", "实现与结果")}
          </h2>
          {details.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-relaxed text-muted">
              {paragraph}
            </p>
          ))}
        </section>
      )}
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
                className="block font-display text-xl text-accent hover:underline"
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
  const posts = getAllPosts(locale);
  const groups = [
    { tier: "primary", id: "main-writing", title: t(locale, "Main projects", "主要项目") },
    { tier: "secondary", id: "other-writing", title: t(locale, "Other projects and notes", "其他项目与笔记") },
  ] as const;
  return (
    <Container className="space-y-10 py-8 md:space-y-16 md:py-14">
      <PageIntro eyebrow={t(locale, "Blog", "博客")}
        title={t(locale, "Notes on my projects", "项目笔记")}
        description={t(locale,
          "Writing on work and formal academic projects first, then personal tools and practice. Each group runs from newer projects to older ones.",
          "工作与正式学校项目的文章在前，个人工具与实践笔记在后。各组按项目时间从新到旧排列。")}
      />
      <nav aria-label={t(locale, "Writing groups", "文章分组")} className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-accent">
        {groups.map((g) => <a key={g.id} href={`#${g.id}`} className="hover:underline">
          {g.title} <span className="ml-1 font-normal text-muted">{posts.filter((p) => p.projectTier === g.tier).length}</span>
        </a>)}
      </nav>
      {groups.map((g) => <section key={g.id} id={g.id} data-project-tier={g.tier} aria-labelledby={`${g.id}-heading`}
        className="scroll-mt-28 space-y-5 border-t border-line pt-7 pb-4 md:space-y-7 md:pt-9">
        <h2 id={`${g.id}-heading`} className="font-display text-2xl text-accent sm:text-3xl">{g.title}</h2>
        <div className="space-y-4">
          {posts.filter((p) => p.projectTier === g.tier).map((post, i) => <Reveal key={post.slug} delay={Math.min(i * 0.03, 0.12)}>
            <article data-project-id={post.project} data-project-date={post.projectDate ?? ""}
              className={g.tier === "primary" ? "rounded-2xl border border-line bg-paper/90 p-5 md:p-6" : "rounded-xl border border-line/70 bg-paper/70 p-4 sm:p-5"}>
              <p className="text-xs text-muted">{t(locale, post.projectPeriod, post.projectPeriodZh)} · {post.readingTimeMinutes} {t(locale, "min read", "分钟阅读")}</p>
              <h3 className={g.tier === "primary" ? "mt-3 font-display text-2xl text-accent sm:text-3xl" : "mt-2 font-display text-xl text-accent sm:text-2xl"}>
                <Link href={lp(`/blog/${post.slug}`, locale)} className="block hover:underline">{post.title}</Link>
              </h3>
              <p className={g.tier === "primary" ? "mt-3 text-sm leading-relaxed text-muted" : "mt-2 line-clamp-2 text-sm leading-relaxed text-muted"}>{post.excerpt}</p>
              {g.tier === "primary" && <div className="mt-4 flex flex-wrap gap-2">{post.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}</div>}
            </article>
          </Reveal>)}
        </div>
      </section>)}
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
