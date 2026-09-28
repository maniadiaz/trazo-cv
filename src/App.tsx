import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import type { AppData, Cv, Profile } from "./types";
import { api } from "./lib/api";
import { duplicateCv } from "./lib/factory";
import Home from "./screens/Home";
import ProfileScreen from "./screens/ProfileScreen";
import Wizard from "./screens/Wizard";
import Editor from "./screens/Editor";

export type View = { name: "home" } | { name: "profile"; firstRun?: boolean } | { name: "wizard" } | { name: "editor"; id: string };

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>({ name: "home" });

  useEffect(() => {
    api.load().then(
      (d) => {
        setData(d);
        // Primera vez (o datos vacíos): se abre directamente «Mis datos».
        const p = d.profile;
        if (!p.name.trim() && !p.email.trim() && !p.phone.trim()) setView({ name: "profile", firstRun: true });
      },
      (e) => setError(String(e)),
    );
  }, []);

  const saveProfile = useCallback(async (profile: Profile) => {
    setData((d) => d && { ...d, profile });
    await api.saveProfile(profile);
  }, []);

  const addCv = useCallback(async (cv: Cv) => {
    setData((d) => d && { ...d, cvs: [...d.cvs, cv] });
    await api.saveCv(cv);
    setView({ name: "editor", id: cv.id });
  }, []);

  // El guardado en disco lo hace el editor con un pequeño retraso; aquí solo se actualiza el estado.
  const updateCv = useCallback((cv: Cv) => {
    setData((d) => d && { ...d, cvs: d.cvs.map((c) => (c.id === cv.id ? cv : c)) });
  }, []);

  const removeCv = useCallback(async (id: string) => {
    setData((d) => d && { ...d, cvs: d.cvs.filter((c) => c.id !== id) });
    await api.deleteCv(id);
  }, []);

  const copyCv = useCallback(async (cv: Cv) => {
    const copy = duplicateCv(cv);
    setData((d) => d && { ...d, cvs: [...d.cvs, copy] });
    await api.saveCv(copy);
  }, []);

  if (error)
    return (
      <div className="grid h-full place-items-center p-8 text-center text-red-300">
        No se pudieron cargar los datos: {error}
      </div>
    );
  if (!data) return null;

  const editing = view.name === "editor" ? data.cvs.find((c) => c.id === view.id) : undefined;

  let screen;
  switch (view.name) {
    case "home":
      screen = <Home data={data} go={setView} onDelete={removeCv} onDuplicate={copyCv} />;
      break;
    case "profile":
      screen = <ProfileScreen profile={data.profile} onSave={saveProfile} go={setView} firstRun={view.firstRun} />;
      break;
    case "wizard":
      screen = <Wizard profile={data.profile} onCreate={addCv} go={setView} />;
      break;
    case "editor":
      screen = editing ? (
        <Editor cv={editing} profile={data.profile} onChange={updateCv} go={setView} />
      ) : (
        <Home data={data} go={setView} onDelete={removeCv} onDuplicate={copyCv} />
      );
      break;
  }

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        <motion.div
          key={view.name === "editor" ? `editor-${view.id}` : view.name}
          className="h-full"
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.25 }}
        >
          {screen}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
