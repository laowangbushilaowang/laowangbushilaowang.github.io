import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Tag } from "@/components/ui/Tag";
import { LocalizedText } from "@/components/i18n/LocalizedText";
import { siteProfile } from "@/content/site";
import { projects } from "@/content/projects";
import { researchThemes } from "@/content/research";
import { news } from "@/content/news";
import { formatMonth } from "@/lib/format";

export default function HomePage() {
  const topProjects = projects.slice(0, 2);
  const topResearch = researchThemes.slice(0, 2);
  const topNews = news.slice(0, 3);

  return (
    <Container className="py-6 md:py-12">
      <section className="grid items-start gap-5 border-b border-line pb-7 md:gap-8 md:pb-10 md:grid-cols-[240px_minmax(0,1fr)]">
        <div className="mx-auto w-full max-w-[170px] overflow-hidden rounded-2xl border border-line bg-white shadow-sm sm:max-w-[220px] md:mx-0">
          <Image src="/wbh.jpg" alt="Bohan Wang" width={360} height={480} className="h-auto w-full object-cover" priority />
        </div>

        <div className="min-w-0 space-y-3 md:space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted">
            <LocalizedText en="Academic Profile" zh="学术主页" />
          </p>
          <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl md:text-5xl">
            {siteProfile.name} <span className="block text-xl text-muted sm:text-2xl md:text-3xl">({siteProfile.bilingualName})</span>
          </h1>
          <p className="text-sm text-ink/90 sm:text-base md:text-lg">
            <LocalizedText en={siteProfile.tagline} zh="人工智能工程师与数据科学研究者。" />
          </p>
          <p className="max-w-3xl text-sm leading-relaxed text-muted">
            <LocalizedText
              en={siteProfile.intro}
              zh="我主要研究计算生物学与机器学习，关注空间转录组、单细胞分析以及可落地的 AI 系统。"
            />
          </p>

          <div className="grid gap-2 rounded-xl border border-line bg-paper/60 p-3 text-xs sm:p-4 sm:text-sm md:grid-cols-2">
            <p>
              <span className="font-semibold text-ink">
                <LocalizedText en="Current:" zh="当前职位：" />
              </span>{" "}
              {siteProfile.currentRole.title}
            </p>
            <p>
              <span className="font-semibold text-ink">
                <LocalizedText en="Institution:" zh="机构：" />
              </span>{" "}
              {siteProfile.currentRole.institution}
            </p>
            <p>
              <span className="font-semibold text-ink">
                <LocalizedText en="Location:" zh="地点：" />
              </span>{" "}
              {siteProfile.location}
            </p>
            <p>
              <span className="font-semibold text-ink">
                <LocalizedText en="Email:" zh="邮箱：" />
              </span>{" "}
              {siteProfile.emailDisplay}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1 text-sm font-semibold text-accent">
            <Link href="/research" className="hover:underline">
              <LocalizedText en="Research" zh="研究" />
            </Link>
            <Link href="/projects" className="hover:underline">
              <LocalizedText en="Projects" zh="项目" />
            </Link>
            <Link href="/cv" className="hover:underline">
              <LocalizedText en="CV" zh="简历" />
            </Link>
            <Link href="/contact" className="hover:underline">
              <LocalizedText en="Contact" zh="联系" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 py-7 md:gap-8 md:py-10 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="font-display text-2xl text-ink sm:text-[1.75rem] md:text-3xl">
            <LocalizedText en="Research Focus" zh="研究方向" />
          </h2>
          <div className="space-y-3">
            {topResearch.map((theme) => (
              <article key={theme.id} className="rounded-xl border border-line p-3 sm:p-4">
                <h3 className="font-semibold text-ink">{theme.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{theme.summary}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-2xl text-ink sm:text-[1.75rem] md:text-3xl">
            <LocalizedText en="Selected Projects" zh="精选项目" />
          </h2>
          <div className="space-y-3">
            {topProjects.map((project) => (
              <article key={project.id} className="rounded-xl border border-line p-3 sm:p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-ink">{project.title}</h3>
                  <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted sm:text-xs">{project.period}</span>
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

      <section className="border-t border-line pt-6 md:pt-8">
        <h2 className="font-display text-2xl text-ink sm:text-[1.75rem] md:text-3xl">
          <LocalizedText en="Recent News" zh="最新动态" />
        </h2>
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
