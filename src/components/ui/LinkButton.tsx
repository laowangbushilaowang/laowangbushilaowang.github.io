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
          ? "bg-accent text-paper shadow-[0_8px_20px_-14px_rgba(47,93,140,0.7)] hover:-translate-y-0.5 hover:bg-accent/90"
          : "border border-accent/25 bg-paper/85 text-accent hover:-translate-y-0.5 hover:border-highlight/70 hover:bg-highlightSoft",
        className
      )}
    >
      {children}
    </Link>
  );
}
