export type SiteProfile = {
  name: string;
  bilingualName: string;
  tagline: string;
  intro: string;
  location: string;
  email: string;
  emailDisplay: string;
  currentRole: {
    title: string;
    institution: string;
    location: string;
    startDate: string;
    summary: string;
  };
};

export type NavLink = {
  href: string;
  label: string;
};

export type EducationEntry = {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  highlights: string[];
};

export type ResearchTheme = {
  id: string;
  title: string;
  summary: string;
  keywords: string[];
  methods: string[];
  applications: string[];
  publicationIds?: string[];
};

export type ProjectLink = {
  label: string;
  href: string;
};

export type ProjectItem = {
  id: string;
  title: string;
  period: string;
  summary: string;
  tags: string[];
  links?: ProjectLink[];
  featured?: boolean;
};

export type NewsItem = {
  date: string;
  title: string;
  description: string;
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
  institution: string;
  period: string;
  location: string;
  bullets: string[];
};

export type SkillGroup = {
  name: string;
  items: string[];
};

export type AwardItem = {
  title: string;
  date: string;
  note?: string;
};
