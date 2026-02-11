"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { navLinks, siteProfile } from "@/content/site";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3 md:px-8">
        <Link href="/" className="inline-flex flex-col leading-none" aria-label="Go to homepage">
          <span className="font-display text-xl text-ink">{siteProfile.name}</span>
          <span className="text-xs text-muted">{siteProfile.bilingualName}</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden md:block">
          <ul className="flex items-center gap-4">
            {navLinks.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={clsx(
                      "text-sm font-medium transition-colors",
                      active ? "text-accent" : "text-ink/80 hover:text-accent"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <nav aria-label="Mobile navigation" className="md:hidden">
          <ul className="scrollbar-none flex gap-2 overflow-x-auto">
            {navLinks.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <li key={link.href} className="shrink-0">
                  <Link
                    href={link.href}
                    className={clsx(
                      "block rounded-md border border-line px-2 py-1 text-xs",
                      active ? "bg-accentSoft text-accent" : "text-ink/80"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
