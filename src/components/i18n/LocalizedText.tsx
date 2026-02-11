"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

type LocalizedTextProps = {
  en: string;
  zh: string;
};

export function LocalizedText({ en, zh }: LocalizedTextProps) {
  const { lang } = useLanguage();
  return <>{lang === "zh" ? zh : en}</>;
}

type LocalizedNodeProps = {
  en: ReactNode;
  zh: ReactNode;
};

export function LocalizedNode({ en, zh }: LocalizedNodeProps) {
  const { lang } = useLanguage();
  return <>{lang === "zh" ? zh : en}</>;
}
