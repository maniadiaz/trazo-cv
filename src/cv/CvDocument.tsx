import type { CSSProperties, ReactNode } from "react";
import type {
  Competency,
  Cv,
  EducationItem,
  Entry,
  ExperienceItem,
  Layout,
  ListItem,
  Profile,
  Section,
  SkillGroup,
} from "../types";
import { FONTS } from "../templates";
import "./cv.css";

type Props = {
  cv: Cv;
  profile: Profile;
  /** En la vista previa se muestran las secciones vacías atenuadas; al exportar se omiten. */
  preview?: boolean;
};

// ---------- utilidades de texto ----------

const lines = (text: string) =>
  text
    .split("\n")
    .map((l) => l.replace(/^\s*[-•*·]\s*/, "").trim())
    .filter(Boolean);

const range = (start: string, end: string, current = false) =>
  [start.trim(), current ? "Actualidad" : end.trim()].filter(Boolean).join(" – ");

const join = (...parts: string[]) => parts.map((p) => p.trim()).filter(Boolean).join(", ");

export const prettyUrl = (url: string) =>
  url.trim().replace(/^https?:\/\/(www\.)?/i, "").replace(/^www\./i, "").replace(/\/+$/, "");
const toHref = (url: string) => (/^(https?:|mailto:)/.test(url.trim()) ? url.trim() : `https://${url.trim()}`);

const isFilled = (item: object) =>
  Object.entries(item).some(([k, v]) => k !== "id" && typeof v === "string" && v.trim() !== "");

export const sectionHasContent = (s: Section) =>
  s.kind === "text" ? s.content.trim() !== "" : (s.items as object[]).some(isFilled);

function Bullets({ text }: { text: string }) {
  const ls = lines(text);
  if (!ls.length) return null;
  return (
    <ul>
      {ls.map((l, i) => (
        <li key={i}>{l}</li>
      ))}
    </ul>
  );
}

/** Una sola línea → párrafo; varias líneas → viñetas. */
function Rich({ text }: { text: string }) {
  const ls = lines(text);
  if (!ls.length) return null;
  if (ls.length === 1) return <p className="cv-desc">{ls[0]}</p>;
  return <Bullets text={text} />;
}

// ---------- bloques por tipo de sección ----------

function Experience({ item, layout, compact }: { item: ExperienceItem; layout: Layout; compact?: boolean }) {
  const dates = range(item.start, item.end, item.current);
  const where = join(item.org, item.location);
  const bullets = compact ? null : <Bullets text={item.bullets} />;

  if (layout === "harvard")
    return (
      <div className="cv-item">
        <div className="cv-row">
          <strong>{item.org}</strong>
          <span>{item.location}</span>
        </div>
        <div className="cv-row">
          <em>{item.role}</em>
          <span className="cv-date">{dates}</span>
        </div>
        {bullets}
      </div>
    );

  if (layout === "cambridge")
    return (
      <div className="cv-item cv-dated">
        <div className="cv-when">{dates}</div>
        <div>
          <strong>{item.role}</strong>
          {where && <span className="cv-sub">{item.role ? ", " : ""}{where}</span>}
          {bullets}
        </div>
      </div>
    );

  if (compact)
    return (
      <div className="cv-item cv-row">
        <span>
          <strong>{item.role}</strong>
          {where && <span className="cv-sub">{item.role ? " · " : ""}{where}</span>}
        </span>
        <span className="cv-date">{dates}</span>
      </div>
    );

  return (
    <div className="cv-item">
      <div className="cv-row">
        <strong>{item.role}</strong>
        <span className="cv-date">{dates}</span>
      </div>
      {where && <div className="cv-sub">{where}</div>}
      {bullets}
    </div>
  );
}

