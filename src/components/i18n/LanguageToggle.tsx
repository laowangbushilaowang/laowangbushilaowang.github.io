"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import { localizedPath } from "@/lib/locale";
export function LanguageToggle() {
  const { lang } = useLanguage();
  const pathname = usePathname();
  return (
    <Link
      className="language-toggle"
      href={localizedPath(pathname, lang === "en" ? "zh" : "en")}
      hrefLang={lang === "en" ? "zh-CN" : "en"}
      aria-label={
        lang === "en" ? "阅读当前页面的中文版" : "Read this page in English"
      }
    >
      {lang === "en" ? "中文" : "EN"}
      <span aria-hidden> ↗</span>
    </Link>
  );
}
