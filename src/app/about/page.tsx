import { Container } from "@/components/ui/Container";
import { PageIntro } from "@/components/motion/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { education } from "@/content/education";
import { researchThemes } from "@/content/research";
import { siteProfile } from "@/content/site";

export default function AboutPage() {
  return (
    <Container className="space-y-16 py-10 md:space-y-20 md:py-16">
      <PageIntro
        eyebrow="About"
        title="Academic profile"
        description="I am a data science and AI researcher focused on translating machine learning advances into meaningful biomedical and social impact."
      />

      <section className="space-y-6">
        <SectionHeading title="Bio" />
        <Reveal>
          <div className="max-w-4xl space-y-4 text-base leading-relaxed text-muted md:text-lg">
            <p>
              {siteProfile.name} is currently an {siteProfile.currentRole.title.toLowerCase()} at {siteProfile.currentRole.institution}, where he works on
              computational biology and machine learning research. His work combines theory-inspired modeling with practical data engineering for
              high-dimensional biological datasets.
            </p>
            <p>
              He completed an MSc in Data Science at Boston University in February 2025 and previously earned a BSc (Hons) in Data Science from HKBU-UIC.
              Across research and industry settings, he has developed methods in neural fields, biomedical AI, and robot vision systems.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="space-y-6">
        <SectionHeading title="Research interests" />
        <div className="grid gap-4 md:grid-cols-2">
          {researchThemes.map((theme, idx) => (
            <Reveal key={theme.id} delay={idx * 0.05}>
              <article className="h-full rounded-xl border border-line/70 bg-paper/85 p-5">
                <h3 className="font-display text-2xl text-ink">{theme.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{theme.summary}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="space-y-6 pb-4">
        <SectionHeading title="Education timeline" />
        <ol className="space-y-4">
          {education.map((entry, idx) => (
            <Reveal key={entry.id} delay={idx * 0.05}>
              <li className="rounded-xl border border-line/70 bg-paper/85 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  {entry.startDate} - {entry.endDate}
                </p>
                <h3 className="mt-2 font-display text-2xl text-ink">{entry.degree}</h3>
                <p className="text-sm text-muted">
                  {entry.institution} | {entry.location}
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
                  {entry.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>
    </Container>
  );
}
