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

function ItemIcon({ type }: { type: "location" | "email" | "github" | "linkedin" }) {
  const common = "h-5 w-5 text-accent";

  if (type === "location") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
        <path d="M12 21s-6-5.58-6-10a6 6 0 1 1 12 0c0 4.42-6 10-6 10Z" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="11" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  if (type === "email") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
        <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="m5 7 7 5 7-5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  if (type === "github") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
        <path
          d="M12 4a8 8 0 0 0-2.53 15.59c.4.08.54-.17.54-.38v-1.35c-2.2.48-2.67-1.05-2.67-1.05-.36-.9-.88-1.13-.88-1.13-.72-.49.06-.48.06-.48.8.06 1.22.82 1.22.82.7 1.19 1.85.85 2.3.65.07-.51.28-.85.5-1.04-1.76-.2-3.61-.88-3.61-3.9 0-.86.31-1.56.82-2.11-.08-.2-.35-1.01.08-2.11 0 0 .67-.22 2.2.8a7.6 7.6 0 0 1 4 0c1.53-1.02 2.2-.8 2.2-.8.43 1.1.16 1.91.08 2.11.51.55.82 1.25.82 2.11 0 3.03-1.86 3.7-3.64 3.89.29.25.54.73.54 1.48v2.2c0 .21.14.47.55.38A8 8 0 0 0 12 4Z"
          stroke="currentColor"
          strokeWidth="1.3"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10.5c0-1.6 1.3-2.9 2.9-2.9h2.2c1.6 0 2.9 1.3 2.9 2.9v3c0 1.6-1.3 2.9-2.9 2.9h-2.2C9.3 16.4 8 15.1 8 13.5v-3Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

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

      <Reveal>
        <section className="max-w-3xl rounded-2xl border border-line/70 bg-paper/90 p-4 shadow-card sm:p-5 md:p-7">
          <ul className="space-y-4">
            <li className="flex items-start gap-3 border-b border-line/60 pb-4">
              <span className="mt-0.5">
                <ItemIcon type="location" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-accent">
                  <LocalizedText en="Location" zh="地点" />
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  <LocalizedText en={siteProfile.location} zh={siteProfile.locationZh ?? siteProfile.location} />
                </p>
              </div>
            </li>

            {socialLinks.map((link) => (
              <li key={link.iconKey} className="flex items-start gap-3 border-b border-line/60 pb-4 last:border-b-0 last:pb-0">
                <span className="mt-0.5">
                  <ItemIcon type={link.iconKey === "email" ? "email" : link.iconKey === "github" ? "github" : "linkedin"} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-accent">
                    <LocalizedText en={iconByKey[link.iconKey].en} zh={iconByKey[link.iconKey].zh} />
                  </p>
                  {link.iconKey === "email" ? (
                    <p className="mt-1 text-sm break-all text-muted">{link.label}</p>
                  ) : (
                    <Link href={link.href} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent">
                      {link.label}
                      <span aria-hidden>↗</span>
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </Reveal>
    </Container>
  );
}
