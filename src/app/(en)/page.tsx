import { Home, pageMetadata } from "@/components/pages/EditorialPages";
export const metadata = pageMetadata(
  "/",
  "AI Builder & Researcher",
  "AI tools, research, and technical notes by Bohan Wang.",
);
export default function Page() {
  return <Home locale="en" />;
}
