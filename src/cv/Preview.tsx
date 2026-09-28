import { useLayoutEffect, useRef, useState } from "react";
import type { Cv, Profile } from "../types";
import CvDocument from "./CvDocument";

const MM = 96 / 25.4; // px por milímetro
const PAGE_W = 210 * MM;
const MARGIN_Y = 14; // mm, igual que @page en cv.css
const CONTENT_H = 297 - MARGIN_Y * 2; // alto útil de una hoja en mm

/** Hoja A4 escalada para caber en el panel, con guías aproximadas de salto de página. */
export default function Preview({ cv, profile, onPages }: { cv: Cv; profile: Profile; onPages?: (n: number) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);
  const [height, setHeight] = useState(297 * MM);

  useLayoutEffect(() => {
    const wrap = wrapRef.current!;
    const page = pageRef.current!;
    const measure = () => {
      setScale(Math.min(1.1, (wrap.clientWidth - 48) / PAGE_W));
      setHeight(page.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    ro.observe(page);
    return () => ro.disconnect();
  }, []);

  const contentMm = height / MM - MARGIN_Y * 2;
  const pages = Math.max(1, Math.ceil((contentMm - 0.5) / CONTENT_H));
  useLayoutEffect(() => onPages?.(pages), [pages, onPages]);

  return (
    <div ref={wrapRef} className="h-full overflow-y-auto overflow-x-hidden px-6 py-8">
      <div className="relative mx-auto" style={{ width: PAGE_W * scale, height: height * scale }}>
        <div
          ref={pageRef}
          className="absolute top-0 left-0 origin-top-left overflow-hidden rounded-sm shadow-2xl shadow-black/60"
          style={{ width: PAGE_W, transform: `scale(${scale})` }}
        >
          <CvDocument cv={cv} profile={profile} preview />
          {Array.from({ length: pages - 1 }, (_, i) => (
            <div
              key={i}
              className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-accent/50"
              style={{ top: (MARGIN_Y + CONTENT_H * (i + 1)) * MM }}
            >
              <span className="absolute right-2 -top-6 rounded bg-accent px-2 py-0.5 text-[11px] font-medium text-white">
                ≈ Página {i + 2}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Miniatura no interactiva para las tarjetas de inicio. */
export function CvThumb({ cv, profile, width }: { cv: Cv; profile: Profile; width: number }) {
  const scale = width / PAGE_W;
  return (
    <div className="pointer-events-none relative overflow-hidden bg-white" style={{ width, height: 297 * MM * scale * 0.62 }}>
      <div className="absolute top-0 left-0 origin-top-left" style={{ width: PAGE_W, transform: `scale(${scale})` }}>
        <CvDocument cv={cv} profile={profile} />
      </div>
    </div>
  );
}