function Education({ item, layout }: { item: EducationItem; layout: Layout }) {
  const dates = range(item.start, item.end);
  const where = join(item.institution, item.location);

  if (layout === "harvard")
    return (
      <div className="cv-item">
        <div className="cv-row">
          <strong>{item.institution}</strong>
          <span>{item.location}</span>
        </div>
        <div className="cv-row">
          <em>{item.degree}</em>
          <span className="cv-date">{dates}</span>
        </div>
        <Rich text={item.details} />
      </div>
    );

  if (layout === "cambridge")
    return (
      <div className="cv-item cv-dated">
        <div className="cv-when">{dates}</div>
        <div>
          <strong>{item.degree}</strong>
          {where && <div className="cv-sub">{where}</div>}
          <Rich text={item.details} />
        </div>
      </div>
    );

  return (
    <div className="cv-item">
      <div className="cv-row">
        <strong>{item.degree}</strong>
        <span className="cv-date">{dates}</span>
      </div>
      {where && <div className="cv-sub">{where}</div>}
      <Rich text={item.details} />
    </div>
  );
}

function EntryBlock({ item, layout }: { item: Entry; layout: Layout }) {
  if (layout === "cambridge")
    return (
      <div className="cv-item cv-dated">
        <div className="cv-when">{item.date}</div>
        <div>
          <strong>{item.title}</strong>
          {item.subtitle && <span className="cv-sub">{item.title ? ", " : ""}{item.subtitle}</span>}
          <Rich text={item.description} />
        </div>
      </div>
    );

  return (
    <div className="cv-item">
      <div className="cv-row">
        <span>
          <strong>{item.title}</strong>
          {item.subtitle && <span className="cv-sub">{item.title ? " — " : ""}{item.subtitle}</span>}
        </span>
        <span className="cv-date">{item.date}</span>
      </div>
      <Rich text={item.description} />
    </div>
  );
}

function Skills({ items, sidebar }: { items: SkillGroup[]; sidebar: boolean }) {
  const filled = items.filter(isFilled);
  if (sidebar)
    return (
      <>
        {filled.map((g) => (
          <div key={g.id} className="cv-skill-block">
            {g.label && <div className="cv-skill-label">{g.label}</div>}
            <div className="cv-chips">
              {g.items
                .split(/[,;\n]/)
                .map((s) => s.trim())
                .filter(Boolean)
                .map((s, i) => (
                  <span key={i} className="cv-chip">
                    {s}
                  </span>
                ))}
            </div>
          </div>
        ))}
      </>
    );
  return (
    <>
      {filled.map((g) => (
        <p key={g.id} className="cv-skill">
          {g.label && <strong>{g.label}: </strong>}
          {g.items.split("\n").join(", ")}
        </p>
      ))}
    </>
  );
}

function Competencies({ items }: { items: Competency[] }) {
  return (
    <>
      {items.filter(isFilled).map((c) => (
        <div key={c.id} className="cv-item">
          {c.title && <strong>{c.title}</strong>}
          <Bullets text={c.bullets} />
        </div>
      ))}
    </>
  );
}

function List({ items, sidebar }: { items: ListItem[]; sidebar: boolean }) {
  return (
    <ul className={sidebar ? "cv-list-plain" : "cv-list"}>
      {items
        .filter(isFilled)
        .map((it) => (
          <li key={it.id}>{it.text}</li>
        ))}
    </ul>
  );
}

function SectionBody({ section, layout, sidebar }: { section: Section; layout: Layout; sidebar: boolean }) {
  const indent = (node: ReactNode) => (layout === "cambridge" && !sidebar ? <div className="cv-indent">{node}</div> : node);
  switch (section.kind) {
    case "text":
      return indent(
        section.content
          .split(/\n\s*\n/)
          .filter((p) => p.trim())
          .map((p, i) => (
            <p key={i} className="cv-para">
              {p.trim()}
            </p>
          )),
      );
    case "experience":
      return (
        <>
          {section.items.filter(isFilled).map((it) => (
            <Experience key={it.id} item={it} layout={layout} compact={section.compact} />
          ))}
        </>
      );
    case "education":
      return (
        <>
          {section.items.filter(isFilled).map((it) => (
            <Education key={it.id} item={it} layout={layout} />
          ))}
        </>
      );
    case "entries":
      return (
        <>
          {section.items.filter(isFilled).map((it) => (
            <EntryBlock key={it.id} item={it} layout={layout} />
          ))}
        </>
      );
    case "skills":
      return indent(<Skills items={section.items} sidebar={sidebar} />);
    case "competencies":
      return indent(<Competencies items={section.items} />);
    case "list":
      return indent(<List items={section.items} sidebar={sidebar} />);
  }
}

