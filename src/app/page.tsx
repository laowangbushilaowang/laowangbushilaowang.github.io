import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { Reveal } from "@/components/motion/Reveal";
import { HomeHero } from "@/components/sections/HomeHero";
import { HomeQuickLinks } from "@/components/sections/HomeQuickLinks";
import { CurrentFocus } from "@/components/sections/CurrentFocus";
import { projects } from "@/content/projects";
import { news } from "@/content/news";
import { formatMonth } from "@/lib/format";

export default function HomePage() {
  const featuredProjects = projects.filter((item) => item.featured).slice(0, 3);
  const latestNews = news.slice(0, 3);

  return (
    <Container className="space-y-16 py-10 md:space-y-20 md:py-16">
      <HomeHero />
      <HomeQuickLinks />
      <CurrentFocus />

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Selected Work"
          title="Research-driven projects"
          description="A snapshot of recent projects spanning computational biology, machine learning, and socially impactful data science."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {featuredProjects.map((project, idx) => (
            <Reveal key={project.id} delay={idx * 0.04}>
              <article className="h-full rounded-2xl border border-line/70 bg-paper/90 p-6 shadow-card transition-all duration-300 hover:-translate-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{project.period}</p>
                <h3 className="mt-3 font-display text-2xl text-ink">{project.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{project.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags.slice(0, 3).map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <Link href="/projects" className="inline-flex text-sm font-semibold text-accent underline-offset-4 hover:underline">
          View all projects
        </Link>
      </section>

      <section className="space-y-8 pb-4">
        <SectionHeading
          eyebrow="Latest Updates"
          title="Recent news"
          description="Milestones, academic updates, and ongoing research progress."
        />
        <div className="grid gap-4">
          {latestNews.map((item, idx) => (
            <Reveal key={`${item.date}-${item.title}`} delay={idx * 0.04}>
              <article className="rounded-xl border border-line/70 bg-paper/80 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{formatMonth(item.date)}</p>
                <h3 className="mt-2 font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Link href="/news" className="inline-flex text-sm font-semibold text-accent underline-offset-4 hover:underline">
          Read all news
        </Link>
      </section>
    </Container>
  );
}
