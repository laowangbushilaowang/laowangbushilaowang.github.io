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
      "Conduct interdisciplinary research at the intersection of AI and computational biology.",
      "Designed spatiotemporal modeling methods for reconstructing continuous 3D+time structures from spatial transcriptomics data.",
      "Developed decomposition methods to separate cell-fate variability from sample-time variability in single-cell RNA-seq.",
      "Built an AI-agent-driven pipeline for literature search, data collection, metadata standardization, and H5AD generation."
    ],
    bulletsZh: [
      "开展 AI 与计算生物学交叉研究。",
      "设计时空建模方法，从空间转录组数据重建连续 3D+时间结构。",
      "构建分解方法，区分单细胞 RNA-seq 中细胞命运差异与样本时间差异。",
      "搭建 AI Agent 驱动流程，覆盖文献检索、数据采集、元数据标准化与 H5AD 生成。"
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
    role: "AI Algorithm Engineer (Research Intern)",
    roleZh: "AI 算法工程师（研究实习）",
    institution: "Guangzhou Bona Robotics Co., Ltd.",
    institutionZh: "广州博依特机器人有限公司",
    period: "2022-2023",
    periodZh: "2022-2023",
    location: "Guangzhou, China",
    locationZh: "中国广州",
    bullets: [
      "Improved YOLOv7-based detection accuracy by 5% through architecture and loss refinements.",
      "Migrated training pipelines to Huawei MindSpore and reached the Huawei Ascend AI Innovation Competition final."
    ],
    bulletsZh: ["通过模型结构与损失优化将 YOLOv7 检测准确率提升约 5%。", "迁移训练流程到华为 MindSpore，并进入华为昇腾 AI 创新大赛决赛。"]
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
  },
  {
    title: "University Second-Class Scholarship",
    titleZh: "大学二等奖学金",
    date: "2021, 2022, 2024"
  }
];
