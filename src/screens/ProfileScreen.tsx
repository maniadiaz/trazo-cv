import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Eye, Link2, Plus, Trash2 } from "lucide-react";
import type { LinkItem, Profile } from "../types";
import type { View } from "../App";
import { uid } from "../lib/factory";
import { prettyUrl } from "../cv/CvDocument";
import AnimatedTitle, { blurIn } from "../components/AnimatedTitle";
import { useConfirm } from "../components/Confirm";
import { Button, Glass, IconButton, TextInput, cn, fieldBase } from "../components/ui";

const LINK_PRESETS = [
  { label: "LinkedIn", placeholder: "linkedin.com/in/tu-usuario", unique: true },
  { label: "GitHub", placeholder: "github.com/tu-usuario", unique: true },
  { label: "Portafolio", placeholder: "tu-sitio.com", unique: false },
  { label: "Otro", placeholder: "https://…", unique: false },
];

/** Deja el enlace limpio: sin https://, sin www. y sin barra final. */
const cleanLinks = (links: LinkItem[]) => links.map((l) => ({ ...l, label: l.label.trim(), url: prettyUrl(l.url) }));

export default function ProfileScreen({
  profile,
  onSave,
  go,
  firstRun = false,
}: {
  profile: Profile;
  onSave: (p: Profile) => Promise<void>;
  go: (v: View) => void;
  /** Primera vez que se abre la app: pantalla de bienvenida. */
  firstRun?: boolean;
}) {
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(profile);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
  };

  const setLink = (id: string, patch: Partial<LinkItem>) =>
    set(
      "links",
      draft.links.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    );

  const addLink = (label: string) =>
    set("links", [...draft.links, { id: uid(), label: label === "Otro" ? "" : label, url: "" }]);

  const save = async () => {
    const clean = { ...draft, links: cleanLinks(draft.links) };
    setDraft(clean);
    await onSave(clean);
    setSaved(true);
    if (firstRun) go({ name: "home" });
  };

  const confirm = useConfirm();
  const back = async () => {
    if (
      dirty &&
      !(await confirm({
        title: "¿Salir sin guardar?",
        message: "Tienes cambios en tus datos que todavía no has guardado.",
        confirmLabel: "Salir sin guardar",
        danger: true,
      }))
    )
      return;
    go({ name: "home" });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-8 py-10">
        <Button variant="ghost" onClick={back} className="-ml-3">
          {firstRun ? (
            <>
              Omitir por ahora <ArrowRight className="size-4" />
            </>
          ) : (
            <>
              <ArrowLeft className="size-4" /> Inicio
            </>
          )}
        </Button>

        {firstRun ? (
          <>
            <motion.p {...blurIn(0)} className="mt-6 text-sm tracking-[0.3em] text-accent-soft uppercase">
              Bienvenido a Trazo CV
            </motion.p>
            <AnimatedTitle text="Empecemos por ti" className="mt-1 font-display text-6xl font-semibold text-amber-50" />
            <motion.p {...blurIn(0.1)} className="mt-3 max-w-xl text-white/60">
              Llena tus datos una sola vez: aparecerán automáticamente en todos tus CV y en cada uno eliges cuáles mostrar.
              Puedes cambiarlos cuando quieras desde «Mis datos».
            </motion.p>
          </>
        ) : (
          <>
            <motion.h1 {...blurIn(0)} className="mt-6 font-display text-6xl font-semibold text-amber-50">
              Mis datos
            </motion.h1>
            <motion.p {...blurIn(0.1)} className="mt-2 text-white/60">
              Se reutilizan en todos tus CV. Dentro de cada CV decides qué datos y enlaces mostrar.
            </motion.p>
          </>
        )}

        <motion.div {...blurIn(firstRun ? 0.15 : 0.1)}>
          <Glass className="mt-8 grid grid-cols-2 gap-4 p-6">
            <TextInput
              label="Nombre completo"
              className="col-span-2"
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Nombre Apellido"
              autoFocus={firstRun}
            />
            <TextInput
              label="Profesión o titular (sugerido para nuevos CV)"
              className="col-span-2"
              value={draft.headline}
              onChange={(e) => set("headline", e.target.value)}
              placeholder="Desarrollador Full Stack"
            />
            <TextInput
              label="Correo"
              type="email"
              value={draft.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="nombre@correo.com"
            />
            <TextInput
              label="Teléfono"
              type="tel"
              value={draft.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+52 55 1234 5678"
            />
            <TextInput
              label="Ubicación"
              className="col-span-2"
              value={draft.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Ciudad, País"
            />
          </Glass>
        </motion.div>

        <motion.div {...blurIn(firstRun ? 0.2 : 0.15)}>
          <Glass className="mt-6 p-6">
            <div className="flex items-center gap-2 text-amber-50">
              <Link2 className="size-5 text-accent-soft" />
              <h2 className="font-medium">Enlaces personalizados</h2>
            </div>
            <p className="mt-1 text-xs text-white/45">
              Pega el enlace completo o solo el usuario; se guarda limpio, sin «https://» ni «www.».
            </p>

            {draft.links.length > 0 && (
              <div className="mt-4 grid grid-cols-[8.5rem_1fr_2rem] gap-x-3 px-1 text-xs font-medium text-white/45">
                <span>Nombre</span>
                <span>Enlace</span>
              </div>
            )}

            <div className="mt-1.5 flex flex-col gap-3">
              {draft.links.length === 0 && <p className="mt-3 text-sm text-white/45">Aún no has añadido enlaces.</p>}
              <AnimatePresence initial={false}>
                {draft.links.map((link) => {
                  const preset = LINK_PRESETS.find((p) => p.label === link.label);
                  const shown = prettyUrl(link.url);
                  return (
                    <motion.div
                      key={link.id}
                      layout="position"
                      initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, x: -16, filter: "blur(6px)" }}
                      className="rounded-xl border border-white/8 bg-black/25 p-2"
                    >
                      <div className="grid grid-cols-[8.5rem_1fr_2rem] items-center gap-3">
                        <input
                          value={link.label}
                          placeholder="Nombre"
                          aria-label="Nombre del enlace"
                          onChange={(e) => setLink(link.id, { label: e.target.value })}
                          className={cn(fieldBase, "font-medium")}
                        />
                        <input
                          value={link.url}
                          placeholder={preset?.placeholder ?? "https://…"}
                          aria-label={`Enlace de ${link.label || "este sitio"}`}
                          onChange={(e) => setLink(link.id, { url: e.target.value })}
                          onBlur={() => shown !== link.url && setLink(link.id, { url: shown })}
                          spellCheck={false}
                          className={cn(fieldBase, "min-w-0")}
                        />
                        <IconButton
                          label="Quitar enlace"
                          className="hover:text-red-300"
                          onClick={() =>
                            set(
                              "links",
                              draft.links.filter((l) => l.id !== link.id),
                            )
                          }
                        >
                          <Trash2 className="size-4" />
                        </IconButton>
                      </div>
                      {shown && (
                        <p className="mt-1.5 flex items-center gap-1.5 pl-[9.25rem] text-xs text-white/45">
                          <Eye className="size-3.5 shrink-0 text-accent-soft" />
                          En el CV: <span className="truncate text-accent-soft">{shown}</span>
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {LINK_PRESETS.map((p) => {
                const taken = p.unique && draft.links.some((l) => l.label === p.label);
                return (
                  <Button
                    key={p.label}
                    variant="ghost"
                    className="border border-white/10 py-1.5"
                    disabled={taken}
                    title={taken ? `Ya añadiste ${p.label}` : undefined}
                    onClick={() => addLink(p.label)}
                  >
                    {taken ? <Check className="size-3.5" /> : <Plus className="size-3.5" />} {p.label}
                  </Button>
                );
              })}
            </div>
          </Glass>
        </motion.div>

        <div className="pointer-events-none sticky bottom-6 mt-8 flex items-center justify-end gap-3">
          {saved && !dirty && !firstRun && (
            <span className="flex items-center gap-1 text-sm text-emerald-300">
              <Check className="size-4" /> Guardado
            </span>
          )}
          <div className="pointer-events-auto rounded-full border border-white/10 bg-ink/80 p-1.5 shadow-2xl backdrop-blur-md">
            <Button variant="primary" disabled={!dirty} onClick={save} className="px-6">
              {firstRun ? (
                <>
                  Guardar y continuar <ArrowRight className="size-4" />
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
