const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  load: () => ipcRenderer.invoke("data:load"),
  saveProfile: (profile) => ipcRenderer.invoke("profile:save", profile),
  saveCv: (cv) => ipcRenderer.invoke("cv:save", cv),
  deleteCv: (id) => ipcRenderer.invoke("cv:delete", id),
  exportPdf: (fileName) => ipcRenderer.invoke("cv:export-pdf", fileName),
  openPath: (filePath) => ipcRenderer.invoke("shell:open-path", filePath),
});
