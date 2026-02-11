import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LocalizedText } from "@/components/i18n/LocalizedText";

export default function NotFound() {
  return (
    <Container className="flex min-h-[55vh] items-center py-8 md:min-h-[60vh] md:py-16">
      <section className="space-y-4 md:space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">404</p>
        <h1 className="font-display text-3xl text-accent sm:text-4xl md:text-5xl">
          <LocalizedText en="Page not found" zh="页面不存在" />
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          <LocalizedText
            en="The page you are looking for does not exist or may have moved. Return to the homepage to continue browsing."
            zh="你访问的页面不存在或已被移动，请返回首页继续浏览。"
          />
        </p>
        <Link href="/" className="inline-flex rounded-full bg-accent px-5 py-2 text-sm font-semibold text-paper transition-colors hover:bg-accent/90">
          <LocalizedText en="Back to home" zh="返回首页" />
        </Link>
      </section>
    </Container>
  );
}
