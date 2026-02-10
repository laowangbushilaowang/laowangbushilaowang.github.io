import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] items-center py-10 md:py-16">
      <section className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">404</p>
        <h1 className="font-display text-4xl text-ink md:text-5xl">Page not found</h1>
        <p className="max-w-xl text-base leading-relaxed text-muted">
          The page you are looking for does not exist or may have moved. Return to the homepage to continue browsing.
        </p>
        <Link href="/" className="inline-flex rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper transition-colors hover:bg-accent">
          Back to home
        </Link>
      </section>
    </Container>
  );
}
