import type { CvFont, Layout, SectionKind } from "./types";

export type SectionSeed = { kind: SectionKind; title: string; hint?: string; compact?: boolean };

export type TemplateDef = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  idealFor: string[];
  avoidIf?: string;
  layout: Layout;
  accent: string;
  font: CvFont;
  sections: SectionSeed[];
};

const H = {
  perfil: "2–4 líneas: quién eres, cuántos años de experiencia tienes y qué aportas al puesto. Adáptalo a cada oferta.",
  experiencia:
    "Del trabajo más reciente al más antiguo. Un logro por línea, empezando con un verbo de acción (Lideré, Reduje, Implementé…) y con cifras cuando puedas.",
  educacion: "Título, institución y fechas. Añade detalles solo si suman: promedio, tesis, honores, cursos relevantes.",
  habilidades: "Agrupa por categoría (Técnicas, Herramientas, Blandas…) y sepáralas con comas.",
  idiomas: "Un idioma por línea con su nivel: «Inglés — C1», «Portugués — Básico».",
};

export const TEMPLATES: TemplateDef[] = [
  {
    id: "cronologico",
    name: "Cronológico",
    tagline: "Tu trayectoria, de lo más reciente a lo más antiguo",
    description:
      "El formato más usado y el que mejor leen los reclutadores y los sistemas ATS. Muestra con claridad cómo ha crecido tu carrera.",
    idealFor: ["Experiencia continua en el mismo campo", "Ascensos o crecimiento visible", "Sin periodos largos sin trabajo"],
    avoidIf: "Tienes huecos laborales largos o vienes de otro sector.",
    layout: "classic",
    accent: "#1e3a5f",
    font: "sans",
    sections: [
      { kind: "text", title: "Perfil profesional", hint: H.perfil },
      { kind: "experience", title: "Experiencia laboral", hint: H.experiencia },
      { kind: "education", title: "Educación", hint: H.educacion },
      { kind: "skills", title: "Habilidades", hint: H.habilidades },
      { kind: "list", title: "Idiomas", hint: H.idiomas },
    ],
  },
  {
    id: "funcional",
    name: "Funcional",
    tagline: "Lo que sabes hacer, antes que dónde lo hiciste",
    description:
      "Organiza el CV por áreas de competencia con sus logros. El historial laboral queda al final y en versión breve.",
    idealFor: ["Cambio de carrera o de sector", "Periodos sin trabajo", "Trabajos muy distintos entre sí"],
    avoidIf: "Postulas a sectores muy tradicionales: algunos reclutadores desconfían si no ven fechas claras.",
    layout: "classic",
    accent: "#0f5c55",
    font: "sans",
    sections: [
      { kind: "text", title: "Perfil profesional", hint: H.perfil },
      {
        kind: "competencies",
        title: "Competencias clave",
        hint: "Crea 3–4 áreas (p. ej. «Gestión de proyectos», «Atención al cliente») y bajo cada una 2–4 logros concretos, sin importar en qué trabajo los conseguiste.",
      },
      { kind: "skills", title: "Habilidades técnicas", hint: H.habilidades },
      {
        kind: "experience",
        title: "Historial laboral",
        compact: true,
        hint: "Solo puesto, empresa y fechas: los detalles ya están en tus competencias.",
      },
      { kind: "education", title: "Educación", hint: H.educacion },
      { kind: "list", title: "Idiomas", hint: H.idiomas },
    ],
  },
  {
    id: "mixto",
    name: "Mixto (cronológico-funcional)",
    tagline: "Logros destacados + trayectoria detallada",
    description:
      "Abre con tus competencias y logros más fuertes y luego muestra la experiencia en orden cronológico. Lo mejor de ambos formatos.",
    idealFor: ["Experiencia variada con logros destacables", "Perfiles senior o técnicos", "Destacar habilidades sin ocultar el historial"],
    layout: "modern",
    accent: "#4c1d95",
    font: "sans",
    sections: [
      { kind: "text", title: "Perfil profesional", hint: H.perfil },
      {
        kind: "competencies",
        title: "Logros destacados",
        hint: "3–5 logros de alto impacto de toda tu carrera, agrupados por área si quieres.",
      },
      { kind: "experience", title: "Experiencia profesional", hint: H.experiencia },
      { kind: "education", title: "Educación", hint: H.educacion },
      { kind: "entries", title: "Certificaciones", hint: "Nombre, entidad emisora y año." },
      { kind: "skills", title: "Competencias", hint: H.habilidades },
      { kind: "list", title: "Idiomas", hint: H.idiomas },
    ],
  },
  {
    id: "harvard",
    name: "Harvard",
    tagline: "Sobrio, académico y a una página",
    description:
      "Basado en la guía de la oficina de carreras de Harvard: una columna, tipografía serif, sin foto ni gráficos. Educación primero si estudias o acabas de egresar.",
    idealFor: ["Estudiantes y recién egresados", "Consultoría, finanzas, derecho", "Posgrados y empresas grandes"],
    avoidIf: "Buscas un puesto creativo donde el diseño también cuenta.",
    layout: "harvard",
    accent: "#111111",
    font: "garamond",
    sections: [
      {
        kind: "education",
        title: "Educación",
        hint: "Institución y ciudad arriba; título y fecha de graduación debajo. Promedio, honores o cursos relevantes como detalles.",
      },
      {
        kind: "experience",
        title: "Experiencia",
        hint: "Organización y ciudad arriba; puesto y fechas debajo. Frases con verbo de acción, sin «yo» ni pronombres. Máximo una página en total.",
      },
      { kind: "entries", title: "Liderazgo y actividades", hint: "Clubes, voluntariado, representación estudiantil, deportes…" },
      {
        kind: "skills",
        title: "Habilidades e intereses",
        hint: "Una línea por categoría: Técnicas, Idiomas, Laboratorio, Intereses.",
      },
    ],
  },
  {
    id: "cambridge",
    name: "Cambridge",
    tagline: "Estilo británico: fechas en columna y secciones claras",
    description:
      "Inspirado en los modelos del Careers Service de la Universidad de Cambridge. Muy usado en Reino Unido y Europa: perfil personal, fechas alineadas a la izquierda, intereses y referencias.",
    idealFor: ["Postulaciones en Reino Unido o Europa", "Perfiles académicos o de investigación", "Prácticas y programas de posgrado"],
    layout: "cambridge",
    accent: "#1f4e5f",
    font: "serif",
    sections: [
      { kind: "text", title: "Perfil personal", hint: H.perfil },
      { kind: "education", title: "Educación", hint: H.educacion },
      { kind: "experience", title: "Experiencia laboral", hint: H.experiencia },
      { kind: "skills", title: "Habilidades", hint: H.habilidades },
      { kind: "entries", title: "Logros y premios", hint: "Becas, premios, publicaciones o reconocimientos." },
      { kind: "list", title: "Intereses", hint: "Pocos y concretos: mejor «Maratonista (3 maratones)» que «Deporte»." },
      { kind: "references", title: "Referencias", hint: "Personas que pueden hablar de tu trabajo: exjefes, profesores o clientes. Pídeles permiso antes de incluirlas." },
    ],
  },
  {
    id: "primer-empleo",
    name: "Primer empleo",
    tagline: "Para cuando la experiencia todavía es poca",
    description:
      "Pone por delante tu formación, proyectos y habilidades. Prácticas, voluntariado y trabajos de medio tiempo también cuentan.",
    idealFor: ["Estudiantes", "Primer trabajo o prácticas", "Bootcamps y proyectos personales"],
    layout: "modern",
    accent: "#0e7490",
    font: "sans",
    sections: [
      { kind: "text", title: "Objetivo profesional", hint: "Qué buscas y qué puedes aportar, en 2–3 líneas." },
      { kind: "education", title: "Educación", hint: H.educacion },
      {
        kind: "entries",
        title: "Proyectos",
        hint: "Nombre del proyecto, tecnologías o tu rol, enlace (GitHub, demo) y qué lograste.",
      },
      { kind: "experience", title: "Prácticas y voluntariado", hint: H.experiencia },
      { kind: "skills", title: "Habilidades", hint: H.habilidades },
      { kind: "list", title: "Idiomas", hint: H.idiomas },
    ],
  },
];

