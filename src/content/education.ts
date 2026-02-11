import type { EducationEntry } from "@/types/content";

export const education: EducationEntry[] = [
  {
    id: "bu-ms",
    degree: "Master of Science in Data Science",
    institution: "Boston University",
    location: "Boston, USA",
    startDate: "September 2023",
    endDate: "February 2025",
    highlights: [
      "Master's thesis: Image Reconstruction Through Multiple 1D Approximations",
      "Data Days for Good project collaboration with BU Spark and MassMutual"
    ]
  },
  {
    id: "hkbu-bsc",
    degree: "BSc (Hons) in Data Science",
    institution: "Hong Kong Baptist University (United International College)",
    location: "Zhuhai, China",
    startDate: "September 2019",
    endDate: "June 2023",
    highlights: [
      "Bachelor's thesis: Multi-stage Image Restoration with Neural Networks",
      "Strong coursework in statistics, machine learning, algorithms, and cloud computing"
    ]
  }
];
