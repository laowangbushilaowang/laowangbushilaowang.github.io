import type { ResearchTheme } from "@/types/content";

export const researchThemes: ResearchTheme[] = [
  {
    id: "comp-bio-ai",
    title: "Computational Biology and AI",
    titleZh: "计算生物学与 AI",
    summary:
      "I build machine learning methods for single-cell and spatial transcriptomics to reveal cellular dynamics and tissue organization in development and disease.",
    summaryZh: "围绕单细胞与空间转录组数据构建机器学习方法，刻画发育与疾病中的细胞动态和组织结构。",
    keywords: ["Single-cell RNA-seq", "Spatial transcriptomics", "Trajectory inference"],
    keywordsZh: ["单细胞 RNA 测序", "空间转录组", "轨迹推断"],
    methods: ["Factor decomposition", "Correlation structure modeling", "Representation learning"],
    methodsZh: ["因子分解", "相关结构建模", "表征学习"],
    applications: ["Cell-state transition analysis", "Multi-sample biological integration"],
    applicationsZh: ["细胞状态转变分析", "多样本生物数据整合"]
  },
  {
    id: "ml-neural-fields",
    title: "Machine Learning and Neural Fields",
    titleZh: "机器学习与神经场",
    summary:
      "I explore continuous neural representations for spatiotemporal data reconstruction, combining geometric priors and differentiable interpolation.",
    summaryZh: "探索连续神经表示在时空数据重建中的应用，结合几何先验与可微插值提升重建质量。",
    keywords: ["Implicit neural representations", "Neural fields", "Spatiotemporal learning"],
    keywordsZh: ["隐式神经表示", "神经场", "时空学习"],
    methods: ["Continuous coordinate modeling", "Gradient-based analysis", "Dimensionality reduction"],
    methodsZh: ["连续坐标建模", "梯度分析", "降维方法"],
    applications: ["3D+time biological reconstruction", "Fine-grained structure recovery"],
    applicationsZh: ["3D+时间生物结构重建", "细粒度结构恢复"]
  },
  {
    id: "biomedical-ai",
    title: "Cross-disciplinary Biomedical AI",
    titleZh: "跨学科生物医学 AI",
    summary:
      "I design robust, interpretable AI pipelines that connect biological data, medical computer vision, and clinical context for data-driven healthcare research.",
    summaryZh: "构建稳健且可解释的 AI 流程，联通生物数据、医疗计算机视觉与临床信息，支持数据驱动的医疗研究。",
    keywords: ["Medical computer vision", "Biomedical image analysis", "Data-driven healthcare"],
    keywordsZh: ["医疗计算机视觉", "生物医学影像分析", "数据驱动医疗"],
    methods: ["Multi-modal feature fusion", "Uncertainty-aware modeling", "Data curation automation"],
    methodsZh: ["多模态特征融合", "不确定性感知建模", "数据整理自动化"],
    applications: ["Clinical decision support", "Biomedical discovery workflows"],
    applicationsZh: ["临床决策支持", "生物医学发现流程"]
  },
  {
    id: "ai-robotics",
    title: "AI and Robotics",
    titleZh: "AI 与机器人",
    summary:
      "I investigate practical perception pipelines for robotics, especially robot vision for medical and lab-assistance scenarios.",
    summaryZh: "研究面向机器人的实用感知流程，重点关注医疗与实验室辅助场景下的机器人视觉。",
    keywords: ["Robot vision", "Medical robotics", "Autonomous systems"],
    keywordsZh: ["机器人视觉", "医疗机器人", "自主系统"],
    methods: ["Detection model optimization", "Attention modules", "Edge deployment"],
    methodsZh: ["检测模型优化", "注意力模块", "边缘部署"],
    applications: ["Service robots", "Robot-assisted medical diagnosis"],
    applicationsZh: ["服务机器人", "机器人辅助医疗诊断"]
  }
];
