import RootLayout from "@/components/layout/RootLayout";
import type { ReactNode } from "react";
export { metadata } from "@/components/layout/RootLayout";
export default function Layout({ children }: { children: ReactNode }) {
  return <RootLayout locale="en">{children}</RootLayout>;
}
