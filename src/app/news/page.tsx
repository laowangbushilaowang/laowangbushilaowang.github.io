import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageIntro } from "@/components/motion/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import { news } from "@/content/news";
import { formatMonth } from "@/lib/format";

export default function NewsPage() {
  return (
    <Container className="space-y-16 py-10 md:py-16">
      <PageIntro
        eyebrow="News"
        title="Chronological updates"
        description="Academic milestones, project updates, and recent achievements."
      />

      <section className="relative space-y-4 pb-4 before:absolute before:bottom-0 before:left-2 before:top-0 before:w-px before:bg-line/80">
        {news.map((item, idx) => (
          <Reveal key={`${item.date}-${item.title}`} delay={idx * 0.03}>
            <article className="relative ml-8 rounded-xl border border-line/70 bg-paper/90 p-5">
              <span className="absolute -left-[2.05rem] top-5 h-3 w-3 rounded-full border border-accent bg-paper" aria-hidden />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{formatMonth(item.date)}</p>
              <h2 className="mt-2 font-semibold text-ink">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
              {item.href ? (
                <Link
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-sm font-semibold text-accent underline-offset-4 hover:underline"
                >
                  Learn more
                </Link>
              ) : null}
            </article>
          </Reveal>
        ))}
      </section>
    </Container>
  );
}
