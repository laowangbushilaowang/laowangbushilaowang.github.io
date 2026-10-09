import type { NavLink, SiteProfile } from "@/types/content";

export const siteProfile: SiteProfile = {
  name: "Bohan Wang",
  bilingualName: "王博涵",
  tagline:
    "AI Algorithm Engineer working on machine learning, biological data, and AI tools.",
  taglineZh: "AI 算法工程师，做机器学习、生物数据和 AI 工具。",
  intro:
    "I am an early-career researcher focused on data-centric machine learning and interdisciplinary projects, with emphasis on AI and robotics while expanding applications in computational biology and medical computer vision, including spatial transcriptomics and single-cell analysis. I also explore AI-agent-enabled workflows for practical automation.",
  introZh:
    "我是一名早期研究者。我的核心方向是数据驱动机器学习与跨领域项目，重点在人工智能与机器人，并拓展计算生物学与医疗计算机视觉的应用，同时关注空间转录组与单细胞分析；此外也探索 AI Agent 在实际自动化中的应用。",
  hobbies: [
    "Hiking",
    "Table Tennis",
    "Tennis",
    "Gaming",
    "Guitar",
    "Listening to Music",
  ],
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
      "Working on single-cell and spatial omics, model evaluation, and AI-assisted data workflows.",
    summaryZh: "围绕单细胞与空间组学、模型评估和 AI 辅助数据流程开展工作。",
  },
};

export const navLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/research", label: "Research" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];
