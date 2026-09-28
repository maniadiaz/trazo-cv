import { useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { Plus, X } from "lucide-react";
import { Field, cn } from "./ui";

type Focus = { index: number; caret: number | "end" };

/**
 * Editor de viñetas: cada punto es una fila propia con su marcador, como se verá en el CV.
 * El valor se sigue guardando como texto con un punto por línea.
 *
 * Enter → nuevo punto · Retroceso al inicio → une con el anterior · ↑/↓ → moverse entre puntos.
 * Pegar varias líneas crea un punto por línea.
 */
export default function BulletEditor({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const items = value === "" ? [""] : value.split("\n");
  const refs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const pendingFocus = useRef<Focus | null>(null);

  // Ajusta la altura de cada punto y coloca el cursor tras crear/unir puntos.
  useLayoutEffect(() => {
    for (const el of refs.current) {
      if (!el) continue;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
    const f = pendingFocus.current;
    if (!f) return;
    pendingFocus.current = null;
    const el = refs.current[f.index];
    if (!el) return;
    el.focus();
    const pos = f.caret === "end" ? el.value.length : f.caret;
    el.setSelectionRange(pos, pos);
  });

  const commit = (next: string[], focus?: Focus) => {
    if (focus) pendingFocus.current = focus;
    onChange(next.join("\n"));
  };

  const edit = (i: number, text: string) => {
    if (!text.includes("\n")) return commit(items.map((it, j) => (j === i ? text : it)));
    // Pegado de varias líneas: un punto por línea.
    const parts = text.split(/\r?\n/);
    commit([...items.slice(0, i), ...parts, ...items.slice(i + 1)], {
      index: i + parts.length - 1,
      caret: "end",
    });
  };

  const remove = (i: number) => {
    const next = items.filter((_, j) => j !== i);
    commit(next.length ? next : [""], { index: Math.max(0, i - 1), caret: "end" });
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const { selectionStart: start, selectionEnd: end } = el;
    const collapsed = start === end;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const before = el.value.slice(0, start);
      const after = el.value.slice(end).replace(/^\s+/, "");
      commit([...items.slice(0, i), before, after, ...items.slice(i + 1)], { index: i + 1, caret: 0 });
    } else if (e.key === "Backspace" && collapsed && start === 0 && i > 0) {
      e.preventDefault();
      const prev = items[i - 1];
      const sep = prev && items[i] && !/\s$/.test(prev) ? " " : "";
      commit([...items.slice(0, i - 1), prev + sep + items[i], ...items.slice(i + 1)], { index: i - 1, caret: prev.length });
    } else if (e.key === "ArrowUp" && collapsed && start === 0 && i > 0) {
      e.preventDefault();
      refs.current[i - 1]?.focus();
      refs.current[i - 1]?.setSelectionRange(items[i - 1].length, items[i - 1].length);
    } else if (e.key === "ArrowDown" && collapsed && end === el.value.length && i < items.length - 1) {
      e.preventDefault();
      refs.current[i + 1]?.focus();
      refs.current[i + 1]?.setSelectionRange(0, 0);
    }
  };

  const filled = items.filter((t) => t.trim()).length;

  return (
    <Field label={label}>
      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] transition focus-within:border-accent-soft/70 focus-within:ring-2 focus-within:ring-accent/30">
        <ol>
          {items.map((text, i) => (
            <li
              key={i}
              className="group flex items-start gap-2.5 border-b border-white/[0.06] py-2 pr-1.5 pl-3 transition-colors last:border-b-0 focus-within:bg-white/[0.04]"
            >
              <span
                aria-hidden
                className={cn(
                  "mt-[0.55rem] size-1.5 shrink-0 rounded-full",
                  text.trim() ? "bg-accent-soft" : "bg-white/20",
                )}
              />
              <textarea
                ref={(el) => {
                  refs.current[i] = el;
                }}
                rows={1}
                value={text}
                placeholder={i === 0 ? placeholder : "Otro logro…"}
                aria-label={`Punto ${i + 1}`}
                onChange={(e) => edit(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                className="min-w-0 flex-1 resize-none bg-transparent text-sm leading-relaxed text-white outline-none placeholder:text-white/30"
              />
              {items.length > 1 && (
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => remove(i)}
                  title="Quitar este punto"
                  aria-label={`Quitar punto ${i + 1}`}
                  className="mt-0.5 cursor-pointer rounded-full p-1 text-white/30 opacity-0 transition group-hover:opacity-100 hover:bg-white/10 hover:text-red-300 focus-visible:opacity-100"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </li>
          ))}
        </ol>
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => commit([...items, ""], { index: items.length, caret: 0 })}
          className="flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-xs text-accent-soft transition hover:bg-accent/15"
        >
          <Plus className="size-3.5" /> Añadir punto
        </button>
        <span className="text-[11px] text-white/35">
          {filled} {filled === 1 ? "punto" : "puntos"} · Enter crea uno nuevo
        </span>
      </div>
    </Field>
  );
}
