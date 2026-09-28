import type { AppData, Cv, Profile } from "../types";

type Api = {
  load(): Promise<AppData>;
  saveProfile(profile: Profile): Promise<void>;
  saveCv(cv: Cv): Promise<void>;
  deleteCv(id: string): Promise<void>;
  /** Devuelve la ruta del PDF guardado o null si se canceló. */
  exportPdf(fileName: string): Promise<string | null>;
  openPath(filePath: string): Promise<void>;
};

declare global {
  interface Window {
    api?: Api;
  }
}

// Respaldo para abrir la interfaz en un navegador normal (npx vite) sin Electron.
const LS_KEY = "generador-cv";

function readLocal(): AppData {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* sin almacenamiento disponible */
  }
  return { profile: { name: "", headline: "", email: "", phone: "", location: "", links: [] }, cvs: [] };
}

function writeLocal(data: AppData) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {
    /* sin almacenamiento disponible */
  }
}

const browserApi: Api = {
  async load() {
    return readLocal();
  },
  async saveProfile(profile) {
    writeLocal({ ...readLocal(), profile });
  },
  async saveCv(cv) {
    const data = readLocal();
    const i = data.cvs.findIndex((c) => c.id === cv.id);
    if (i === -1) data.cvs.push(cv);
    else data.cvs[i] = cv;
    writeLocal(data);
  },
  async deleteCv(id) {
    const data = readLocal();
    writeLocal({ ...data, cvs: data.cvs.filter((c) => c.id !== id) });
  },
  async exportPdf() {
    window.print();
    return null;
  },
  async openPath() {},
};

export const isElectron = typeof window !== "undefined" && !!window.api;
export const api: Api = window.api ?? browserApi;
