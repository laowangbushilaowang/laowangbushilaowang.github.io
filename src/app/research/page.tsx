import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageIntro } from "@/components/motion/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import { Tag } from "@/components/ui/Tag";
import { LocalizedText } from "@/components/i18n/LocalizedText";
import { researchThemes } from "@/content/research";

export default function ResearchPage() {
  return (
    <Container className="space-y-10 py-8 md:space-y-16 md:py-14">
      <PageIntro
        eyebrow={<LocalizedText en="Research" zh="研究" />}
        title={<LocalizedText en="Themes and directions" zh="研究主题与方向" />}
        description={
          <LocalizedText
            en="My research explores machine learning foundations and practical systems for computational biology, biomedical AI, and robotics."
            zh="我的研究聚焦机器学习方法及其在计算生物学、生物医学 AI 与机器人方向的应用。"
          />
        }
      />

      <div className="grid gap-5">
        {researchThemes.map((theme, idx) => (
          <Reveal key={theme.id} delay={idx * 0.04}>
            <article className="rounded-2xl border border-line/70 bg-paper/90 p-4 shadow-card sm:p-5 md:p-8">
              <h2 className="font-display text-2xl text-ink md:text-3xl">
                <LocalizedText en={theme.title} zh={theme.titleZh ?? theme.title} />
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-relaxed text-muted sm:text-base md:mt-4 md:text-lg">
                <LocalizedText en={theme.summary} zh={theme.summaryZh ?? theme.summary} />
              </p>

              <div className="mt-5 grid gap-4 md:mt-6 md:gap-5 md:grid-cols-3">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                    <LocalizedText en="Keywords" zh="关键词" />
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {theme.keywords.map((item, keywordIdx) => (
                      <Tag key={item}>
                        <LocalizedText en={item} zh={theme.keywordsZh?.[keywordIdx] ?? item} />
                      </Tag>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                    <LocalizedText en="Methods" zh="方法" />
                  </h3>
                  <ul className="mt-3 space-y-1 text-sm text-muted">
                    {theme.methods.map((item, methodIdx) => (
                      <li key={item}>
                        - <LocalizedText en={item} zh={theme.methodsZh?.[methodIdx] ?? item} />
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                    <LocalizedText en="Applications" zh="应用" />
                  </h3>
                  <ul className="mt-3 space-y-1 text-sm text-muted">
                    {theme.applications.map((item, appIdx) => (
                      <li key={item}>
                        - <LocalizedText en={item} zh={theme.applicationsZh?.[appIdx] ?? item} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <section className="rounded-xl border border-dashed border-line bg-paper/75 p-4 sm:p-5 md:p-6">
          <h2 className="font-display text-2xl text-ink">
            <LocalizedText en="Publications-ready architecture" zh="可扩展的论文模块" />
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
            <LocalizedText
              en="This page is backed by structured research data and optional publication IDs, so a dedicated Publications page can be added with minimal refactoring."
              zh="本页使用结构化数据组织研究主题，后续新增 Publications 页面时几乎不需要重构。"
            />
          </p>
          <Link href="/cv" className="mt-4 inline-flex text-sm font-semibold text-accent underline-offset-4 hover:underline">
            <LocalizedText en="See current CV entries" zh="查看当前简历内容" />
          </Link>
        </section>
      </Reveal>
    </Container>
  );
}
