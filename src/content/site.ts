import type { NavLink, SiteProfile } from "@/types/content";

export const siteProfile: SiteProfile = {
  name: "Bohan Wang",
  bilingualName: "王博涵",
  tagline: "AI engineer and data science researcher.",
  intro:
    "I work on computational biology and machine learning, with interests in spatial transcriptomics, single-cell analysis, and practical AI systems.",
  location: "Guangzhou, China",
  email: "wbh@bu.edu",
  emailDisplay: "wbh at dot bu dot edu",
  currentRole: {
    title: "AI Algorithm Engineer (Research)",
    institution: "Guangzhou Laboratory",
    location: "Guangzhou, China",
    startDate: "May 2025",
    summary: "Building AI methods for spatial and single-cell omics with a focus on robust, reusable workflows."
  }
};

export const navLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/research", label: "Research" },
  { href: "/projects", label: "Projects" },
  { href: "/cv", label: "CV" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" }
];
