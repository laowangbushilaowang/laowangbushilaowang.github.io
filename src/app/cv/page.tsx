import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageIntro } from "@/components/motion/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LocalizedText } from "@/components/i18n/LocalizedText";
import { education } from "@/content/education";
import { projects } from "@/content/projects";
import { awards, researchExperience, skillGroups } from "@/content/cv";

export default function CvPage() {
  return (
    <Container className="space-y-10 py-8 md:space-y-16 md:py-14">
      <PageIntro
        eyebrow={<LocalizedText en="Curriculum Vitae" zh="简历" />}
        title={<LocalizedText en="Academic CV" zh="学术简历" />}
        description={<LocalizedText en="Education, research experience, technical skills, and selected achievements." zh="教育背景、研究经历、技能与主要成果。" />}
      />

      <Reveal>
        <Link
          href="/files/Bohan_Wang_CV.pdf"
          target="_blank"
          className="inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-accent sm:px-5"
        >
          <LocalizedText en="Download PDF CV" zh="下载 PDF 简历" />
        </Link>
      </Reveal>

      <section className="space-y-6">
        <SectionHeading title={<LocalizedText en="Education" zh="教育背景" />} />
        <div className="space-y-4">
          {education.map((entry, idx) => (
            <Reveal key={entry.id} delay={idx * 0.04}>
              <article className="rounded-xl border border-line/70 bg-paper/85 p-4 md:p-5">
                <h3 className="font-display text-xl text-ink md:text-2xl">{entry.degree}</h3>
                <p className="mt-1 text-sm text-muted">
                  {entry.institution} | {entry.location}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {entry.startDate} - {entry.endDate}
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
                  {entry.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading title={<LocalizedText en="Research experience" zh="研究经历" />} />
        <div className="space-y-4">
          {researchExperience.map((entry, idx) => (
            <Reveal key={entry.id} delay={idx * 0.04}>
              <article className="rounded-xl border border-line/70 bg-paper/85 p-4 md:p-5">
                <h3 className="font-display text-xl text-ink md:text-2xl">{entry.role}</h3>
                <p className="mt-1 text-sm text-muted">
                  {entry.institution} | {entry.location}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">{entry.period}</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
                  {entry.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading title={<LocalizedText en="Selected projects" zh="精选项目" />} />
        <div className="space-y-3">
          {projects.slice(0, 4).map((project, idx) => (
            <Reveal key={project.id} delay={idx * 0.03}>
              <article className="rounded-xl border border-line/70 bg-paper/85 p-4 md:p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="font-semibold text-ink">{project.title}</h3>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{project.period}</p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{project.summary}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="grid gap-8 pb-4 md:grid-cols-2">
        <div className="space-y-6">
          <SectionHeading title={<LocalizedText en="Technical skills" zh="技术技能" />} />
          <div className="space-y-3">
            {skillGroups.map((group) => (
              <article key={group.name} className="rounded-xl border border-line/70 bg-paper/85 p-4 md:p-5">
                <h3 className="font-semibold text-ink">{group.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{group.items.join(", ")}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <SectionHeading title={<LocalizedText en="Awards" zh="奖项" />} />
          <div className="space-y-3">
            {awards.map((award) => (
              <article key={award.title} className="rounded-xl border border-line/70 bg-paper/85 p-4 md:p-5">
                <h3 className="font-semibold text-ink">{award.title}</h3>
                <p className="mt-1 text-sm text-muted">{award.date}</p>
                {award.note ? <p className="mt-2 text-sm text-muted">{award.note}</p> : null}
              </article>
            ))}
          </div>
        </div>
      </section>
    </Container>
  );
}
