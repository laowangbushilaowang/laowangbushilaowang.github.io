import type { ReactNode } from "react";
import clsx from "clsx";

type SectionHeadingProps = {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  className?: string;
};

export function SectionHeading({ title, eyebrow, description, className }: SectionHeadingProps) {
  return (
    <div className={clsx("max-w-3xl space-y-3 md:space-y-4", className)}>
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/75">{eyebrow}</p> : null}
      <h2 className="font-display text-2xl leading-tight text-accent sm:text-3xl md:text-4xl">{title}</h2>
      {description ? <p className="text-sm leading-relaxed text-muted sm:text-base md:text-lg">{description}</p> : null}
    </div>
  );
}
