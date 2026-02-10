import { Reveal } from "@/components/motion/Reveal";
import { LinkButton } from "@/components/ui/LinkButton";
import { siteProfile } from "@/content/site";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-line/70 bg-paper/90 p-8 shadow-card md:p-12">
      <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-accent/10 blur-3xl" aria-hidden />
      <div className="absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-[#f4c87f]/20 blur-3xl" aria-hidden />

      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">Academic Homepage</p>
      </Reveal>
      <Reveal delay={0.06}>
        <h1 className="mt-4 font-display text-4xl leading-tight text-ink md:text-6xl">
          {siteProfile.name} <span className="text-2xl text-muted md:text-4xl">({siteProfile.bilingualName})</span>
        </h1>
      </Reveal>
      <Reveal delay={0.12}>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ink/90 md:text-xl">{siteProfile.tagline}</p>
      </Reveal>
      <Reveal delay={0.18}>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{siteProfile.intro}</p>
      </Reveal>
      <Reveal delay={0.24}>
        <div className="mt-8 flex flex-wrap gap-3">
          <LinkButton href="/research">Explore Research</LinkButton>
          <LinkButton href="/projects" variant="ghost">
            View Projects
          </LinkButton>
          <LinkButton href="/cv" variant="ghost">
            Open CV
          </LinkButton>
        </div>
      </Reveal>
    </section>
  );
}
