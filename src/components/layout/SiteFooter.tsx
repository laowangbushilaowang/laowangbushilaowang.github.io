import Link from "next/link";
import { siteProfile } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line/70 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 text-sm text-muted md:flex-row md:items-center md:px-10">
        <p>
          {new Date().getFullYear()} {siteProfile.name}. Built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/contact" className="transition-colors hover:text-accent">
            Contact
          </Link>
          <Link href="/cv" className="transition-colors hover:text-accent">
            CV
          </Link>
          <Link href="/blog" className="transition-colors hover:text-accent">
            Blog
          </Link>
        </div>
      </div>
    </footer>
  );
}