function SectionBlock({
  section,
  layout,
  preview,
  sidebar = false,
}: {
  section: Section;
  layout: Layout;
  preview: boolean;
  sidebar?: boolean;
}) {
  const filled = sectionHasContent(section);
  if (!filled && !preview) return null;
  return (
    <section className={`cv-section${filled ? "" : " cv-empty"}`}>
      <h2 className="cv-h2">{section.title || "Sin título"}</h2>
      {filled ? (
        <SectionBody section={section} layout={layout} sidebar={sidebar} />
      ) : (
        <p className="cv-placeholder">Sección vacía (no aparecerá en el PDF)</p>
      )}
    </section>
  );
}

// ---------- documento ----------

type ContactItem = { key: string; text: string; href?: string };

function contactItems(cv: Cv, profile: Profile): ContactItem[] {
  const items: ContactItem[] = [];
  if (cv.contact.email && profile.email.trim())
    items.push({ key: "email", text: profile.email.trim(), href: `mailto:${profile.email.trim()}` });
  if (cv.contact.phone && profile.phone.trim())
    items.push({ key: "phone", text: profile.phone.trim(), href: `tel:${profile.phone.replace(/[^\d+]/g, "")}` });
  if (cv.contact.location && profile.location.trim()) items.push({ key: "location", text: profile.location.trim() });
  for (const link of profile.links) {
    if (!cv.contact.linkIds.includes(link.id) || !link.url.trim()) continue;
    items.push({ key: link.id, text: prettyUrl(link.url), href: toHref(link.url) });
  }
  return items;
}

const ContactLink = ({ item }: { item: ContactItem }) =>
  item.href ? (
    <a href={item.href} target="_blank" rel="noreferrer">
      {item.text}
    </a>
  ) : (
    <span>{item.text}</span>
  );

const SIDEBAR_KINDS = new Set<Section["kind"]>(["skills", "list"]);

export default function CvDocument({ cv, profile, preview = false }: Props) {
  const { layout, accent, font, density } = cv.style;
  const sections = cv.sections.filter((s) => !s.hidden);
  const contact = contactItems(cv, profile);
  const name = profile.name.trim();
  const style = {
    "--accent": accent,
    "--cv-font": FONTS.find((f) => f.id === font)?.css,
  } as CSSProperties;

  const header = (
    <header className="cv-header">
      <h1 className={`cv-name${name ? "" : " cv-empty"}`}>{name || "Tu nombre"}</h1>
      {cv.targetRole.trim() && <div className="cv-role">{cv.targetRole.trim()}</div>}
      {layout !== "modern" && contact.length > 0 && (
        <div className="cv-contact">
          {contact.map((c) => (
            <ContactLink key={c.key} item={c} />
          ))}
        </div>
      )}
    </header>
  );

  return (
    <article className={`cv l-${layout} f-${font} d-${density}`} style={style}>
      {header}
      {layout === "modern" ? (
        <div className="cv-columns">
          <div className="cv-main">
            {sections
              .filter((s) => !SIDEBAR_KINDS.has(s.kind))
              .map((s) => (
                <SectionBlock key={s.id} section={s} layout={layout} preview={preview} />
              ))}
          </div>
          <aside className="cv-side">
            {contact.length > 0 && (
              <section className="cv-section">
                <h2 className="cv-h2">Contacto</h2>
                <ul className="cv-list-plain cv-contact-list">
                  {contact.map((c) => (
                    <li key={c.key}>
                      <ContactLink item={c} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {sections
              .filter((s) => SIDEBAR_KINDS.has(s.kind))
              .map((s) => (
                <SectionBlock key={s.id} section={s} layout={layout} preview={preview} sidebar />
              ))}
          </aside>
        </div>
      ) : (
        sections.map((s) => <SectionBlock key={s.id} section={s} layout={layout} preview={preview} />)
      )}
    </article>
  );
}
