import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Tag } from "@/components/ui/Tag";
import { siteProfile } from "@/content/site";
import { projects } from "@/content/projects";
import { researchThemes } from "@/content/research";
import { news } from "@/content/news";
import { formatMonth } from "@/lib/format";

export default function HomePage() {
  const topProjects = projects.slice(0, 3);
  const topResearch = researchThemes.slice(0, 3);
  const topNews = news.slice(0, 4);

  return (
    <Container className="py-10 md:py-14">
      <section className="grid items-start gap-8 border-b border-line pb-10 md:grid-cols-[240px_minmax(0,1fr)]">
        <div className="mx-auto w-full max-w-[220px] overflow-hidden rounded-2xl border border-line bg-white shadow-sm md:mx-0">
          <Image src="/wbh.jpg" alt="Bohan Wang" width={360} height={480} className="h-auto w-full object-cover" priority />
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted">Academic Profile</p>
          <h1 className="font-display text-4xl leading-tight text-ink md:text-5xl">
            {siteProfile.name} <span className="text-2xl text-muted md:text-3xl">({siteProfile.bilingualName})</span>
          </h1>
          <p className="text-lg text-ink/90">{siteProfile.tagline}</p>
          <p className="max-w-3xl text-base leading-relaxed text-muted">{siteProfile.intro}</p>

          <div className="grid gap-2 rounded-xl border border-line bg-paper/60 p-4 text-sm md:grid-cols-2">
            <p>
              <span className="font-semibold text-ink">Current:</span> {siteProfile.currentRole.title}
            </p>
            <p>
              <span className="font-semibold text-ink">Institution:</span> {siteProfile.currentRole.institution}
            </p>
            <p>
              <span className="font-semibold text-ink">Location:</span> {siteProfile.location}
            </p>
            <p>
              <span className="font-semibold text-ink">Email:</span> {siteProfile.email}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-1 text-sm font-semibold text-accent">
            <Link href="/research" className="hover:underline">
              Research
            </Link>
            <Link href="/projects" className="hover:underline">
              Projects
            </Link>
            <Link href="/cv" className="hover:underline">
              CV
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-8 py-10 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="font-display text-2xl text-ink md:text-3xl">Research Focus</h2>
          <div className="space-y-3">
            {topResearch.map((theme) => (
              <article key={theme.id} className="rounded-xl border border-line p-4">
                <h3 className="font-semibold text-ink">{theme.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{theme.summary}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-2xl text-ink md:text-3xl">Selected Projects</h2>
          <div className="space-y-3">
            {topProjects.map((project) => (
              <article key={project.id} className="rounded-xl border border-line p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-ink">{project.title}</h3>
                  <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{project.period}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted">{project.summary}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.tags.slice(0, 3).map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line pt-8">
        <h2 className="font-display text-2xl text-ink md:text-3xl">Recent News</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          {topNews.map((item) => (
            <li key={`${item.date}-${item.title}`}>
              <span className="font-semibold text-ink">{formatMonth(item.date)}</span>
              <span className="px-2">-</span>
              {item.title}
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
