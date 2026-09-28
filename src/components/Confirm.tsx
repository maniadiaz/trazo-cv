import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import { Button, cn } from "./ui";

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type Pending = ConfirmOptions & { resolve: (ok: boolean) => void };

const ConfirmContext = createContext<(o: ConfirmOptions) => Promise<boolean>>(async () => false);

/**
 * Cuadro de confirmación propio. Sustituye a window.confirm: en Electron para Windows,
 * tras un diálogo nativo la ventana deja de recibir texto en los campos (solo borra).
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const confirm = useCallback(
    (o: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        returnFocus.current = document.activeElement as HTMLElement | null;
        setPending({ ...o, resolve });
      }),
    [],
  );

  const close = useCallback(
    (ok: boolean) => {
      pending?.resolve(ok);
      setPending(null);
      // Devuelve el foco a donde estaba si ese elemento sigue en pantalla.
      const el = returnFocus.current;
      requestAnimationFrame(() => el?.isConnected && el.focus());
    },
    [pending],
  );

  useEffect(() => {
    if (!pending) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending, close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {pending && (
          <motion.div
            className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onMouseDown={(e) => e.target === e.currentTarget && close(false)}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              initial={{ opacity: 0, y: 16, scale: 0.97, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="glow-card w-full max-w-sm rounded-2xl border border-white/10 bg-[#0e0c16]/95 p-6 shadow-2xl"
            >
              <div className="flex items-start gap-3">
                {pending.danger && (
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-red-500/15 text-red-300">
                    <TriangleAlert className="size-4.5" />
                  </span>
                )}
                <div className="min-w-0">
                  <h2 id="confirm-title" className="font-display text-2xl font-semibold text-amber-50">
                    {pending.title}
                  </h2>
                  {pending.message && <p className="mt-1.5 text-sm text-white/60">{pending.message}</p>}
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => close(false)} autoFocus>
                  {pending.cancelLabel ?? "Cancelar"}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => close(true)}
                  className={cn(pending.danger && "bg-red-600 shadow-red-900/40 hover:bg-red-500")}
                >
                  {pending.confirmLabel ?? "Aceptar"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
