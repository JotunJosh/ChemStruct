const { contextBridge, ipcRenderer } = require("electron");

console.log("✅ Preload-Skript wurde ausgeführt!");

contextBridge.exposeInMainWorld("api", {
  // 🔄 JSON-Dateien zentral verwalten
  readJsonFile: (filename) => ipcRenderer.invoke("readJsonFile", { path: filename }),
  writeJsonFile: (filename, data) => ipcRenderer.invoke("writeJsonFile", { path: filename, data }),
  resetJsonFile: (filename) => ipcRenderer.invoke("resetJsonFile", filename),

  // 📁 Für Import/Export
  readFile: (filePath) => ipcRenderer.invoke("readFile", filePath),
  writeFile: (filePath, data) => ipcRenderer.invoke("writeFile", { path: filePath, content: data }),
  showSaveDialog: (defaultName) => ipcRenderer.invoke("showSaveDialog", defaultName),
  showOpenDialog: (fileType) => ipcRenderer.invoke("showOpenDialog", fileType),

  // 🗂️ Layout-Funktionen
  listLayouts: () => ipcRenderer.invoke("listLayouts"),
  readLayoutFile: (name) => ipcRenderer.invoke("readLayoutFile", name),

  // 🌐 Externe Links
  openExternalLink: (url) => ipcRenderer.invoke("open-external-link", url),

  // 🧰 Hilfsfunktionen
  fileExists: (filePath) => ipcRenderer.invoke("fileExists", filePath),
  isDev: () => ipcRenderer.invoke("is-dev"),

  // 📦 App-Infos & Update
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  getReleaseLog: () => ipcRenderer.invoke("get-release-log"),
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
  onUpdateStatus: (callback) =>
    ipcRenderer.on("update-status", (_, message) => callback(message)),

  // 🌍 Übersetzungsfunktionen
  getAvailableLanguages: () => ipcRenderer.invoke("get-available-languages"),
  importCommunityTranslation: () => ipcRenderer.invoke("import-community-translation"),
  loadLanguageFile: (langCode) => ipcRenderer.invoke("load-language-file", langCode),
  downloadLanguageTemplate: () => ipcRenderer.invoke("download-language-template"),
});

// Fallback für Entwicklungsmodus im Frontend
contextBridge.exposeInMainWorld("appInfo", {
  isDev: !process.env.NODE_ENV || process.env.NODE_ENV === "development",
});
