import type { NavLink, SiteProfile } from "@/types/content";

export const siteProfile: SiteProfile = {
  name: "Bohan Wang",
  bilingualName: "王博涵",
  tagline: "AI engineer and data science researcher.",
  taglineZh: "人工智能工程师与数据科学研究者。",
  intro:
    "I work on computational biology and machine learning, with interests in spatial transcriptomics, single-cell analysis, and practical AI systems.",
  introZh: "我主要研究计算生物学与机器学习，关注空间转录组、单细胞分析以及可落地的 AI 系统。",
  location: "Guangzhou, China",
  locationZh: "中国广州",
  email: "wbh@bu.edu",
  emailDisplay: "wbh at dot bu dot edu",
  currentRole: {
    title: "AI Algorithm Engineer (Research)",
    titleZh: "AI 算法工程师（研究）",
    institution: "Guangzhou Laboratory",
    institutionZh: "广州实验室",
    location: "Guangzhou, China",
    locationZh: "中国广州",
    startDate: "May 2025",
    startDateZh: "2025年5月",
    summary: "Building AI methods for spatial and single-cell omics with a focus on robust, reusable workflows.",
    summaryZh: "面向空间组学与单细胞组学构建稳定、可复用的 AI 研究流程。"
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
