import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Link2, Plus, Trash2 } from "lucide-react";
import type { Profile } from "../types";
import type { View } from "../App";
import { uid } from "../lib/factory";
import { blurIn } from "../components/AnimatedTitle";
import { Button, Glass, IconButton, TextInput } from "../components/ui";

const LINK_PRESETS = [
  { label: "LinkedIn", placeholder: "linkedin.com/in/tu-usuario" },
  { label: "GitHub", placeholder: "github.com/tu-usuario" },
  { label: "Portafolio", placeholder: "tu-sitio.com" },
  { label: "Otro", placeholder: "https://…" },
];

export default function ProfileScreen({
  profile,
  onSave,
  go,
}: {
  profile: Profile;
  onSave: (p: Profile) => Promise<void>;
  go: (v: View) => void;
}) {
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(profile);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
  };

  const addLink = (label: string) => set("links", [...draft.links, { id: uid(), label: label === "Otro" ? "" : label, url: "" }]);

  const save = async () => {
    await onSave(draft);
    setSaved(true);
  };

  const back = () => {
    if (dirty && !window.confirm("Tienes cambios sin guardar. ¿Salir de todos modos?")) return;
    go({ name: "home" });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-8 py-10">
        <Button variant="ghost" onClick={back} className="-ml-3">
          <ArrowLeft className="size-4" /> Inicio
        </Button>

        <motion.h1 {...blurIn(0)} className="mt-6 font-display text-6xl font-semibold text-amber-50">
          Mis datos
        </motion.h1>
        <motion.p {...blurIn(0.1)} className="mt-2 text-white/60">
          Se reutilizan en todos tus CV. Dentro de cada CV decides qué datos y enlaces mostrar.
        </motion.p>

        <motion.div {...blurIn(0.2)}>
          <Glass className="mt-8 grid grid-cols-2 gap-4 p-6">
            <TextInput
              label="Nombre completo"
              className="col-span-2"
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Nombre Apellido"
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

        <motion.div {...blurIn(0.3)}>
          <Glass className="mt-6 p-6">
            <div className="flex items-center gap-2 text-amber-50">
              <Link2 className="size-5 text-accent-soft" />
              <h2 className="font-medium">Enlaces personalizados</h2>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {draft.links.length === 0 && <p className="text-sm text-white/45">Aún no has añadido enlaces.</p>}
              {draft.links.map((link, i) => (
                <div key={link.id} className="flex items-center gap-3">
                  <TextInput
                    className="w-40 shrink-0"
                    value={link.label}
                    placeholder="Nombre"
                    aria-label="Nombre del enlace"
                    onChange={(e) =>
                      set(
                        "links",
                        draft.links.map((l, j) => (j === i ? { ...l, label: e.target.value } : l)),
                      )
                    }
                  />
                  <TextInput
                    value={link.url}
                    aria-label="URL"
                    placeholder={LINK_PRESETS.find((p) => p.label === link.label)?.placeholder ?? "https://…"}
                    onChange={(e) =>
                      set(
                        "links",
                        draft.links.map((l, j) => (j === i ? { ...l, url: e.target.value } : l)),
                      )
                    }
                  />
                  <IconButton
                    label="Quitar enlace"
                    className="shrink-0 hover:text-red-300"
                    onClick={() =>
                      set(
                        "links",
                        draft.links.filter((_, j) => j !== i),
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                  </IconButton>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {LINK_PRESETS.map((p) => (
                <Button key={p.label} variant="ghost" className="border border-white/10 py-1.5" onClick={() => addLink(p.label)}>
                  <Plus className="size-3.5" /> {p.label}
                </Button>
              ))}
            </div>
          </Glass>
        </motion.div>

        <div className="sticky bottom-0 mt-8 flex items-center justify-end gap-3 py-4">
          {saved && !dirty && (
            <span className="flex items-center gap-1 text-sm text-emerald-300">
              <Check className="size-4" /> Guardado
            </span>
          )}
          <Button variant="primary" disabled={!dirty} onClick={save} className="px-6">
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
}
