import { Reveal } from "@/components/motion/Reveal";
import { siteProfile } from "@/content/site";

export function CurrentFocus() {
  return (
    <Reveal>
      <section className="rounded-2xl border border-line/70 bg-gradient-to-r from-paper to-accentSoft/35 p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Current Focus</p>
        <h2 className="mt-3 font-display text-2xl text-ink md:text-3xl">
          {siteProfile.currentRole.title} at {siteProfile.currentRole.institution}
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">{siteProfile.currentRole.summary}</p>
        <p className="mt-4 text-sm font-medium text-ink/75">
          Since {siteProfile.currentRole.startDate} | {siteProfile.currentRole.location}
        </p>
      </section>
    </Reveal>
  );
}
