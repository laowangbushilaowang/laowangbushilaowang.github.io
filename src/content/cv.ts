import type { AwardItem, ResearchExperience, SkillGroup } from "@/types/content";

export const researchExperience: ResearchExperience[] = [
  {
    id: "gzlab",
    role: "AI Algorithm Engineer (Research)",
    roleZh: "AI 算法工程师（研究）",
    institution: "Guangzhou Laboratory",
    institutionZh: "广州实验室",
    period: "May 2025-present",
    periodZh: "2025年5月至今",
    location: "Guangzhou, China",
    locationZh: "中国广州",
    bullets: [
      "Worked on computational biology and data-centric machine learning projects.",
      "Supported AI-agent workflow development and research compute environment maintenance."
    ],
    bulletsZh: [
      "参与计算生物学与数据驱动机器学习相关研究项目。",
      "参与 AI Agent 流程开发与研究算力环境维护。"
    ]
  },
  {
    id: "bu-thesis",
    role: "Master's Thesis Researcher",
    roleZh: "硕士论文研究者",
    institution: "Boston University",
    institutionZh: "波士顿大学",
    period: "2024",
    periodZh: "2024",
    location: "Boston, USA",
    locationZh: "美国波士顿",
    bullets: [
      "Studied image reconstruction through multiple 1D approximations.",
      "Proposed a greedy plus dimensionality-reduction approach with stronger fine-grained detail recovery than standard approximations."
    ],
    bulletsZh: ["研究多重一维近似图像重建问题。", "提出贪心结合降维的方法，在细粒度细节恢复上优于传统近似方法。"]
  },
  {
    id: "bona-robotics",
    role: "AI Algorithm R&D Intern",
    roleZh: "AI 算法研发实习生",
    institution: "Guangzhou Bona Robotics Co., Ltd.",
    institutionZh: "广州博依特机器人有限公司",
    period: "Jul 2022-Feb 2023",
    periodZh: "2022年7月-2023年2月",
    location: "Guangzhou, China",
    locationZh: "中国广州",
    bullets: [
      "Contributed to robotic vision model development and deployment.",
      "Supported model optimization and framework migration tasks."
    ],
    bulletsZh: [
      "参与机器人视觉模型开发与部署。",
      "参与模型优化与框架迁移相关工作。"
    ]
  }
];

export const skillGroups: SkillGroup[] = [
  {
    name: "Programming",
    nameZh: "编程语言",
    items: ["Python", "R", "SQL", "C", "Java"]
  },
  {
    name: "Machine Learning",
    nameZh: "机器学习",
    items: ["PyTorch", "TensorFlow", "CNNs", "YOLOv7", "Implicit Neural Representations"]
  },
  {
    name: "Computational Biology",
    nameZh: "计算生物学",
    items: ["Scanpy", "Seurat", "Spatial Transcriptomics", "Trajectory Inference", "AnnData"]
  },
  {
    name: "Systems and Tools",
    nameZh: "系统与工具",
    items: ["Linux", "Git", "Docker", "Jupyter", "Hadoop/Spark"]
  }
];

export const awards: AwardItem[] = [
  {
    title: "Honorable Mention, Mathematical Contest in Modeling (MCM)",
    titleZh: "美国大学生数学建模竞赛（MCM）荣誉奖",
    date: "2022"
  }
];