export const BLANK_TEMPLATE_ID = "blanco";

export const templateName = (id: string) =>
  TEMPLATES.find((t) => t.id === id)?.name ?? (id === BLANK_TEMPLATE_ID ? "En blanco" : id);

export const SITUATIONS = [
  { id: "estudiante", label: "Estudiante o sin experiencia", recommend: ["primer-empleo", "harvard", "funcional"] },
  { id: "continua", label: "Experiencia continua en mi área", recommend: ["cronologico", "mixto", "harvard"] },
  { id: "cambio", label: "Cambio de carrera o huecos laborales", recommend: ["funcional", "mixto"] },
  { id: "senior", label: "Mucha experiencia y logros destacables", recommend: ["mixto", "cronologico"] },
  { id: "europa", label: "Reino Unido, Europa o academia", recommend: ["cambridge", "harvard"] },
];

export const SECTION_PRESETS: SectionSeed[] = [
  { kind: "text", title: "Perfil profesional", hint: H.perfil },
  { kind: "experience", title: "Experiencia laboral", hint: H.experiencia },
  { kind: "education", title: "Educación", hint: H.educacion },
  { kind: "skills", title: "Habilidades", hint: H.habilidades },
  { kind: "competencies", title: "Competencias clave", hint: "Áreas de competencia con 2–4 logros cada una." },
  { kind: "entries", title: "Proyectos", hint: "Nombre, tecnologías o rol, enlace y resultado." },
  { kind: "entries", title: "Certificaciones", hint: "Nombre, entidad emisora y año." },
  { kind: "entries", title: "Cursos", hint: "Nombre del curso, plataforma o institución y año." },
  { kind: "entries", title: "Voluntariado", hint: "Organización, tu rol y qué aportaste." },
  { kind: "entries", title: "Premios", hint: "Premio, quién lo otorga y año." },
  { kind: "entries", title: "Publicaciones", hint: "Título, revista o medio y año." },
  { kind: "list", title: "Idiomas", hint: H.idiomas },
  { kind: "list", title: "Intereses" },
  { kind: "references", title: "Referencias", hint: "Personas que pueden hablar de tu trabajo: exjefes, profesores o clientes. Pídeles permiso antes de incluirlas." },
  { kind: "text", title: "Texto libre" },
  { kind: "list", title: "Lista libre" },
];

