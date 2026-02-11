import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageIntro } from "@/components/motion/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import { LocalizedText } from "@/components/i18n/LocalizedText";
import { news } from "@/content/news";
import { formatMonth } from "@/lib/format";

export default function NewsPage() {
  return (
    <Container className="space-y-10 py-8 md:space-y-16 md:py-14">
      <PageIntro
        eyebrow={<LocalizedText en="News" zh="动态" />}
        title={<LocalizedText en="Chronological updates" zh="时间线更新" />}
        description={<LocalizedText en="Academic milestones, project updates, and recent achievements." zh="学术节点、项目进展与近期成果。" />}
      />

      <section className="relative space-y-3 pb-4 before:absolute before:bottom-0 before:left-2 before:top-0 before:w-px before:bg-line/80 md:space-y-4">
        {news.map((item, idx) => (
          <Reveal key={`${item.date}-${item.title}`} delay={idx * 0.03}>
            <article className="relative ml-6 rounded-xl border border-line/70 bg-paper/90 p-4 sm:ml-8 sm:p-5">
              <span className="absolute -left-[2.05rem] top-5 h-3 w-3 rounded-full border border-accent bg-paper" aria-hidden />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{formatMonth(item.date)}</p>
              <h2 className="mt-2 font-semibold text-ink">
                <LocalizedText en={item.title} zh={item.titleZh ?? item.title} />
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                <LocalizedText en={item.description} zh={item.descriptionZh ?? item.description} />
              </p>
              {item.href ? (
                <Link
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-sm font-semibold text-accent underline-offset-4 hover:underline"
                >
                  <LocalizedText en="Learn more" zh="查看详情" />
                </Link>
              ) : null}
            </article>
          </Reveal>
        ))}
      </section>
    </Container>
  );
}
