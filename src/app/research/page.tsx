import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageIntro } from "@/components/motion/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import { Tag } from "@/components/ui/Tag";
import { researchThemes } from "@/content/research";

export default function ResearchPage() {
  return (
    <Container className="space-y-16 py-10 md:py-16">
      <PageIntro
        eyebrow="Research"
        title="Themes and directions"
        description="My research explores machine learning foundations and practical systems for computational biology, biomedical AI, and robotics."
      />

      <div className="grid gap-5">
        {researchThemes.map((theme, idx) => (
          <Reveal key={theme.id} delay={idx * 0.04}>
            <article className="rounded-2xl border border-line/70 bg-paper/90 p-6 shadow-card md:p-8">
              <h2 className="font-display text-3xl text-ink">{theme.title}</h2>
              <p className="mt-4 max-w-4xl text-base leading-relaxed text-muted md:text-lg">{theme.summary}</p>

              <div className="mt-6 grid gap-5 md:grid-cols-3">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Keywords</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {theme.keywords.map((item) => (
                      <Tag key={item}>{item}</Tag>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Methods</h3>
                  <ul className="mt-3 space-y-1 text-sm text-muted">
                    {theme.methods.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Applications</h3>
                  <ul className="mt-3 space-y-1 text-sm text-muted">
                    {theme.applications.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <section className="rounded-xl border border-dashed border-line bg-paper/75 p-6">
          <h2 className="font-display text-2xl text-ink">Publications-ready architecture</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
            This page is backed by structured research data and optional publication IDs, so a dedicated Publications page can be added with minimal
            refactoring.
          </p>
          <Link href="/cv" className="mt-4 inline-flex text-sm font-semibold text-accent underline-offset-4 hover:underline">
            See current CV entries
          </Link>
        </section>
      </Reveal>
    </Container>
  );
}
