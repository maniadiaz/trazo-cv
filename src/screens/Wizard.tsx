import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, FileText, Sparkles, TriangleAlert } from "lucide-react";
import type { Cv, Profile } from "../types";
import type { View } from "../App";
import { BLANK_TEMPLATE_ID, SITUATIONS, TEMPLATES, type TemplateDef } from "../templates";
import { createCv } from "../lib/factory";
import AnimatedTitle, { blurIn } from "../components/AnimatedTitle";
import { Button, Glass, TextInput, cn } from "../components/ui";

export default function Wizard({
  profile,
  onCreate,
  go,
}: {
  profile: Profile;
  onCreate: (cv: Cv) => void;
  go: (v: View) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [situation, setSituation] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [targetRole, setTargetRole] = useState(profile.headline);
  const [withSections, setWithSections] = useState(true);

  const recommended = SITUATIONS.find((s) => s.id === situation)?.recommend ?? [];
  const template: TemplateDef | null = TEMPLATES.find((t) => t.id === templateId) ?? null;
  const isBlank = templateId === BLANK_TEMPLATE_ID;

  const ordered = [...TEMPLATES].sort((a, b) => {
    const ra = recommended.indexOf(a.id);
    const rb = recommended.indexOf(b.id);
    return (ra === -1 ? 99 : ra) - (rb === -1 ? 99 : rb);
  });

  const next = () => {
    const label = template?.name ?? "En blanco";
    setName((n) => n || [targetRole.trim() || "CV", label].join(" · "));
    setStep(2);
  };

  const create = () =>
    onCreate(
      createCv({
        template,
        name: name.trim() || "Nuevo CV",
        targetRole: targetRole.trim(),
        withSections: !isBlank && withSections,
        profile,
      }),
    );

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-8 py-10">
        <Button variant="ghost" onClick={() => (step === 2 ? setStep(1) : go({ name: "home" }))} className="-ml-3">
          <ArrowLeft className="size-4" /> {step === 2 ? "Elegir formato" : "Inicio"}
        </Button>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="s1" exit={{ opacity: 0, filter: "blur(8px)", x: -30 }} transition={{ duration: 0.25 }}>
              <AnimatedTitle text="Nuevo CV" className="mt-6 font-display text-7xl font-semibold text-amber-50" />
              <motion.p {...blurIn(0.4)} className="mt-3 text-white/60">
                1 · ¿Cuál es tu situación? Te recomendamos el formato que mejor te presenta. (Opcional)
              </motion.p>

              <motion.div {...blurIn(0.5)} className="mt-5 flex flex-wrap gap-2">
                {SITUATIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSituation((cur) => (cur === s.id ? null : s.id))}
                    className={cn(
                      "cursor-pointer rounded-full border px-4 py-2 text-sm transition",
                      situation === s.id
                        ? "border-accent bg-accent/30 text-white"
                        : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </motion.div>

              <motion.p {...blurIn(0.6)} className="mt-10 text-white/60">
                2 · Elige el tipo de CV
              </motion.p>

              <motion.div layout className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                {ordered.map((t, i) => {
                  const rec = recommended.includes(t.id);
                  const selected = templateId === t.id;
                  return (
                    <motion.button
                      layout
                      key={t.id}
                      initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ delay: 0.6 + i * 0.06, layout: { type: "spring", stiffness: 200, damping: 26 } }}
                      onClick={() => setTemplateId(t.id)}
                      className={cn(
                        "glow-card relative flex cursor-pointer flex-col rounded-xl border bg-black/50 p-5 text-left transition-colors",
                        selected ? "border-accent ring-2 ring-accent/60" : "border-white/10 hover:border-white/25",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-2xl font-semibold text-amber-50">{t.name}</h3>
                        {selected ? (
                          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent">
                            <Check className="size-4" />
                          </span>
                        ) : rec ? (
                          <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent/25 px-2 py-0.5 text-xs text-accent-soft">
                            <Sparkles className="size-3" /> Recomendado
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-accent-soft">{t.tagline}</p>
                      <p className="mt-3 text-sm text-white/65">{t.description}</p>
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {t.idealFor.map((x) => (
                          <li key={x} className="rounded-full bg-white/8 px-2.5 py-1 text-xs text-white/75">
                            {x}
                          </li>
                        ))}
                      </ul>
                      {t.avoidIf && (
                        <p className="mt-3 flex gap-1.5 text-xs text-amber-200/70">
                          <TriangleAlert className="mt-px size-3.5 shrink-0" /> Evítalo si: {t.avoidIf}
                        </p>
                      )}
                    </motion.button>
                  );
                })}

                <motion.button
                  layout
                  initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.6 + TEMPLATES.length * 0.06 }}
                  onClick={() => setTemplateId(BLANK_TEMPLATE_ID)}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-5 text-center transition-colors",
                    isBlank ? "border-accent bg-accent/10" : "border-white/20 hover:border-white/40",
                  )}
                >
                  <FileText className="size-8 text-white/50" />
                  <h3 className="font-display text-2xl font-semibold text-amber-50">En blanco</h3>
                  <p className="text-sm text-white/55">Sin secciones. Tú decides qué añadir y en qué orden.</p>
                </motion.button>
              </motion.div>

              <div className="pointer-events-none sticky bottom-6 mt-8 flex justify-end">
                <div className="pointer-events-auto rounded-full border border-white/10 bg-ink/80 p-1.5 shadow-2xl backdrop-blur-md">
                  <Button variant="primary" disabled={!templateId} onClick={next} className="px-6">
                    {templateId ? "Continuar" : "Elige un formato"} <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="s2"
              initial={{ opacity: 0, filter: "blur(8px)", x: 30 }}
              animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
              transition={{ duration: 0.3 }}
              className="mx-auto max-w-2xl"
            >
              <h1 className="mt-6 font-display text-6xl font-semibold text-amber-50">Últimos detalles</h1>
              <p className="mt-2 text-white/60">
                Formato: <span className="text-accent-soft">{template?.name ?? "En blanco"}</span>. Podrás cambiar el diseño,
                los colores y las secciones cuando quieras.
              </p>

              <Glass className="mt-8 flex flex-col gap-5 p-6">
                <TextInput
                  label="Nombre del CV (solo para ti, para distinguirlo de los demás)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="CV Frontend · Empresa X"
                  autoFocus
                />
                <TextInput
                  label="Puesto al que postulas (aparece bajo tu nombre)"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Desarrollador Frontend"
                />

                {!isBlank && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-white/55">¿Cómo quieres empezar?</span>
                    {[
                      {
                        v: true,
                        title: "Con las secciones sugeridas, vacías",
                        desc: `${template?.sections.map((s) => s.title).join(" · ")}. Cada una con consejos para rellenarla.`,
                      },
                      { v: false, title: "Totalmente desde cero", desc: "Sin secciones; las añades tú." },
                    ].map((o) => (
                      <button
                        key={String(o.v)}
                        onClick={() => setWithSections(o.v)}
                        className={cn(
                          "cursor-pointer rounded-xl border p-4 text-left transition",
                          withSections === o.v ? "border-accent bg-accent/15" : "border-white/10 hover:bg-white/5",
                        )}
                      >
                        <p className="text-sm font-medium text-white">{o.title}</p>
                        <p className="mt-1 text-xs text-white/55">{o.desc}</p>
                      </button>
                    ))}
                  </div>
                )}

                <p className="text-xs text-white/45">
                  Tus datos de contacto ({profile.name || "sin nombre todavía"}) se añaden automáticamente desde «Mis datos».
                </p>
              </Glass>

              <div className="mt-6 flex justify-end">
                <Button variant="primary" onClick={create} className="px-6">
                  Crear CV <ArrowRight className="size-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
