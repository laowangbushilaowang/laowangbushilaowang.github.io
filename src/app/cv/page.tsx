import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LocalizedText } from "@/components/i18n/LocalizedText";

export default function CvPage() {
  return (
    <Container className="py-10 md:py-16">
      <section className="flex min-h-[45vh] items-center justify-center">
        <Link
          href="/files/Bohan_Wang_CV.pdf"
          target="_blank"
          className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-accent/90 sm:px-5"
        >
          <LocalizedText en="Download PDF CV" zh="下载 PDF 简历" />
        </Link>
      </section>
    </Container>
  );
}
