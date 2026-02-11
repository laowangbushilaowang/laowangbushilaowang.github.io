export type SiteProfile = {
  name: string;
  bilingualName: string;
  tagline: string;
  taglineZh?: string;
  intro: string;
  introZh?: string;
  location: string;
  locationZh?: string;
  email: string;
  emailDisplay: string;
  currentRole: {
    title: string;
    titleZh?: string;
    institution: string;
    institutionZh?: string;
    location: string;
    locationZh?: string;
    startDate: string;
    startDateZh?: string;
    summary: string;
    summaryZh?: string;
  };
};

export type NavLink = {
  href: string;
  label: string;
};

export type EducationEntry = {
  id: string;
  degree: string;
  degreeZh?: string;
  institution: string;
  institutionZh?: string;
  location: string;
  locationZh?: string;
  startDate: string;
  startDateZh?: string;
  endDate: string;
  endDateZh?: string;
  highlights: string[];
  highlightsZh?: string[];
};

export type ResearchTheme = {
  id: string;
  title: string;
  titleZh?: string;
  summary: string;
  summaryZh?: string;
  keywords: string[];
  keywordsZh?: string[];
  methods: string[];
  methodsZh?: string[];
  applications: string[];
  applicationsZh?: string[];
  publicationIds?: string[];
};

export type ProjectLink = {
  label: string;
  href: string;
};

export type ProjectItem = {
  id: string;
  title: string;
  titleZh?: string;
  period: string;
  periodZh?: string;
  summary: string;
  summaryZh?: string;
  tags: string[];
  tagsZh?: string[];
  links?: ProjectLink[];
  featured?: boolean;
};

export type NewsItem = {
  date: string;
  title: string;
  titleZh?: string;
  description: string;
  descriptionZh?: string;
  href?: string;
};

export type SocialLink = {
  label: string;
  href: string;
  iconKey: "email" | "github" | "linkedin" | "scholar";
};

export type PublicationItem = {
  id: string;
  title: string;
  venue: string;
  year: number;
  authors: string[];
  links?: ProjectLink[];
};

export type ResearchExperience = {
  id: string;
  role: string;
  roleZh?: string;
  institution: string;
  institutionZh?: string;
  period: string;
  periodZh?: string;
  location: string;
  locationZh?: string;
  bullets: string[];
  bulletsZh?: string[];
};

export type SkillGroup = {
  name: string;
  nameZh?: string;
  items: string[];
  itemsZh?: string[];
};

export type AwardItem = {
  title: string;
  titleZh?: string;
  date: string;
  dateZh?: string;
  note?: string;
  noteZh?: string;
};
