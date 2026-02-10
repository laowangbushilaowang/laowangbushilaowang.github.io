import type { ProjectItem } from "@/types/content";

export const projects: ProjectItem[] = [
  {
    id: "spatial-neural-field",
    title: "Spatiotemporal Modeling of Spatial Transcriptomics",
    period: "2025-present",
    summary:
      "Designed a neural-field-based framework to reconstruct continuous 3D+time biological structures and support developmental dynamics analysis.",
    tags: ["AI", "Biology", "Spatial Omics", "Neural Fields"],
    featured: true
  },
  {
    id: "single-cell-agent-pipeline",
    title: "AI Agent Pipeline for Single-cell Dataset Standardization",
    period: "2025-present",
    summary:
      "Built an end-to-end automation workflow from literature search to H5AD-ready datasets for scalable computational biology experiments.",
    tags: ["AI Agent", "Biology", "Data Engineering", "Automation"],
    featured: true
  },
  {
    id: "bu-thesis",
    title: "Image Reconstruction Through Multiple 1D Approximations",
    period: "2024",
    summary:
      "Developed a greedy and dimensionality-reduction algorithm inspired by neural fields, improving detail recovery in reconstructed images.",
    tags: ["Machine Learning", "Optimization", "Computer Vision"],
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
    period: "2025",
    summary:
      "Contributed to an image recognition component for robot-assisted medical diagnosis in collaboration with CUHK Medical Robotics Lab.",
    tags: ["Medical Robotics", "Computer Vision", "AI"]
  },
  {
    id: "data-days-for-good",
    title: "Data Days for Good at Boston University",
    period: "2024",
    summary:
      "Built an interactive R Shiny dashboard and NLP workflow to analyze campus-wide survey responses with equity-focused insights.",
    tags: ["Data", "NLP", "Visualization", "R Shiny"]
  },
  {
    id: "geospatial-fairness",
    title: "Geospatial Fairness in Public Transit",
    period: "2023",
    summary:
      "Analyzed U.S. Census commute data to quantify racial disparities and model post-COVID transit inequities.",
    tags: ["Data", "Geospatial", "Social Impact", "Statistics"]
  },
  {
    id: "mental-health-chatbot",
    title: "NLP Chatbot for Mental Health Support",
    period: "2022",
    summary:
      "Created a GPT-based chatbot with emotion-aware responses for mental health conversations.",
    tags: ["NLP", "LLM", "Healthcare", "AI"]
  },
  {
    id: "yolov7-robotics",
    title: "YOLOv7 Optimization for Robotic Vision",
    period: "2022-2023",
    summary:
      "Improved detection performance by 5% through architecture and loss redesign; adapted training to Huawei MindSpore on Ascend hardware.",
    tags: ["Computer Vision", "Robotics", "Deep Learning", "Deployment"]
  }
];
