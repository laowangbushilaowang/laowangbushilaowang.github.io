import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageIntro } from "@/components/motion/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import { socialLinks } from "@/content/social";
import { siteProfile } from "@/content/site";

const iconByKey: Record<string, string> = {
  email: "Email",
  github: "GitHub",
  linkedin: "LinkedIn",
  scholar: "Scholar"
};

export default function ContactPage() {
  return (
    <Container className="space-y-16 py-10 md:py-16">
      <PageIntro
        eyebrow="Contact"
        title="Get in touch"
        description="I welcome conversations about PhD opportunities, research collaborations, and interdisciplinary AI projects."
      />

      <section className="grid gap-5 pb-4 md:grid-cols-2">
        <Reveal>
          <article className="rounded-2xl border border-line/70 bg-paper/90 p-6 shadow-card">
            <h2 className="font-display text-2xl text-ink">Primary contact</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              For research collaborations or academic inquiries, email is the preferred channel.
            </p>
            <Link href={`mailto:${siteProfile.email}`} className="mt-5 inline-flex text-lg font-semibold text-accent hover:underline">
              {siteProfile.email}
            </Link>
            <p className="mt-4 text-sm text-muted">{siteProfile.location}</p>
          </article>
        </Reveal>

        <Reveal delay={0.08}>
          <article className="rounded-2xl border border-line/70 bg-paper/90 p-6 shadow-card">
            <h2 className="font-display text-2xl text-ink">Social and profile links</h2>
            <ul className="mt-4 space-y-3">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-accent"
                  >
                    <span className="rounded-full border border-line px-2 py-1 text-xs text-muted">{iconByKey[link.iconKey]}</span>
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
