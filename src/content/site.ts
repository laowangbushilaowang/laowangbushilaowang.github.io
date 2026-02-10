import type { NavLink, SiteProfile } from "@/types/content";

export const siteProfile: SiteProfile = {
  name: "Bohan Wang",
  bilingualName: "王博涵",
  tagline: "A data-driven researcher passionate about using data and AI to benefit society.",
  intro:
    "I work at the intersection of machine learning and biomedicine, with a focus on computational biology, spatial transcriptomics, and interpretable AI systems.",
  location: "Guangzhou, China",
  email: "wbh@bu.com",
  currentRole: {
    title: "AI Algorithm Engineer (Research)",
    institution: "Guangzhou Laboratory",
    location: "Guangzhou, China",
    startDate: "May 2025",
    summary:
      "Developing AI methods for spatial and single-cell omics, including neural-field-based modeling and automated data curation pipelines."
  }
};

export const navLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/research", label: "Research" },
  { href: "/projects", label: "Projects" },
  { href: "/cv", label: "CV" },
  { href: "/blog", label: "Blog" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" }
];
