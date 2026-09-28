import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Eye, EyeOff, Lightbulb, Plus, Trash2 } from "lucide-react";
import type { Section } from "../types";
import { KIND_LABEL } from "../templates";
import {
  newCompetency,
  newEducation,
  newEntry,
  newExperience,
  newListItem,
  newReference,
  newSkillGroup,
} from "../lib/factory";
import { Button, Checkbox, IconButton, TextArea, TextInput, cn } from "../components/ui";
import BulletEditor from "../components/BulletEditor";
import { useConfirm } from "../components/Confirm";

type Props = {
  section: Section;
  index: number;
  count: number;
  onChange: (s: Section) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
};

export default function SectionCard({ section, index, count, onChange, onMove, onRemove }: Props) {
  const [open, setOpen] = useState(true);

  const confirm = useConfirm();
  const remove = async () => {
    const ok = await confirm({
      title: "¿Quitar esta sección?",
      message: `«${section.title || "Sin título"}» y todo su contenido se quitarán del CV.`,
      confirmLabel: "Quitar",
      danger: true,
    });
    if (ok) onRemove();
  };

  return (
    <div className={cn("rounded-2xl border border-white/10 bg-white/[0.035]", section.hidden && "opacity-55")}>
      <div className="flex items-center gap-1 p-2 pl-3">
        <IconButton label={open ? "Contraer" : "Expandir"} onClick={() => setOpen((o) => !o)}>
          <ChevronDown className={cn("size-4 transition-transform", !open && "-rotate-90")} />
        </IconButton>
        <input
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          placeholder="Título de la sección"
          aria-label="Título de la sección"
          className="min-w-0 flex-1 rounded-md bg-transparent px-2 py-1 font-display text-xl font-semibold text-amber-50 outline-none placeholder:text-white/30 focus:bg-white/5"
        />
        <span className="shrink-0 rounded-full bg-white/8 px-2 py-0.5 text-[11px] text-white/50">
          {KIND_LABEL[section.kind]}
        </span>
        <IconButton label="Subir" disabled={index === 0} onClick={() => onMove(-1)}>
          <ChevronUp className="size-4" />
        </IconButton>
        <IconButton label="Bajar" disabled={index === count - 1} onClick={() => onMove(1)}>
          <ChevronDown className="size-4" />
        </IconButton>
        <IconButton
          label={section.hidden ? "Mostrar en el CV" : "Ocultar del CV"}
          onClick={() => onChange({ ...section, hidden: !section.hidden })}
        >
          {section.hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </IconButton>
        <IconButton label="Quitar sección" onClick={remove} className="hover:text-red-300">
          <Trash2 className="size-4" />
        </IconButton>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 px-4 pb-4">
              {section.hint && (
                <p className="flex gap-2 rounded-lg bg-accent/10 px-3 py-2 text-xs leading-relaxed text-white/65">
                  <Lightbulb className="mt-px size-3.5 shrink-0 text-accent-soft" />
                  {section.hint}
                </p>
              )}
              <SectionFields section={section} onChange={onChange} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- lista genérica de elementos ----------

function Items<T extends { id: string }>({
  items,
  onChange,
  create,
  addLabel,
  itemLabel,
  render,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  addLabel: string;
  itemLabel: (item: T) => string;
  render: (item: T, set: (patch: Partial<T>) => void) => ReactNode;
}) {
  const move = (i: number, dir: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <motion.div
          layout="position"
          key={item.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/8 bg-black/30 p-3"
        >
          <div className="mb-2 flex items-center gap-1">
            <span className="min-w-0 flex-1 truncate text-xs text-white/40">{itemLabel(item) || `Elemento ${i + 1}`}</span>
            <IconButton label="Subir" className="size-7" disabled={i === 0} onClick={() => move(i, -1)}>
              <ChevronUp className="size-3.5" />
            </IconButton>
            <IconButton label="Bajar" className="size-7" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
              <ChevronDown className="size-3.5" />
            </IconButton>
            <IconButton
              label="Quitar"
              className="size-7 hover:text-red-300"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              <Trash2 className="size-3.5" />
            </IconButton>
          </div>
          {render(item, (patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x))))}
        </motion.div>
      ))}
      <Button variant="ghost" className="self-start border border-dashed border-white/15" onClick={() => onChange([...items, create()])}>
        <Plus className="size-4" /> {addLabel}
      </Button>
    </div>
  );
}

