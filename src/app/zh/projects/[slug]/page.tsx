import { Project, pageMetadata } from "@/components/pages/EditorialPages";
import { projects } from "@/content/projects";
import { localizedPath } from "@/lib/locale";
export const dynamicParams = false;
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.id }));
}
export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = projects.find((p) => p.id === params.slug);
  return p
    ? pageMetadata(
        localizedPath(`/projects/${p.id}`, "zh"),
        p.titleZh || p.title,
        p.summaryZh || p.summary,
      )
    : {};
}
export default function Page({ params }: { params: { slug: string } }) {
  return <Project slug={params.slug} locale="zh" />;
}
