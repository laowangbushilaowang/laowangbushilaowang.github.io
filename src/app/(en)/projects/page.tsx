import { Projects, pageMetadata } from "@/components/pages/EditorialPages";
export const metadata = pageMetadata(
  "/projects",
  "Projects",
  "AI tools, research, and technical notes by Bohan Wang.",
);
export default function Page() {
  return <Projects locale="en" />;
}
