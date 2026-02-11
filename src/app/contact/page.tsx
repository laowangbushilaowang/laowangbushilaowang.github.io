import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageIntro } from "@/components/motion/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import { LocalizedText } from "@/components/i18n/LocalizedText";
import { socialLinks } from "@/content/social";
import { siteProfile } from "@/content/site";

const iconByKey: Record<string, { en: string; zh: string }> = {
  email: { en: "Email", zh: "邮箱" },
  github: { en: "GitHub", zh: "GitHub" },
  linkedin: { en: "LinkedIn", zh: "LinkedIn" },
  scholar: { en: "Scholar", zh: "学术" }
};

export default function ContactPage() {
  return (
    <Container className="space-y-10 py-8 md:space-y-16 md:py-14">
      <PageIntro
        eyebrow={<LocalizedText en="Contact" zh="联系" />}
        title={<LocalizedText en="Get in touch" zh="欢迎联系" />}
        description={
          <LocalizedText
            en="I welcome research conversations and early-stage collaborations focused on data-centric machine learning and cross-domain applications, with additional interest in AI-agent workflows."
            zh="欢迎围绕数据驱动机器学习与跨领域应用开展交流和早期合作，我也持续关注 AI Agent 工作流。"
          />
        }
      />

      <section className="grid gap-4 pb-4 md:grid-cols-2 md:gap-5">
        <Reveal>
          <article className="rounded-2xl border border-line/70 bg-paper/90 p-4 shadow-card sm:p-5 md:p-6">
            <h2 className="font-display text-xl text-accent sm:text-2xl">
              <LocalizedText en="Primary contact" zh="主要联系方式" />
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              <LocalizedText
                en="I welcome conversations on research collaboration, interdisciplinary AI, and data-driven projects."
                zh="欢迎交流研究合作、跨领域 AI 与数据驱动项目。"
              />
            </p>
            <p className="mt-4 text-sm text-muted">
              <LocalizedText en={siteProfile.location} zh={siteProfile.locationZh ?? siteProfile.location} />
            </p>
          </article>
        </Reveal>

        <Reveal delay={0.08}>
          <article className="rounded-2xl border border-line/70 bg-paper/90 p-4 shadow-card sm:p-5 md:p-6">
            <h2 className="font-display text-xl text-accent sm:text-2xl">
              <LocalizedText en="Profiles and links" zh="主页与链接" />
            </h2>
            <ul className="mt-4 space-y-3">
              {socialLinks.map((link) => (
                <li key={link.iconKey} className="rounded-xl border border-line/70 bg-paper/85 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
                      <span className="shrink-0 rounded-full border border-highlight/60 bg-highlightSoft px-2 py-1 text-xs text-accent">
                        <LocalizedText en={iconByKey[link.iconKey].en} zh={iconByKey[link.iconKey].zh} />
                      </span>
                    </span>
                    {link.iconKey === "email" ? (
                      <span className="text-right text-sm font-medium break-all text-accent">{link.label}</span>
                    ) : (
                      <Link
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-right text-sm font-semibold break-all text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
                      >
                        {link.label}
                        <span aria-hidden>↗</span>
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </Reveal>
      </section>
    </Container>
  );
}
