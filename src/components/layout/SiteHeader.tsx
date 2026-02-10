"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { navLinks, siteProfile } from "@/content/site";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 md:px-10">
        <Link href="/" className="group inline-flex flex-col leading-none" aria-label="Go to homepage">
          <span className="font-display text-xl text-ink transition-colors group-hover:text-accent">{siteProfile.name}</span>
          <span className="text-xs tracking-wide text-muted">{siteProfile.bilingualName}</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={clsx(
                      "rounded-full px-3 py-2 text-sm font-medium transition-colors",
                      active ? "bg-accentSoft text-accent" : "text-ink/80 hover:text-accent"
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

      <nav aria-label="Mobile navigation" className="border-t border-line/70 md:hidden">
        <ul className="scrollbar-none flex overflow-x-auto px-4 py-2">
          {navLinks.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

            return (
              <li key={link.href} className="shrink-0">
                <Link
                  href={link.href}
                  className={clsx(
                    "block rounded-full px-3 py-2 text-sm font-medium",
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
    </header>
  );
}