const Grid = ({ children }: { children: ReactNode }) => <div className="grid grid-cols-2 gap-3">{children}</div>;
function SectionFields({ section, onChange }: { section: Section; onChange: (s: Section) => void }) {
  switch (section.kind) {
    case "text":
      return (
        <TextArea
          value={section.content}
          onChange={(content) => onChange({ ...section, content })}
          placeholder="Escribe aquí… (deja una línea en blanco para separar párrafos)"
          minRows={4}
        />
      );

    case "experience":
      return (
        <>
          <Checkbox
            checked={!!section.compact}
            onChange={(compact) => onChange({ ...section, compact })}
            label="Versión breve (solo puesto, empresa y fechas)"
          />
          <Items
            items={section.items}
            onChange={(items) => onChange({ ...section, items })}
            create={newExperience}
            addLabel="Añadir puesto"
            itemLabel={(it) => [it.role, it.org].filter(Boolean).join(" · ")}
            render={(it, set) => (
              <div className="flex flex-col gap-3">
                <Grid>
                  <TextInput label="Puesto" value={it.role} onChange={(e) => set({ role: e.target.value })} placeholder="Desarrollador Frontend" />
                  <TextInput label="Empresa / organización" value={it.org} onChange={(e) => set({ org: e.target.value })} />
                  <TextInput label="Inicio" value={it.start} onChange={(e) => set({ start: e.target.value })} placeholder="Ene 2022" />
                  <TextInput
                    label="Fin"
                    value={it.current ? "Actualidad" : it.end}
                    disabled={it.current}
                    onChange={(e) => set({ end: e.target.value })}
                    placeholder="Mar 2024"
                  />
                  <TextInput label="Ubicación" value={it.location} onChange={(e) => set({ location: e.target.value })} placeholder="Ciudad / Remoto" />
                  <div className="flex items-end pb-2">
                    <Checkbox checked={it.current} onChange={(current) => set({ current })} label="Trabajo aquí actualmente" />
                  </div>
                </Grid>
                {!section.compact && (
                  <BulletEditor
                    label="Logros y responsabilidades"
                    value={it.bullets}
                    onChange={(bullets) => set({ bullets })}
                    placeholder="Reduje el tiempo de carga un 40 % migrando a…"
                  />
                )}
              </div>
            )}
          />
        </>
      );

    case "education":
      return (
        <Items
          items={section.items}
          onChange={(items) => onChange({ ...section, items })}
          create={newEducation}
          addLabel="Añadir estudios"
          itemLabel={(it) => [it.degree, it.institution].filter(Boolean).join(" · ")}
          render={(it, set) => (
            <div className="flex flex-col gap-3">
              <Grid>
                <TextInput label="Título / carrera" value={it.degree} onChange={(e) => set({ degree: e.target.value })} placeholder="Ingeniería en Sistemas" />
                <TextInput label="Institución" value={it.institution} onChange={(e) => set({ institution: e.target.value })} />
                <TextInput label="Inicio" value={it.start} onChange={(e) => set({ start: e.target.value })} placeholder="2018" />
                <TextInput label="Fin (o «En curso»)" value={it.end} onChange={(e) => set({ end: e.target.value })} placeholder="2022" />
              </Grid>
              <TextInput label="Ubicación" value={it.location} onChange={(e) => set({ location: e.target.value })} />
              <TextArea
                label="Detalles (opcional)"
                value={it.details}
                onChange={(details) => set({ details })}
                placeholder="Promedio 9.2/10 · Tesis sobre…"
                minRows={2}
              />
            </div>
          )}
        />
      );

    case "skills":
      return (
        <Items
          items={section.items}
          onChange={(items) => onChange({ ...section, items })}
          create={newSkillGroup}
          addLabel="Añadir categoría"
          itemLabel={(it) => it.label}
          render={(it, set) => (
            <div className="flex flex-col gap-3">
              <TextInput label="Categoría (opcional)" value={it.label} onChange={(e) => set({ label: e.target.value })} placeholder="Lenguajes" />
              <TextArea
                label="Habilidades, separadas por comas"
                value={it.items}
                onChange={(items) => set({ items })}
                placeholder="TypeScript, React, Node.js, SQL"
                minRows={2}
              />
            </div>
          )}
        />
      );

    case "competencies":
      return (
        <Items
          items={section.items}
          onChange={(items) => onChange({ ...section, items })}
          create={newCompetency}
          addLabel="Añadir competencia"
          itemLabel={(it) => it.title}
          render={(it, set) => (
            <div className="flex flex-col gap-3">
              <TextInput label="Competencia" value={it.title} onChange={(e) => set({ title: e.target.value })} placeholder="Gestión de proyectos" />
              <BulletEditor
                label="Logros"
                value={it.bullets}
                onChange={(bullets) => set({ bullets })}
                placeholder="Coordiné 3 lanzamientos con equipos de 10+ personas"
              />
            </div>
          )}
        />
      );

    case "entries":
      return (
        <Items
          items={section.items}
          onChange={(items) => onChange({ ...section, items })}
          create={newEntry}
          addLabel="Añadir"
          itemLabel={(it) => it.title}
          render={(it, set) => (
            <div className="flex flex-col gap-3">
              <Grid>
                <TextInput label="Título" value={it.title} onChange={(e) => set({ title: e.target.value })} />
                <TextInput label="Fecha" value={it.date} onChange={(e) => set({ date: e.target.value })} placeholder="2024" />
              </Grid>
              <TextInput
                label="Subtítulo (entidad, rol, tecnologías, enlace…)"
                value={it.subtitle}
                onChange={(e) => set({ subtitle: e.target.value })}
              />
              <TextArea
                label="Descripción (opcional; varias líneas = viñetas)"
                value={it.description}
                onChange={(description) => set({ description })}
                minRows={2}
              />
            </div>
          )}
        />
      );

    case "list":
      return (
        <Items
          items={section.items}
          onChange={(items) => onChange({ ...section, items })}
          create={newListItem}
          addLabel="Añadir línea"
          itemLabel={() => ""}
          render={(it, set) => <TextInput value={it.text} onChange={(e) => set({ text: e.target.value })} aria-label="Texto" />}
        />
      );

    case "references":
      return (
        <Items
          items={section.items}
          onChange={(items) => onChange({ ...section, items })}
          create={newReference}
          addLabel="Añadir referencia"
          itemLabel={(it) => it.name}
          render={(it, set) => (
            <div className="flex flex-col gap-3">
              <TextInput label="Nombre" value={it.name} onChange={(e) => set({ name: e.target.value })} placeholder="Nombre Apellido" />
              <Grid>
                <TextInput
                  label="Puesto"
                  value={it.position}
                  onChange={(e) => set({ position: e.target.value })}
                  placeholder="Gerente de TI, Empresa X"
                />
                <TextInput
                  label="Número telefónico"
                  type="tel"
                  value={it.phone}
                  onChange={(e) => set({ phone: e.target.value })}
                  placeholder="+52 55 1234 5678"
                />
              </Grid>
            </div>
          )}
        />
      );
  }
}
