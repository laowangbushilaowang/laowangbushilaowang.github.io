import type { ResearchTheme } from "@/types/content";

export const researchThemes: ResearchTheme[] = [
  {
    id: "comp-bio-ai",
    title: "Computational Biology and AI",
    summary:
      "I build machine learning methods for single-cell and spatial transcriptomics to reveal cellular dynamics and tissue organization in development and disease.",
    keywords: ["Single-cell RNA-seq", "Spatial transcriptomics", "Trajectory inference"],
    methods: ["Factor decomposition", "Correlation structure modeling", "Representation learning"],
    applications: ["Cell-state transition analysis", "Multi-sample biological integration"]
  },
  {
    id: "ml-neural-fields",
    title: "Machine Learning and Neural Fields",
    summary:
      "I explore continuous neural representations for spatiotemporal data reconstruction, combining geometric priors and differentiable interpolation.",
    keywords: ["Implicit neural representations", "Neural fields", "Spatiotemporal learning"],
    methods: ["Continuous coordinate modeling", "Gradient-based analysis", "Dimensionality reduction"],
    applications: ["3D+time biological reconstruction", "Fine-grained structure recovery"]
  },
  {
    id: "biomedical-ai",
    title: "Cross-disciplinary Biomedical AI",
    summary:
      "I design robust, interpretable AI pipelines that connect biological data, imaging, and clinical context for data-driven healthcare research.",
    keywords: ["Biomedical image analysis", "Data-driven healthcare", "Interpretability"],
    methods: ["Multi-modal feature fusion", "Uncertainty-aware modeling", "Data curation automation"],
    applications: ["Clinical decision support", "Biomedical discovery workflows"]
  },
  {
    id: "ai-robotics",
    title: "AI and Robotics",
    summary:
      "I investigate practical computer vision and perception pipelines for robotics, with interests in autonomous systems and medical robotics.",
    keywords: ["Computer vision", "Object detection", "Autonomous systems"],
    methods: ["Detection model optimization", "Attention modules", "Edge deployment"],
    applications: ["Service robots", "Robot-assisted medical diagnosis"]
  }
];
