import type {
  Competency,
  Cv,
  EducationItem,
  Entry,
  ExperienceItem,
  ListItem,
  Profile,
  ReferenceItem,
  Section,
  SectionKind,
  SkillGroup,
} from "../types";
import { BLANK_TEMPLATE_ID, type SectionSeed, type TemplateDef } from "../templates";

export const uid = () => crypto.randomUUID();

export const newExperience = (): ExperienceItem => ({
  id: uid(),
  role: "",
  org: "",
  location: "",
  start: "",
  end: "",
  current: false,
  bullets: "",
});
export const newEducation = (): EducationItem => ({
  id: uid(),
  degree: "",
  institution: "",
  location: "",
  start: "",
  end: "",
  details: "",
});
export const newSkillGroup = (): SkillGroup => ({ id: uid(), label: "", items: "" });
export const newCompetency = (): Competency => ({ id: uid(), title: "", bullets: "" });
export const newEntry = (): Entry => ({ id: uid(), title: "", subtitle: "", date: "", description: "" });
export const newListItem = (): ListItem => ({ id: uid(), text: "" });
export const newReference = (): ReferenceItem => ({ id: uid(), name: "", position: "", phone: "" });

/** Crea una sección vacía (con un elemento en blanco para empezar a escribir). */
export function createSection(seed: SectionSeed): Section {
  const base = { id: uid(), title: seed.title, hint: seed.hint };
  switch (seed.kind) {
    case "text":
      return { ...base, kind: "text", content: "" };
    case "experience":
      return { ...base, kind: "experience", items: [newExperience()], compact: seed.compact };
    case "education":
      return { ...base, kind: "education", items: [newEducation()] };
    case "skills":
      return { ...base, kind: "skills", items: [newSkillGroup()] };
    case "competencies":
      return { ...base, kind: "competencies", items: [newCompetency()] };
    case "entries":
      return { ...base, kind: "entries", items: [newEntry()] };
    case "list":
      return { ...base, kind: "list", items: [newListItem()] };
    case "references":
      return { ...base, kind: "references", items: [newReference()] };
  }
}

export const newItemFor: { [K in SectionKind]: () => unknown } = {
  text: () => null,
  experience: newExperience,
  education: newEducation,
  skills: newSkillGroup,
  competencies: newCompetency,
  entries: newEntry,
  list: newListItem,
  references: newReference,
};

export function createCv(opts: {
  template: TemplateDef | null;
  name: string;
  targetRole: string;
  withSections: boolean;
  profile: Profile;
}): Cv {
  const { template: t, profile } = opts;
  const now = new Date().toISOString();
  return {
    id: uid(),
    name: opts.name,
    templateId: t?.id ?? BLANK_TEMPLATE_ID,
    targetRole: opts.targetRole,
    contact: { email: true, phone: true, location: true, linkIds: profile.links.map((l) => l.id) },
    style: {
      layout: t?.layout ?? "classic",
      accent: t?.accent ?? "#1e3a5f",
      font: t?.font ?? "sans",
      density: "normal",
    },
    sections: t && opts.withSections ? t.sections.map(createSection) : [],
    createdAt: now,
    updatedAt: now,
  };
}

/** Copia profunda con ids nuevos. */
export function duplicateCv(cv: Cv): Cv {
  const copy: Cv = structuredClone(cv);
  const now = new Date().toISOString();
  copy.id = uid();
  copy.name = `${cv.name} (copia)`;
  copy.createdAt = now;
  copy.updatedAt = now;
  copy.sections = copy.sections.map((s) => {
    const next = { ...s, id: uid() } as Section;
    if ("items" in next) next.items = next.items.map((it) => ({ ...it, id: uid() })) as never;
    return next;
  });
  return copy;
}
