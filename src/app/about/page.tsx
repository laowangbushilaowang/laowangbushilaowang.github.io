import { Container } from "@/components/ui/Container";
import { PageIntro } from "@/components/motion/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LocalizedText } from "@/components/i18n/LocalizedText";
import { education } from "@/content/education";
import { researchThemes } from "@/content/research";
import { siteProfile } from "@/content/site";

export default function AboutPage() {
  return (
    <Container className="space-y-10 py-8 md:space-y-16 md:py-14">
      <PageIntro
        eyebrow={<LocalizedText en="About" zh="关于" />}
        title={<LocalizedText en="Academic profile" zh="学术简介" />}
        description={
          <LocalizedText
            en="I am an early-career researcher applying for PhD programs, building practical ML systems for biological data, medical vision, and robotics."
            zh="我是一名正在申请博士项目的早期研究者，关注生物数据分析、医疗视觉与机器人方向的可落地机器学习系统。"
          />
        }
      />

      <section className="space-y-6">
        <SectionHeading title={<LocalizedText en="Bio" zh="个人介绍" />} />
        <Reveal>
          <div className="max-w-4xl space-y-3 text-sm leading-relaxed text-muted sm:text-base md:text-lg">
            <p>
              <LocalizedText
                en={`${siteProfile.name} is an early-career ${siteProfile.currentRole.title.toLowerCase()} at ${siteProfile.currentRole.institution}, working on computational biology and machine learning for high-dimensional biological data.`}
                zh={`${siteProfile.name} 目前在${siteProfile.currentRole.institutionZh ?? siteProfile.currentRole.institution}担任早期阶段${siteProfile.currentRole.titleZh ?? siteProfile.currentRole.title}，主要从事高维生物数据的计算生物学与机器学习研究。`}
              />
            </p>
            <p>
              <LocalizedText
                en="He completed an MSc in Data Science at Boston University (2025), after a BSc (Hons) in Data Science at HKBU-UIC. He is currently applying for PhD opportunities in computational biology, medical computer vision, and robotics."
                zh="他于 2025 年完成波士顿大学数据科学硕士学位，此前在 HKBU-UIC 获得数据科学荣誉学士学位。目前正在申请计算生物学、医疗计算机视觉与机器人方向的博士机会。"
              />
            </p>
          </div>
        </Reveal>
      </section>

      <section className="space-y-6">
        <SectionHeading title={<LocalizedText en="Research interests" zh="研究兴趣" />} />
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          {researchThemes.map((theme, idx) => (
            <Reveal key={theme.id} delay={idx * 0.05}>
              <article className="h-full rounded-xl border border-line/70 bg-paper/85 p-4 md:p-5">
                <h3 className="font-display text-xl text-ink md:text-2xl">
                  <LocalizedText en={theme.title} zh={theme.titleZh ?? theme.title} />
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  <LocalizedText en={theme.summary} zh={theme.summaryZh ?? theme.summary} />
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="space-y-6 pb-4">
        <SectionHeading title={<LocalizedText en="Education timeline" zh="教育经历" />} />
        <ol className="space-y-3 md:space-y-4">
          {education.map((entry, idx) => (
            <Reveal key={entry.id} delay={idx * 0.05}>
              <li className="rounded-xl border border-line/70 bg-paper/85 p-4 md:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  <LocalizedText en={`${entry.startDate} - ${entry.endDate}`} zh={`${entry.startDateZh ?? entry.startDate} - ${entry.endDateZh ?? entry.endDate}`} />
                </p>
                <h3 className="mt-2 font-display text-xl text-ink md:text-2xl">
                  <LocalizedText en={entry.degree} zh={entry.degreeZh ?? entry.degree} />
                </h3>
                <p className="text-sm text-muted">
                  <LocalizedText
                    en={`${entry.institution} | ${entry.location}`}
                    zh={`${entry.institutionZh ?? entry.institution} | ${entry.locationZh ?? entry.location}`}
                  />
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
                  {entry.highlights.map((item, idx) => (
                    <li key={item}>
                      <LocalizedText en={item} zh={entry.highlightsZh?.[idx] ?? item} />
                    </li>
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
