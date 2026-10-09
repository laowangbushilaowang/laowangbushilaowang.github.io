import { Article, articleMetadata } from "@/components/pages/EditorialPages";
import { getAllPosts } from "@/lib/blog";
export const dynamicParams = false;
export function generateStaticParams() {
  return getAllPosts("zh").map((p) => ({ slug: p.slug }));
}
export function generateMetadata({ params }: { params: { slug: string } }) {
  return articleMetadata(params.slug, "zh");
}
export default function Page({ params }: { params: { slug: string } }) {
  return <Article slug={params.slug} locale="zh" />;
}
