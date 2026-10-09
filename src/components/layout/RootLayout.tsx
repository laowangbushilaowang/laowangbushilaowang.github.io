import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import "@/app/globals.css";
import "katex/dist/katex.min.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { siteProfile } from "@/content/site";

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://laowangbushilaowang.github.io";

export const metadata: Metadata = {
  title: `${siteProfile.name} | AI Builder & Researcher`,
  description: siteProfile.tagline,
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: `${siteProfile.name} | AI Builder & Researcher`,
    description: siteProfile.tagline,
    type: "website",
  },
};

export default function RootLayout({
  children,
  locale,
}: Readonly<{
  locale: "en" | "zh";
  children: ReactNode;
}>) {
  return (
    <html
      lang={locale === "zh" ? "zh-CN" : "en"}
      className={`${displayFont.variable} ${sansFont.variable}`}
    >
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <a
          href="#main-content"
          className="skip-link sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to main content
        </a>
        <LanguageProvider>
          <div className="relative z-10">
            <SiteHeader />
            <main id="main-content">{children}</main>
            <SiteFooter />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
