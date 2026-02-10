import clsx from "clsx";

type SectionHeadingProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  className?: string;
};

export function SectionHeading({ title, eyebrow, description, className }: SectionHeadingProps) {
  return (
    <div className={clsx("max-w-3xl space-y-4", className)}>
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">{eyebrow}</p> : null}
      <h2 className="font-display text-3xl leading-tight text-ink md:text-4xl">{title}</h2>
      {description ? <p className="text-base leading-relaxed text-muted md:text-lg">{description}</p> : null}
    </div>
  );
}
