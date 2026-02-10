import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageIntro } from "@/components/motion/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import { Tag } from "@/components/ui/Tag";
import { projects } from "@/content/projects";

export default function ProjectsPage() {
  return (
    <Container className="space-y-16 py-10 md:py-16">
      <PageIntro
        eyebrow="Projects"
        title="Applied research and engineering"
        description="Selected projects in AI, computational biology, medical robotics, NLP, and socially oriented data analysis."
      />

      <section className="grid gap-5 md:grid-cols-2">
        {projects.map((project, idx) => (
          <Reveal key={project.id} delay={idx * 0.03}>
            <article className="h-full rounded-2xl border border-line/70 bg-paper/90 p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/40">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-2xl text-ink">{project.title}</h2>
                <span className="shrink-0 rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold text-accent">{project.period}</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">{project.summary}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>

              {project.links?.length ? (
                <div className="mt-5 flex flex-wrap gap-3">
                  {project.links.map((linkItem) => (
                    <Link
                      key={linkItem.href}
                      href={linkItem.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
                    >
                      {linkItem.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </article>
          </Reveal>
        ))}
      </section>
    </Container>
  );
}
