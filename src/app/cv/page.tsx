import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageIntro } from "@/components/motion/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import { LocalizedText } from "@/components/i18n/LocalizedText";

export default function CvPage() {
  return (
    <Container className="space-y-10 py-8 md:space-y-16 md:py-14">
      <PageIntro
        eyebrow={<LocalizedText en="Curriculum Vitae" zh="简历" />}
        title={<LocalizedText en="Academic CV" zh="学术简历" />}
        description={
          <LocalizedText
            en="Early-career academic profile: education, research experience, technical skills, and selected achievements."
            zh="早期学术履历：教育背景、研究经历、技术能力与主要成果。"
          />
        }
      />

      <Reveal>
        <Link
          href="/files/Bohan_Wang_CV.pdf"
          target="_blank"
          className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-accent/90 sm:px-5"
        >
          <LocalizedText en="Download PDF CV" zh="下载 PDF 简历" />
        </Link>
      </Reveal>
    </Container>
  );
}
