"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { navLinks, siteProfile } from "@/content/site";

const navLabelByHref: Record<string, { en: string; zh: string }> = {
  "/": { en: "Home", zh: "首页" },
  "/about": { en: "About", zh: "关于" },
  "/research": { en: "Research", zh: "研究" },
  "/projects": { en: "Projects", zh: "项目" },
  "/cv": { en: "CV", zh: "简历" },
  "/blog": { en: "Blog", zh: "博客" },
  "/news": { en: "News", zh: "动态" },
  "/contact": { en: "Contact", zh: "联系" }
};

export function SiteHeader() {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const menuButtonLabel = lang === "zh" ? (mobileMenuOpen ? "收起" : "菜单") : mobileMenuOpen ? "Close" : "Menu";

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-[rgba(248,250,253,0.86)] shadow-[0_12px_28px_-24px_rgba(47,93,140,0.45)] backdrop-blur-xl supports-[backdrop-filter]:bg-[rgba(248,250,253,0.72)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 md:gap-6 md:px-8 md:py-3">
        <Link href="/" className="inline-flex max-w-[62vw] flex-col leading-none sm:max-w-none" aria-label="Go to homepage">
          <span className="truncate font-display text-lg text-accent md:text-xl">{siteProfile.name}</span>
          <span className="text-xs text-muted">{siteProfile.bilingualName}</span>
        </Link>

        <div className="hidden items-center gap-5 md:flex">
          <nav aria-label="Main navigation">
            <ul className="flex items-center gap-4">
              {navLinks.map((link) => {
                const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                const translated = navLabelByHref[link.href] ?? { en: link.label, zh: link.label };
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={clsx(
                        "text-sm font-medium transition-colors",
                        active ? "text-accent" : "text-ink/80 hover:text-accent"
                      )}
                    >
                      {lang === "zh" ? translated.zh : translated.en}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <LanguageToggle />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded-md border border-accent/30 bg-paper/80 px-2 py-1 text-xs font-semibold text-accent transition-colors hover:border-highlight/70 hover:bg-highlightSoft"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-site-nav"
            aria-label={menuButtonLabel}
          >
            {menuButtonLabel}
          </button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <nav
          id="mobile-site-nav"
          aria-label="Mobile navigation"
          className="border-t border-line bg-[rgba(248,250,253,0.92)] backdrop-blur-xl supports-[backdrop-filter]:bg-[rgba(248,250,253,0.78)] md:hidden"
        >
          <ul className="space-y-1 px-4 py-2.5 sm:px-6">
            {navLinks.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              const translated = navLabelByHref[link.href] ?? { en: link.label, zh: link.label };
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={clsx(
                      "block rounded-md border border-line px-3 py-2 text-sm",
                      active
                        ? "border-highlight/60 bg-highlightSoft font-semibold text-accent"
                        : "text-ink/80 hover:border-accent/35 hover:text-accent"
                    )}
                  >
                    {lang === "zh" ? translated.zh : translated.en}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
