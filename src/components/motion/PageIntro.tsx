import { Reveal } from "@/components/motion/Reveal";

type PageIntroProps = {
  title: string;
  description: string;
  eyebrow?: string;
};

export function PageIntro({ title, description, eyebrow }: PageIntroProps) {
  return (
    <section className="pt-10 md:pt-16">
      <Reveal>
        <div className="max-w-3xl space-y-5">
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">{eyebrow}</p> : null}
          <h1 className="font-display text-4xl leading-tight text-ink md:text-5xl">{title}</h1>
          <p className="text-base leading-relaxed text-muted md:text-lg">{description}</p>
        </div>
      </Reveal>
    </section>
  );
}
