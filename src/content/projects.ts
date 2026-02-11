import type { ProjectItem } from "@/types/content";

export const projects: ProjectItem[] = [
  {
    id: "spatial-neural-field",
    title: "Spatiotemporal Modeling of Spatial Transcriptomics",
    titleZh: "空间转录组的时空建模",
    period: "2025-present",
    periodZh: "2025年至今",
    summary:
      "Designed a neural-field-based framework to reconstruct continuous 3D+time biological structures and support developmental dynamics analysis.",
    summaryZh: "设计基于神经场的框架，重建连续 3D+时间生物结构，支持发育动态分析。",
    tags: ["AI", "Biology", "Spatial Omics", "Neural Fields"],
    tagsZh: ["AI", "生物", "空间组学", "神经场"],
    featured: true
  },
  {
    id: "single-cell-agent-pipeline",
    title: "AI Agent Pipeline for Single-cell Dataset Standardization",
    titleZh: "单细胞数据标准化 AI Agent 流程",
    period: "2025-present",
    periodZh: "2025年至今",
    summary:
      "Built an end-to-end automation workflow from literature search to H5AD-ready datasets for scalable computational biology experiments.",
    summaryZh: "搭建从文献检索到 H5AD 数据产出的自动化流程，支持可扩展的计算生物学实验。",
    tags: ["AI Agent", "Biology", "Data Engineering", "Automation"],
    tagsZh: ["AI Agent", "生物", "数据工程", "自动化"],
    featured: true
  },
  {
    id: "bu-thesis",
    title: "Image Reconstruction Through Multiple 1D Approximations",
    titleZh: "研究多重一维近似图像重建问题",
    period: "2024",
    periodZh: "2024",
    summary:
      "Developed a greedy and dimensionality-reduction algorithm inspired by neural fields, improving detail recovery in reconstructed images.",
    summaryZh: "提出受神经场启发的贪心与降维算法，提升图像重建的细节恢复能力。",
    tags: ["Machine Learning", "Optimization", "Computer Vision"],
    tagsZh: ["机器学习", "优化", "计算机视觉"],
    links: [
      {
        label: "Paper",
        href: "https://open.bu.edu/items/d800558c-a02f-4356-86ea-86290eb0d72a"
      }
    ],
    featured: true
  },
  {
    id: "medical-robotics-cuhk",
    title: "Medical Robotics Image Recognition Module",
    titleZh: "医疗机器人图像识别模块",
    period: "2025",
    periodZh: "2025",
    summary:
      "Developed an image recognition component for robot-assisted medical diagnosis.",
    summaryZh: "参与机器人辅助诊断场景下的图像识别模块开发。",
    tags: ["Medical Robotics", "Computer Vision", "AI"],
    tagsZh: ["医疗机器人", "计算机视觉", "AI"]
  },
  {
    id: "data-days-for-good",
    title: "Data Days for Good at Boston University",
    titleZh: "波士顿大学 Data Days for Good 项目",
    period: "2024",
    periodZh: "2024",
    summary:
      "Built an interactive R Shiny dashboard and NLP workflow to analyze campus-wide survey responses with equity-focused insights.",
    summaryZh: "搭建 R Shiny 可视化与 NLP 分析流程，支持校园调查数据的公平性导向解读。",
    tags: ["Data", "NLP", "Visualization", "R Shiny"],
    tagsZh: ["数据", "NLP", "可视化", "R Shiny"]
  },
  {
    id: "geospatial-fairness",
    title: "Geospatial Fairness in Public Transit",
    titleZh: "公共交通中的地理公平性分析",
    period: "2023",
    periodZh: "2023",
    summary:
      "Analyzed U.S. Census commute data to quantify racial disparities and model post-COVID transit inequities.",
    summaryZh: "基于美国人口普查通勤数据，量化种族差异并分析后疫情时代交通不平等。",
    tags: ["Data", "Geospatial", "Equity Analysis", "Statistics"],
    tagsZh: ["数据", "地理空间", "公平性分析", "统计"]
  },
  {
    id: "mental-health-chatbot",
    title: "NLP Chatbot for Mental Health Support",
    titleZh: "心理健康支持 NLP 聊天机器人",
    period: "2022",
    periodZh: "2022",
    summary:
      "Created a GPT-based chatbot with emotion-aware responses for mental health conversations.",
    summaryZh: "构建基于 GPT 的情绪感知聊天机器人，用于心理健康对话支持。",
    tags: ["NLP", "AI Agent", "Healthcare", "AI"],
    tagsZh: ["NLP", "AI Agent", "医疗健康", "AI"]
  },
  {
    id: "yolov7-robotics",
    title: "YOLOv7 Optimization for Robotic Vision",
    titleZh: "面向机器人视觉的 YOLOv7 优化",
    period: "2022-2023",
    periodZh: "2022-2023",
    summary:
      "Improved detection performance by 5% through architecture and loss redesign; adapted training to Huawei MindSpore on Ascend hardware.",
    summaryZh: "通过模型结构与损失函数优化将检测性能提升 5%，并迁移至华为 MindSpore/Ascend 平台训练。",
    tags: ["Computer Vision", "Robotics", "Deep Learning", "Deployment"],
    tagsZh: ["计算机视觉", "机器人", "深度学习", "部署"]
  }
];
