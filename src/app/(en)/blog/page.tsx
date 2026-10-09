import { Blog, pageMetadata } from "@/components/pages/EditorialPages";
export const metadata = pageMetadata(
  "/blog",
  "Blog",
  "AI tools, research, and technical notes by Bohan Wang.",
);
export default function Page() {
  return <Blog locale="en" />;
}
