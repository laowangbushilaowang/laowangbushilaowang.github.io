import { Research, pageMetadata } from "@/components/pages/EditorialPages";
export const metadata = pageMetadata(
  "/zh/research",
  "Research",
  "AI tools, research, and technical notes by Bohan Wang.",
);
export default function Page() {
  return <Research locale="zh" />;
}
