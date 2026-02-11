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
            en="I am actively seeking PhD opportunities and early-stage collaborations focused on data-centric machine learning, foundation models (LLMs), and cross-domain applications."
            zh="我正在积极寻找聚焦数据驱动机器学习、基础模型（大模型）与跨领域应用的博士机会和早期合作。"
          />
        }
      />

      <section className="grid gap-4 pb-4 md:grid-cols-2 md:gap-5">
        <Reveal>
          <article className="rounded-2xl border border-line/70 bg-paper/90 p-4 shadow-card sm:p-5 md:p-6">
            <h2 className="font-display text-xl text-ink sm:text-2xl">
              <LocalizedText en="Primary contact" zh="主要联系方式" />
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              <LocalizedText
                en="Email is the best way to discuss PhD opportunities and research fit, especially where data and machine learning are combined with domains such as biology, medical vision, robotics, and social applications."
                zh="如需交流博士申请与研究匹配（尤其是数据与机器学习和生物、医疗视觉、机器人及社会应用等领域结合），建议优先通过邮箱联系。"
              />
            </p>
            <Link href={`mailto:${siteProfile.email}`} className="mt-5 inline-flex break-all text-base font-semibold text-accent hover:underline sm:text-lg">
              {siteProfile.emailDisplay}
            </Link>
            <p className="mt-4 text-sm text-muted">
              <LocalizedText en={siteProfile.location} zh={siteProfile.locationZh ?? siteProfile.location} />
            </p>
          </article>
        </Reveal>

        <Reveal delay={0.08}>
          <article className="rounded-2xl border border-line/70 bg-paper/90 p-4 shadow-card sm:p-5 md:p-6">
            <h2 className="font-display text-xl text-ink sm:text-2xl">
              <LocalizedText en="Social and profile links" zh="社交与主页链接" />
            </h2>
            <ul className="mt-4 space-y-3">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-accent"
                  >
                    <span className="rounded-full border border-line px-2 py-1 text-xs text-muted">
                      <LocalizedText en={iconByKey[link.iconKey].en} zh={iconByKey[link.iconKey].zh} />
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        </Reveal>
      </section>
    </Container>
  );
}
