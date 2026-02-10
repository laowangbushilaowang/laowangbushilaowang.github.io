import Link from "next/link";
import clsx from "clsx";
import type { PropsWithChildren } from "react";

type LinkButtonProps = PropsWithChildren<{
  href: string;
  variant?: "solid" | "ghost";
  className?: string;
}>;

export function LinkButton({ href, variant = "solid", className, children }: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        variant === "solid"
          ? "bg-ink text-paper hover:-translate-y-0.5 hover:bg-accent"
          : "border border-line bg-paper/80 text-ink hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent",
        className
      )}
    >
      {children}
    </Link>
  );
}
