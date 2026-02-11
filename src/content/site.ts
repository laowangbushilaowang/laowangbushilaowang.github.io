import type { NavLink, SiteProfile } from "@/types/content";

export const siteProfile: SiteProfile = {
  name: "Bohan Wang",
  bilingualName: "王博涵",
  tagline: "Early-career AI researcher and PhD applicant in computational biology, medical vision, and robotics.",
  taglineZh: "早期阶段 AI 研究者（博士申请中），研究方向包括计算生物学、医疗视觉与机器人。",
  intro:
    "I am an early-career researcher currently applying to PhD programs. My work combines computational biology, medical computer vision, and robotics-oriented AI systems, with interests in spatial transcriptomics and single-cell analysis.",
  introZh:
    "我是一名正在申请博士项目的早期研究者。当前工作融合计算生物学、医疗计算机视觉与机器人相关 AI 系统，同时关注空间转录组与单细胞分析。",
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
    summary:
      "Building robust and reusable AI methods for spatial/single-cell omics, while extending research toward medical vision and robot-assisted intelligence.",
    summaryZh: "构建面向空间组学与单细胞组学的稳定可复用 AI 方法，并拓展到医疗视觉与机器人辅助智能方向。"
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
