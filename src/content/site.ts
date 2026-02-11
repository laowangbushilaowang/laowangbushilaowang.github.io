import type { NavLink, SiteProfile } from "@/types/content";

export const siteProfile: SiteProfile = {
  name: "Bohan Wang",
  bilingualName: "王博涵",
  tagline: "Early-career researcher focused on data-centric machine learning and interdisciplinary AI applications.",
  taglineZh: "早期阶段研究者，主轴是数据驱动机器学习与跨领域 AI 应用。",
  intro:
    "I am an early-career researcher focused on data-centric machine learning and interdisciplinary projects, with emphasis on AI and robotics while expanding applications in computational biology and medical computer vision, including spatial transcriptomics and single-cell analysis. I also explore AI-agent-enabled workflows for practical automation.",
  introZh:
    "我是一名早期研究者。我的核心方向是数据驱动机器学习与跨领域项目，重点在人工智能与机器人，并拓展计算生物学与医疗计算机视觉的应用，同时关注空间转录组与单细胞分析；此外也探索 AI Agent 在实际自动化中的应用。",
  hobbies: ["Hiking", "Table Tennis", "Tennis", "Gaming", "Guitar", "Listening to Music"],
  hobbiesZh: ["徒步", "乒乓球", "网球", "游戏", "吉他", "听音乐"],
  location: "Guangzhou, China",
  locationZh: "中国广州",
  email: "wbh@bu.edu",
  emailDisplay: "wbh at dot bu dot edu",
  currentRole: {
    title: "AI Algorithm Engineer",
    titleZh: "AI 算法工程师",
    institution: "Guangzhou Laboratory",
    institutionZh: "广州实验室",
    location: "Guangzhou, China",
    locationZh: "中国广州",
    startDate: "May 2025",
    startDateZh: "2025年5月",
    summary:
      "Building robust and reusable AI methods for spatial/single-cell omics, with emphasis on data-centric ML, medical vision, and robot-assisted intelligence, while incorporating AI-agent-assisted workflows where useful.",
    summaryZh: "构建面向空间组学与单细胞组学的稳定可复用 AI 方法，重点在数据驱动机器学习、医疗视觉与机器人辅助智能，并在合适场景引入 AI Agent 辅助流程。"
  }
};

export const navLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/research", label: "Research" },
  { href: "/projects", label: "Projects" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" }
];