export const KIND_LABEL: Record<SectionKind, string> = {
  text: "Texto",
  experience: "Experiencia",
  education: "Educación",
  skills: "Habilidades",
  competencies: "Competencias",
  entries: "Entradas",
  list: "Lista",
  references: "Referencias",
};

export const LAYOUTS: { id: Layout; name: string; description: string }[] = [
  { id: "classic", name: "Clásico", description: "Una columna, encabezado con línea de color" },
  { id: "harvard", name: "Harvard", description: "Centrado, serif, sin adornos" },
  { id: "cambridge", name: "Cambridge", description: "Fechas en columna a la izquierda" },
  { id: "modern", name: "Moderno", description: "Dos columnas con barra lateral" },
];

export const FONTS: { id: CvFont; name: string; css: string }[] = [
  { id: "sans", name: "Inter", css: "'Inter Variable', Arial, sans-serif" },
  { id: "serif", name: "Source Serif", css: "'Source Serif 4 Variable', Georgia, serif" },
  { id: "garamond", name: "EB Garamond", css: "'EB Garamond Variable', Garamond, serif" },
];

export const ACCENTS = ["#111111", "#1e3a5f", "#1f4e5f", "#0f5c55", "#0e7490", "#4c1d95", "#6416f5", "#9f1239", "#b45309"];
