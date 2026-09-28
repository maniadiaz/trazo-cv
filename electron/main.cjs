const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require("electron");
const path = require("node:path");
const fs = require("node:fs/promises");

const isDev = process.argv.includes("--dev");
const DEV_URL = "http://127.0.0.1:5173";
const APP_BG = "#07060b";

// ---------- Persistencia: un único JSON en la carpeta de datos del usuario ----------

const dataFile = () => path.join(app.getPath("userData"), "datos-cv.json");

const emptyData = () => ({
  profile: { name: "", headline: "", email: "", phone: "", location: "", links: [] },
  cvs: [],
});

async function readData() {
  let raw;
  try {
    raw = await fs.readFile(dataFile(), "utf8");
  } catch (err) {
    if (err.code === "ENOENT") return emptyData();
    throw err;
  }
  try {
    return { ...emptyData(), ...JSON.parse(raw) };
  } catch {
    // JSON dañado: se guarda una copia para no perder nada y se empieza limpio.
    await fs.copyFile(dataFile(), `${dataFile()}.${Date.now()}.bak`);
    return emptyData();
  }
}

async function writeData(data) {
  const file = dataFile();
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, file);
}

// Serializa las escrituras para que dos guardados seguidos no se pisen.
let queue = Promise.resolve();
function mutate(fn) {
  const run = queue.then(async () => {
    const data = await readData();
    fn(data);
    await writeData(data);
  });
  queue = run.catch(() => {});
  return run;
}

ipcMain.handle("data:load", () => readData());

ipcMain.handle("profile:save", (_e, profile) =>
  mutate((data) => {
    data.profile = profile;
  }),
);

ipcMain.handle("cv:save", (_e, cv) =>
  mutate((data) => {
    const i = data.cvs.findIndex((c) => c.id === cv.id);
    if (i === -1) data.cvs.push(cv);
    else data.cvs[i] = cv;
  }),
);

ipcMain.handle("cv:delete", (_e, id) =>
  mutate((data) => {
    data.cvs = data.cvs.filter((c) => c.id !== id);
  }),
);

// ---------- Exportar a PDF: se imprime la ventana con los estilos @media print ----------

/**
 * Genera el PDF de la ventana. Chromium pinta los márgenes de cada hoja con el color de
 * fondo de la ventana (no con el del HTML), así que se pone en blanco mientras se imprime.
 */
async function renderPdf(win) {
  win.setBackgroundColor("#ffffff");
  try {
    return await win.webContents.printToPDF({
      pageSize: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
  } finally {
    win.setBackgroundColor(APP_BG);
  }
}

ipcMain.handle("cv:export-pdf", async (event, fileName) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const safeName = String(fileName || "CV").replace(/[\/:*?"<>|]+/g, "-").trim() || "CV";
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: "Exportar CV a PDF",
    defaultPath: path.join(app.getPath("documents"), `${safeName}.pdf`),
    filters: [{ name: "PDF", extensions: ["pdf"] }],
  });
  if (canceled || !filePath) {
    win?.webContents.focus();
    return null;
  }

  const pdf = await renderPdf(win);
  await fs.writeFile(filePath, pdf);
  win?.webContents.focus();
  return filePath;
});

ipcMain.handle("shell:open-path", (_e, filePath) => shell.openPath(filePath));

// ---------- Ventana ----------

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    backgroundColor: APP_BG,
    title: "Trazo CV",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });

  win.once("ready-to-show", () => win.show());

  // Tras un diálogo nativo, Electron en Windows puede dejar la página sin recibir texto
  // (solo funciona Retroceso). Al recuperar el foco de la ventana se lo damos a la página.
  win.on("focus", () => win.webContents.focus());

  // Los enlaces (LinkedIn, GitHub…) se abren en el navegador, nunca dentro de la app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:|^mailto:|^tel:/.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (isDev && url.startsWith(DEV_URL)) return;
    e.preventDefault();
    if (/^https?:|^mailto:|^tel:/.test(url)) shell.openExternal(url);
  });

  if (isDev) {
    win.loadURL(DEV_URL);
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

if (!isDev) Menu.setApplicationMenu(null);

module.exports = { renderPdf };

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
