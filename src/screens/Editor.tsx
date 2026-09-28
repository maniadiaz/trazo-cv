import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Download, FolderOpen, Loader2, Palette, PenLine, Plus, UserRound, X } from "lucide-react";
import type { Cv, CvStyle, Profile, Section } from "../types";
import type { View } from "../App";
import { ACCENTS, FONTS, KIND_LABEL, LAYOUTS, SECTION_PRESETS, TEMPLATES } from "../templates";
import { createSection } from "../lib/factory";
import { api, isElectron } from "../lib/api";
import CvDocument, { prettyUrl } from "../cv/CvDocument";
import Preview from "../cv/Preview";
import { Button, Checkbox, Glass, TextInput, cn } from "../components/ui";
import SectionCard from "./SectionCard";

type Props = { cv: Cv; profile: Profile; onChange: (cv: Cv) => void; go: (v: View) => void };

export default function Editor({ cv, profile, onChange, go }: Props) {
  const [tab, setTab] = useState<"content" | "design">("content");
  const [saving, setSaving] = useState(false);
  const [pages, setPages] = useState(1);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<{ text: string; path?: string } | null>(null);
  const [exporting, setExporting] = useState(false);

  // ---------- guardado automático (500 ms después del último cambio) ----------
  const latest = useRef(cv);
  const saved = useRef(cv);
  latest.current = cv;
  useEffect(() => {
    if (cv === saved.current) return;
    setSaving(true);
    const t = setTimeout(async () => {
      saved.current = latest.current;
      await api.saveCv(latest.current);
      setSaving(false);
    }, 500);
    return () => clearTimeout(t);
  }, [cv]);
  // Si se sale del editor antes de que se dispare el guardado, se guarda al desmontar.
  useEffect(
    () => () => {
      if (latest.current !== saved.current) api.saveCv(latest.current);
    },
    [],
  );

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 7000);
    return () => clearTimeout(t);
  }, [toast]);

  const update = (patch: Partial<Cv>) => onChange({ ...cv, ...patch, updatedAt: new Date().toISOString() });
  const setStyle = (patch: Partial<CvStyle>) => update({ style: { ...cv.style, ...patch } });
  const setSections = (sections: Section[]) => update({ sections });
  const setContact = (patch: Partial<Cv["contact"]>) => update({ contact: { ...cv.contact, ...patch } });

  const moveSection = (i: number, dir: -1 | 1) => {
    const next = [...cv.sections];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    setSections(next);
  };

  const exportPdf = async () => {
    setExporting(true);
    try {
      const file = await api.exportPdf([profile.name.trim(), cv.name.trim()].filter(Boolean).join(" - ") || "CV");
      if (file) setToast({ text: "PDF guardado", path: file });
    } catch (e) {
      setToast({ text: `No se pudo exportar: ${String(e)}` });
    } finally {
      setExporting(false);
    }
  };

  const template = TEMPLATES.find((t) => t.id === cv.templateId);

  return (
    <div className="flex h-full flex-col">
      {/* ---------- barra superior ---------- */}
      <header className="flex items-center gap-3 border-b border-white/10 bg-black/30 px-4 py-3 backdrop-blur-xl">
        <Button variant="ghost" onClick={() => go({ name: "home" })}>
          <ArrowLeft className="size-4" /> Mis CV
        </Button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <PenLine className="size-4 shrink-0 text-white/35" />
          <input
            value={cv.name}
            onChange={(e) => update({ name: e.target.value })}
            aria-label="Nombre del CV"
            className="min-w-0 flex-1 rounded-md bg-transparent px-2 py-1 font-display text-2xl font-semibold text-amber-50 outline-none focus:bg-white/5"
          />
        </div>
        <span className="flex items-center gap-1.5 text-xs text-white/45">
          {saving ? (
            <>
              <Loader2 className="size-3.5 animate-spin" /> Guardando…
            </>
          ) : (
            <>
              <Check className="size-3.5 text-emerald-300" /> Guardado
            </>
          )}
        </span>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs",
            pages > 1 && cv.style.layout === "harvard" ? "bg-amber-400/20 text-amber-200" : "bg-white/8 text-white/60",
          )}
          title="Estimación de páginas del PDF"
        >
          ≈ {pages} {pages === 1 ? "página" : "páginas"}
        </span>
        <Button variant="primary" onClick={exportPdf} disabled={exporting}>
          {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          {isElectron ? "Exportar PDF" : "Imprimir / PDF"}
        </Button>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ---------- panel de edición ---------- */}
        <aside className="flex w-[560px] shrink-0 flex-col border-r border-white/10 bg-black/20">
          <div className="flex gap-1 p-3">
            {(
              [
                { id: "content", label: "Contenido", icon: PenLine },
                { id: "design", label: "Diseño", icon: Palette },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full py-2 text-sm transition",
                  tab === t.id ? "text-white" : "text-white/50 hover:text-white/80",
                )}
              >
                {tab === t.id && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full border border-white/15 bg-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <t.icon className="relative size-4" />
                <span className="relative">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-10">
            {tab === "content" ? (
              <div className="flex flex-col gap-4">
                {/* encabezado */}
                <Glass className="flex flex-col gap-4 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-semibold text-amber-50">Encabezado</h3>
                    <Button variant="ghost" className="py-1 text-xs" onClick={() => go({ name: "profile" })}>
                      <UserRound className="size-3.5" /> Editar mis datos
                    </Button>
                  </div>
                  <TextInput
                    label="Puesto al que postulas"
                    value={cv.targetRole}
                    onChange={(e) => update({ targetRole: e.target.value })}
                    placeholder={profile.headline || "Desarrollador Frontend"}
                  />
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-white/55">Datos de contacto a mostrar</span>
                    {!profile.name && !profile.email && !profile.phone && profile.links.length === 0 && (
                      <p className="text-xs text-amber-200/70">Aún no has rellenado «Mis datos».</p>
                    )}
                    {profile.email && (
                      <Checkbox checked={cv.contact.email} onChange={(email) => setContact({ email })} label={profile.email} />
                    )}
                    {profile.phone && (
                      <Checkbox checked={cv.contact.phone} onChange={(phone) => setContact({ phone })} label={profile.phone} />
                    )}
                    {profile.location && (
                      <Checkbox
                        checked={cv.contact.location}
                        onChange={(location) => setContact({ location })}
                        label={profile.location}
                      />
                    )}
                    {profile.links
                      .filter((l) => l.url.trim())
                      .map((l) => (
                        <Checkbox
                          key={l.id}
                          checked={cv.contact.linkIds.includes(l.id)}
                          onChange={(on) =>
                            setContact({
                              linkIds: on ? [...cv.contact.linkIds, l.id] : cv.contact.linkIds.filter((x) => x !== l.id),
                            })
                          }
                          label={
                            <>
                              <span className="text-white/45">{l.label || "Enlace"}:</span> {prettyUrl(l.url)}
                            </>
                          }
                        />
                      ))}
                  </div>
                </Glass>

                {/* secciones */}
                {cv.sections.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-white/50">
                    Este CV no tiene secciones todavía. Añade la primera abajo.
                  </p>
                )}
                <AnimatePresence initial={false}>
                  {cv.sections.map((s, i) => (
                    <motion.div
                      key={s.id}
                      layout="position"
                      initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, x: -20, filter: "blur(6px)" }}
                      transition={{ duration: 0.25 }}
                    >
                      <SectionCard
                        section={s}
                        index={i}
                        count={cv.sections.length}
                        onChange={(next) => setSections(cv.sections.map((x) => (x.id === s.id ? next : x)))}
                        onMove={(dir) => moveSection(i, dir)}
                        onRemove={() => setSections(cv.sections.filter((x) => x.id !== s.id))}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* añadir sección */}
                {adding ? (
                  <Glass className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-medium text-white/80">¿Qué sección quieres añadir?</h3>
                      <button
                        onClick={() => setAdding(false)}
                        className="cursor-pointer text-white/50 hover:text-white"
                        aria-label="Cerrar"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {SECTION_PRESETS.map((p) => (
                        <button
                          key={p.title}
                          onClick={() => {
                            setSections([...cv.sections, createSection(p)]);
                            setAdding(false);
                          }}
                          className="cursor-pointer rounded-lg border border-white/10 px-3 py-2 text-left text-sm text-white/80 transition hover:border-accent/60 hover:bg-accent/15"
                        >
                          {p.title}
                          <span className="block text-[11px] text-white/40">{KIND_LABEL[p.kind]}</span>
                        </button>
                      ))}
                    </div>
                  </Glass>
                ) : (
                  <Button className="self-center" onClick={() => setAdding(true)}>
                    <Plus className="size-4" /> Añadir sección
                  </Button>
                )}
              </div>
            ) : (
              <DesignPanel style={cv.style} setStyle={setStyle} templateName={template?.name} idealFor={template?.idealFor} />
            )}
          </div>
        </aside>

        {/* ---------- vista previa ---------- */}
        <main className="min-w-0 flex-1 bg-black/25">
          <Preview cv={cv} profile={profile} onPages={setPages} />
        </main>
      </div>

      {/* Copia sin escalar que es lo único que se imprime en el PDF. */}
      {createPortal(
        <div className="print-only">
          <CvDocument cv={cv} profile={profile} />
        </div>,
        document.body,
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/15 bg-black/70 py-2 pr-2 pl-5 text-sm shadow-xl backdrop-blur-xl"
          >
            <span>{toast.text}</span>
            {toast.path && (
              <Button className="py-1.5" onClick={() => api.openPath(toast.path!)}>
                <FolderOpen className="size-4" /> Abrir
              </Button>
            )}
            <button onClick={() => setToast(null)} className="cursor-pointer p-1 text-white/50 hover:text-white" aria-label="Cerrar">
              <X className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DesignPanel({
  style,
  setStyle,
  templateName,
  idealFor,
}: {
  style: CvStyle;
  setStyle: (p: Partial<CvStyle>) => void;
  templateName?: string;
  idealFor?: string[];
}) {
  return (
    <div className="flex flex-col gap-4">
      {templateName && (
        <Glass className="p-4 text-sm text-white/65">
          Formato de origen: <span className="text-accent-soft">{templateName}</span>
          {idealFor && <span className="block mt-1 text-xs text-white/45">Ideal para: {idealFor.join(" · ")}</span>}
        </Glass>
      )}

      <Glass className="p-4">
        <h3 className="mb-3 font-display text-xl font-semibold text-amber-50">Diseño de página</h3>
        <div className="grid grid-cols-2 gap-2">
          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              onClick={() => setStyle({ layout: l.id })}
              className={cn(
                "cursor-pointer rounded-xl border p-3 text-left transition",
                style.layout === l.id ? "border-accent bg-accent/15" : "border-white/10 hover:bg-white/5",
              )}
            >
              <LayoutGlyph layout={l.id} />
              <p className="mt-2 text-sm font-medium text-white">{l.name}</p>
              <p className="text-xs text-white/45">{l.description}</p>
            </button>
          ))}
        </div>
      </Glass>

      <Glass className="p-4">
        <h3 className="mb-3 font-display text-xl font-semibold text-amber-50">Color de acento</h3>
        <div className="flex flex-wrap items-center gap-2">
          {ACCENTS.map((c) => (
            <button
              key={c}
              onClick={() => setStyle({ accent: c })}
              aria-label={`Color ${c}`}
              className={cn(
                "size-8 cursor-pointer rounded-full border-2 transition hover:scale-110",
                style.accent.toLowerCase() === c ? "border-white" : "border-transparent",
              )}
              style={{ background: c }}
            />
          ))}
          <label className="relative ml-1 flex cursor-pointer items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5">
            <span className="size-4 rounded-full" style={{ background: style.accent }} />
            Personalizado
            <input
              type="color"
              value={style.accent}
              onChange={(e) => setStyle({ accent: e.target.value })}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        </div>
      </Glass>

      <Glass className="p-4">
        <h3 className="mb-3 font-display text-xl font-semibold text-amber-50">Tipografía</h3>
        <div className="grid grid-cols-3 gap-2">
          {FONTS.map((f) => (
            <button
              key={f.id}
              onClick={() => setStyle({ font: f.id })}
              className={cn(
                "cursor-pointer rounded-xl border p-3 transition",
                style.font === f.id ? "border-accent bg-accent/15" : "border-white/10 hover:bg-white/5",
              )}
            >
              <span className="block text-2xl text-white" style={{ fontFamily: f.css }}>
                Aa
              </span>
              <span className="text-xs text-white/55">{f.name}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          {(
            [
              { id: "normal", label: "Espaciado normal" },
              { id: "compact", label: "Compacto (cabe más)" },
            ] as const
          ).map((d) => (
            <button
              key={d.id}
              onClick={() => setStyle({ density: d.id })}
              className={cn(
                "flex-1 cursor-pointer rounded-full border py-2 text-xs transition",
                style.density === d.id ? "border-accent bg-accent/15 text-white" : "border-white/10 text-white/60 hover:bg-white/5",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </Glass>
    </div>
  );
}

/** Pequeño esquema de cada diseño de página. */
function LayoutGlyph({ layout }: { layout: CvStyle["layout"] }) {
  const bar = "h-1 rounded-full bg-white/30";
  return (
    <div className="flex h-14 flex-col gap-1 rounded-md bg-white/5 p-2">
      {layout === "harvard" && (
        <>
          <div className="mx-auto h-1.5 w-1/2 rounded-full bg-white/60" />
          <div className="h-px bg-white/40" />
          <div className={bar} />
          <div className={cn(bar, "w-4/5")} />
        </>
      )}
      {layout === "classic" && (
        <>
          <div className="h-1.5 w-1/2 rounded-full bg-white/60" />
          <div className="h-0.5 bg-accent-soft" />
          <div className={bar} />
          <div className={cn(bar, "w-4/5")} />
        </>
      )}
      {layout === "cambridge" && (
        <>
          <div className="h-1.5 w-1/2 rounded-full bg-white/60" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-1.5">
              <div className="h-1 w-1/4 rounded-full bg-accent-soft/70" />
              <div className={cn(bar, "flex-1")} />
            </div>
          ))}
        </>
      )}
      {layout === "modern" && (
        <div className="flex h-full gap-1.5">
          <div className="flex flex-1 flex-col gap-1">
            <div className="h-1.5 w-3/4 rounded-full bg-white/60" />
            <div className={bar} />
            <div className={cn(bar, "w-4/5")} />
          </div>
          <div className="w-1/3 rounded-sm bg-accent-soft/30" />
        </div>
      )}
    </div>
  );
}
