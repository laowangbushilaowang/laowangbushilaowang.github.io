"use client";

import clsx from "clsx";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-md border border-accent/25 bg-paper p-0.5 text-xs font-semibold">
      <button
        type="button"
        onClick={() => setLang("en")}
        className={clsx(
          "rounded px-2 py-1 transition-colors",
          lang === "en" ? "bg-highlightSoft text-accent" : "text-ink/70 hover:bg-accentSoft hover:text-accent"
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
          lang === "zh" ? "bg-highlightSoft text-accent" : "text-ink/70 hover:bg-accentSoft hover:text-accent"
        )}
        aria-pressed={lang === "zh"}
      >
        中文
      </button>
    </div>
  );
}
