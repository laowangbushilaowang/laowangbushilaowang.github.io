import type { EducationEntry } from "@/types/content";

export const education: EducationEntry[] = [
  {
    id: "bu-ms",
    degree: "Master of Science in Data Science",
    degreeZh: "数据科学硕士",
    institution: "Boston University",
    institutionZh: "波士顿大学",
    location: "Boston, USA",
    locationZh: "美国波士顿",
    startDate: "September 2023",
    startDateZh: "2023年9月",
    endDate: "February 2025",
    endDateZh: "2025年2月",
    highlights: [
      "Master's thesis: Image Reconstruction Through Multiple 1D Approximations",
      "Data Days for Good project collaboration with BU Spark and MassMutual"
    ],
    highlightsZh: ["硕士论文：基于多重一维近似的图像重建", "参与 Data Days for Good，与 BU Spark 和 MassMutual 协作项目"]
  },
  {
    id: "hkbu-bsc",
    degree: "BSc (Hons) in Data Science",
    degreeZh: "数据科学荣誉学士",
    institution: "Hong Kong Baptist University (United International College)",
    institutionZh: "香港浸会大学（北京师范大学-香港浸会大学联合国际学院）",
    location: "Zhuhai, China",
    locationZh: "中国珠海",
    startDate: "September 2019",
    startDateZh: "2019年9月",
    endDate: "June 2023",
    endDateZh: "2023年6月",
    highlights: [
      "Bachelor's thesis: Multi-stage Image Restoration with Neural Networks",
      "Strong coursework in statistics, machine learning, algorithms, and cloud computing"
    ],
    highlightsZh: ["本科论文：基于神经网络的多阶段图像修复", "系统学习统计学、机器学习、算法与云计算课程"]
  }
];
