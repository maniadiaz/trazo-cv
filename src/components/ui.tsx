import { useLayoutEffect, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export const fieldBase =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-accent-soft/70 focus:bg-white/[0.07] focus:ring-2 focus:ring-accent/30";

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-medium text-white/55">{label}</span>
      {children}
    </label>
  );
}

export function TextInput({
  label,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const input = <input {...props} className={cn(fieldBase, !label && className)} />;
  return label ? (
    <Field label={label} className={className}>
      {input}
    </Field>
  ) : (
    input
  );
}

/** Textarea que crece con el contenido. */
export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  minRows = 3,
  className,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minRows?: number;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  const area = (
    <textarea
      ref={ref}
      rows={minRows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(fieldBase, "resize-none leading-relaxed", !label && className)}
    />
  );
  return label ? (
    <Field label={label} className={className}>
      {area}
    </Field>
  ) : (
    area
  );
}

export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-white/75 select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 cursor-pointer accent-[rgb(120,60,250)]"
      />
      {label}
    </label>
  );
}

type Variant = "primary" | "ghost" | "glass" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-[rgb(120,50,255)] shadow-lg shadow-accent/30",
  glass: "bg-white/10 text-white border border-white/15 hover:bg-white/20 backdrop-blur-md",
  ghost: "text-white/70 hover:text-white hover:bg-white/10",
  danger: "text-red-300 hover:text-red-200 hover:bg-red-500/15",
};

export function Button({
  variant = "glass",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft cursor-pointer",
        variants[variant],
        className,
      )}
    />
  );
}

export function IconButton({
  label,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      {...props}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft cursor-pointer",
        className,
      )}
    />
  );
}

export function Glass({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl", className)}>{children}</div>
  );
}
