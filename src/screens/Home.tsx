import { motion } from "framer-motion";
import { Copy, FilePlus2, Trash2, UserRound } from "lucide-react";
import type { AppData, Cv } from "../types";
import type { View } from "../App";
import { templateName } from "../templates";
import AnimatedTitle, { blurIn } from "../components/AnimatedTitle";
import { Button, IconButton } from "../components/ui";
import { CvThumb } from "../cv/Preview";

const dateFmt = new Intl.DateTimeFormat("es", { day: "numeric", month: "short", year: "numeric" });

export default function Home({
  data,
  go,
  onDelete,
  onDuplicate,
}: {
  data: AppData;
  go: (v: View) => void;
  onDelete: (id: string) => void;
  onDuplicate: (cv: Cv) => void;
}) {
  const { profile, cvs } = data;
  const profileIncomplete = !profile.name.trim() || !profile.email.trim();
  const sorted = [...cvs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const confirmDelete = (cv: Cv) => {
    if (window.confirm(`¿Eliminar «${cv.name}»? No se puede deshacer.`)) onDelete(cv.id);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-8 pt-16 pb-20">
        <header className="flex flex-col items-start gap-6">
          <motion.p {...blurIn(0)} className="text-sm tracking-[0.3em] text-accent-soft uppercase">
            Generador de
          </motion.p>
          <AnimatedTitle
            text="Currículum"
            className="-mt-4 font-display text-[clamp(4rem,11vw,9rem)] leading-none font-semibold text-amber-50"
          />
          <motion.p {...blurIn(0.6)} className="max-w-xl text-lg text-white/65">
            Crea un CV distinto para cada oferta. Elige el formato que mejor encaja con tu experiencia y empieza desde
            cero; tus datos de contacto se reutilizan solos.
          </motion.p>
          <motion.div {...blurIn(0.8)} className="flex flex-wrap gap-3">
            <Button variant="primary" className="px-6 py-3 text-base" onClick={() => go({ name: "wizard" })}>
              <FilePlus2 className="size-5" /> Nuevo CV
            </Button>
            <Button className="px-6 py-3 text-base" onClick={() => go({ name: "profile" })}>
              <UserRound className="size-5" /> Mis datos
            </Button>
          </motion.div>
        </header>

        {profileIncomplete && (
          <motion.button
            {...blurIn(1)}
            onClick={() => go({ name: "profile" })}
            className="mt-10 w-full cursor-pointer rounded-2xl border border-accent/40 bg-accent/10 p-5 text-left backdrop-blur-md transition hover:bg-accent/20"
          >
            <p className="font-medium text-amber-50">Empieza por tus datos personales</p>
            <p className="mt-1 text-sm text-white/60">
              Nombre, teléfono, correo y enlaces (LinkedIn, GitHub, portafolio…) se guardan una vez y aparecen en todos tus
              CV. En cada CV eliges cuáles mostrar.
            </p>
          </motion.button>
        )}

        <section className="mt-16">
          <motion.h2 {...blurIn(1)} className="font-display text-4xl font-semibold text-amber-50">
            Mis CV <span className="text-white/35">({cvs.length})</span>
          </motion.h2>

          {sorted.length === 0 ? (
            <motion.p {...blurIn(1.1)} className="mt-6 text-white/50">
              Todavía no tienes ningún CV. Pulsa «Nuevo CV» para crear el primero.
            </motion.p>
          ) : (
            <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
              {sorted.map((cv, i) => (
                <motion.div
                  key={cv.id}
                  initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 1 + i * 0.07, duration: 0.5 }}
                  className="group glow-card overflow-hidden rounded-xl border border-white/10 bg-black/60 transition-transform duration-300 hover:scale-[1.03]"
                >
                  <button
                    onClick={() => go({ name: "editor", id: cv.id })}
                    className="block w-full cursor-pointer text-left"
                    aria-label={`Abrir ${cv.name}`}
                  >
                    <div className="flex justify-center overflow-hidden bg-white/5 pt-4">
                      <div className="overflow-hidden rounded-t-sm">
                        <CvThumb cv={cv} profile={profile} width={200} />
                      </div>
                    </div>
                  </button>
                  <div className="flex items-start gap-2 p-4">
                    <button
                      onClick={() => go({ name: "editor", id: cv.id })}
                      className="min-w-0 flex-1 cursor-pointer text-left"
                    >
                      <p className="truncate font-medium text-white">{cv.name}</p>
                      <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/45">
                        <span className="truncate rounded-full bg-accent/20 px-2 py-0.5 text-accent-soft">
                          {templateName(cv.templateId)}
                        </span>
                        {dateFmt.format(new Date(cv.updatedAt))}
                      </p>
                    </button>
                    <IconButton label="Duplicar" onClick={() => onDuplicate(cv)}>
                      <Copy className="size-4" />
                    </IconButton>
                    <IconButton label="Eliminar" onClick={() => confirmDelete(cv)} className="hover:text-red-300">
                      <Trash2 className="size-4" />
                    </IconButton>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
