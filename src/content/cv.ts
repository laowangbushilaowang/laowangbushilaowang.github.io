import type { AwardItem, ResearchExperience, SkillGroup } from "@/types/content";

export const researchExperience: ResearchExperience[] = [
  {
    id: "gzlab",
    role: "AI Algorithm Engineer (Research)",
    institution: "Guangzhou Laboratory",
    period: "May 2025-present",
    location: "Guangzhou, China",
    bullets: [
      "Conduct interdisciplinary research at the intersection of AI and computational biology.",
      "Designed spatiotemporal modeling methods for reconstructing continuous 3D+time structures from spatial transcriptomics data.",
      "Developed decomposition methods to separate cell-fate variability from sample-time variability in single-cell RNA-seq.",
      "Built an AI-agent-driven pipeline for literature search, data collection, metadata standardization, and H5AD generation."
    ]
  },
  {
    id: "bu-thesis",
    role: "Master's Thesis Researcher",
    institution: "Boston University",
    period: "2024",
    location: "Boston, USA",
    bullets: [
      "Studied image reconstruction through multiple 1D approximations.",
      "Proposed a greedy plus dimensionality-reduction approach with stronger fine-grained detail recovery than standard approximations."
    ]
  },
  {
    id: "bona-robotics",
    role: "AI Algorithm Engineer (Research Intern)",
    institution: "Guangzhou Bona Robotics Co., Ltd.",
    period: "2022-2023",
    location: "Guangzhou, China",
    bullets: [
      "Improved YOLOv7-based detection accuracy by 5% through architecture and loss refinements.",
      "Migrated training pipelines to Huawei MindSpore and reached the Huawei Ascend AI Innovation Competition final."
    ]
  }
];

export const skillGroups: SkillGroup[] = [
  {
    name: "Programming",
    items: ["Python", "R", "SQL", "C", "Java"]
  },
  {
    name: "Machine Learning",
    items: ["PyTorch", "TensorFlow", "CNNs", "YOLOv7", "Implicit Neural Representations"]
  },
  {
    name: "Computational Biology",
    items: ["Scanpy", "Seurat", "Spatial Transcriptomics", "Trajectory Inference", "AnnData"]
  },
  {
    name: "Systems and Tools",
    items: ["Linux", "Git", "Docker", "Jupyter", "Hadoop/Spark"]
  }
];

export const awards: AwardItem[] = [
  {
    title: "Honorable Mention, Mathematical Contest in Modeling (MCM)",
    date: "2022"
  },
  {
    title: "University Second-Class Scholarship",
    date: "2021, 2022, 2024"
  }
];
