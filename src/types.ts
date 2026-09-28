export type LinkItem = { id: string; label: string; url: string };

/** Datos que se reutilizan en todos los CV. */
export type Profile = {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  links: LinkItem[];
};

export type ExperienceItem = {
  id: string;
  role: string;
  org: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  bullets: string;
};

export type EducationItem = {
  id: string;
  degree: string;
  institution: string;
  location: string;
  start: string;
  end: string;
  details: string;
};

export type SkillGroup = { id: string; label: string; items: string };
export type Competency = { id: string; title: string; bullets: string };
export type Entry = { id: string; title: string; subtitle: string; date: string; description: string };
export type ListItem = { id: string; text: string };

type SectionBase = { id: string; title: string; hint?: string; hidden?: boolean };

export type Section =
  | (SectionBase & { kind: "text"; content: string })
  | (SectionBase & { kind: "experience"; items: ExperienceItem[]; compact?: boolean })
  | (SectionBase & { kind: "education"; items: EducationItem[] })
  | (SectionBase & { kind: "skills"; items: SkillGroup[] })
  | (SectionBase & { kind: "competencies"; items: Competency[] })
  | (SectionBase & { kind: "entries"; items: Entry[] })
  | (SectionBase & { kind: "list"; items: ListItem[] });

export type SectionKind = Section["kind"];

export type Layout = "classic" | "harvard" | "cambridge" | "modern";
export type CvFont = "sans" | "serif" | "garamond";

export type CvStyle = {
  layout: Layout;
  accent: string;
  font: CvFont;
  density: "normal" | "compact";
};

export type Cv = {
  id: string;
  name: string;
  templateId: string;
  targetRole: string;
  contact: { email: boolean; phone: boolean; location: boolean; linkIds: string[] };
  style: CvStyle;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
};

export type AppData = { profile: Profile; cvs: Cv[] };
