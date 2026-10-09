"use client";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { localizedPath, type Locale } from "@/lib/locale";
export type AppLanguage = Locale;
const LanguageContext = createContext<{
  lang: Locale;
  setLang: (lang: Locale) => void;
} | null>(null);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const lang: Locale = /^\/zh(?:\/|$)/.test(pathname) ? "zh" : "en";
  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);
  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang: (value) => router.push(localizedPath(pathname, value)),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("LanguageProvider is missing");
  return value;
}
