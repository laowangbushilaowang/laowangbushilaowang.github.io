import type { NavLink, SiteProfile } from "@/types/content";

export const siteProfile: SiteProfile = {
  name: "Bohan Wang",
  bilingualName: "王博涵",
  tagline:
    "Early-career researcher and PhD applicant focused on data-centric machine learning, foundation models (LLMs), and interdisciplinary AI.",
  taglineZh: "早期阶段研究者（博士申请中），聚焦数据驱动机器学习、基础模型（大模型）与跨领域 AI。",
  intro:
    "I am an early-career researcher currently applying to PhD programs. I enjoy building data-centric machine learning and LLM-enabled systems, and applying them to interdisciplinary projects across computational biology, medical computer vision, and robotics, including spatial transcriptomics and single-cell analysis.",
  introZh:
    "我是一名正在申请博士项目的早期研究者。我偏好以数据为中心的机器学习与大模型系统，并将其用于跨领域项目，覆盖计算生物学、医疗计算机视觉与机器人，同时关注空间转录组与单细胞分析。",
  hobbies: ["Hiking", "Table Tennis", "Tennis", "Gaming", "Guitar", "Listening to Music"],
  hobbiesZh: ["徒步", "乒乓球", "网球", "游戏", "吉他", "听音乐"],
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
      "Building robust and reusable AI methods for spatial/single-cell omics, with growing emphasis on data-centric ML, LLM-assisted workflows, medical vision, and robot-assisted intelligence.",
    summaryZh: "构建面向空间组学与单细胞组学的稳定可复用 AI 方法，并持续强化数据驱动机器学习、大模型辅助流程、医疗视觉与机器人辅助智能方向。"
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
