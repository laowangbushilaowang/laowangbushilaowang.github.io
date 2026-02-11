import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";

type PageIntroProps = {
  title: ReactNode;
  description: ReactNode;
  eyebrow?: ReactNode;
};

export function PageIntro({ title, description, eyebrow }: PageIntroProps) {
  return (
    <section className="pt-6 md:pt-12">
      <Reveal>
        <div className="max-w-3xl space-y-4 md:space-y-5">
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/75">{eyebrow}</p> : null}
          <h1 className="font-display text-3xl leading-tight text-accent sm:text-4xl md:text-5xl">{title}</h1>
          <p className="text-sm leading-relaxed text-muted sm:text-base md:text-lg">{description}</p>
        </div>
      </Reveal>
    </section>
  );
}
