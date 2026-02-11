"use client";

import clsx from "clsx";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-md border border-line bg-paper p-0.5 text-xs font-semibold">
      <button
        type="button"
        onClick={() => setLang("en")}
        className={clsx(
          "rounded px-2 py-1 transition-colors",
          lang === "en" ? "bg-accentSoft text-accent" : "text-ink/70 hover:text-ink"
        )}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("zh")}
        className={clsx(
          "rounded px-2 py-1 transition-colors",
          lang === "zh" ? "bg-accentSoft text-accent" : "text-ink/70 hover:text-ink"
        )}
        aria-pressed={lang === "zh"}
      >
        中文
      </button>
    </div>
  );
}
