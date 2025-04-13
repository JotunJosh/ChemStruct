// ✅ Preload-Skript erfolgreich geladen
console.log("✅ Preload-Skript wurde ausgeführt!");


const { contextBridge, ipcRenderer, shell, dialog  } = require("electron");

/**
 * 🌉 Exponiert Funktionen aus dem Main-Prozess im sicheren Kontext des Frontends.
 * Exposes safe IPC functions to the renderer process using contextBridge.
 */

contextBridge.exposeInMainWorld('api', {
  // JSON-Dateien zentral verwalten
  readJsonFile: (filename) => ipcRenderer.invoke('readJsonFile', filename),
  writeJsonFile: (filename, data) => ipcRenderer.invoke('writeJsonFile', { filename, data }),
  resetJsonFile: (filename) => ipcRenderer.invoke('resetJsonFile', filename),

  // für Import/Export
  readFile: (path) => ipcRenderer.invoke('readFile', path),
  writeFile: (path, content) => ipcRenderer.invoke('writeFile', { path, content }),
  showSaveDialog: (defaultName) => ipcRenderer.invoke('showSaveDialog', defaultName),
  showOpenDialog: (type) => ipcRenderer.invoke('showOpenDialog', type),

  writeJsonFile: (path, data) => ipcRenderer.invoke('writeJsonFile', path, data),
  readJsonFile: (path) => ipcRenderer.invoke('readJsonFile', path),
  listLayouts: () => ipcRenderer.invoke('listLayouts'),
  readLayoutFile: (name) => ipcRenderer.invoke('readLayoutFile', name),
  showSaveDialog: (defaultName) => ipcRenderer.invoke('showSaveDialog', defaultName),
  writeFile: (filePath, content) => ipcRenderer.invoke('writeFile', filePath, content),
  showOpenDialog: (fileType) => ipcRenderer.invoke('showOpenDialog', fileType),
  readFile: (filePath) => ipcRenderer.invoke('readFile', filePath),
});

contextBridge.exposeInMainWorld("electronAPI", {
    // 🌐 Öffnet externe Links im Standardbrowser
    // Opens external links in the user's default browser
    // openExternalLink: (url) => shell.openExternal(url),
    openExternalLink: (url) => ipcRenderer.invoke("open-external-link", url),

  //Lesen und Schreiben in json Dateien
  writeFile: (filePath, data) => ipcRenderer.invoke('writeFile', filePath, data),
  readFile: (filePath) => ipcRenderer.invoke('readFile', filePath),

  // Im- und Export Funktion
  showSaveDialog: (defaultFileName) => ipcRenderer.invoke("showSaveDialog", defaultFileName),
  showOpenDialog: () => ipcRenderer.invoke("showOpenDialog"),

  // 📦 Gibt die aktuelle App-Version zurück
  // Returns the current app version
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),

  // 📋 Gibt den Änderungsverlauf (Changelog) der App zurück
  // Returns the release log of the app
  getReleaseLog: () => ipcRenderer.invoke("get-release-log"),

  // 🔍 Prüft, ob ein neues Update verfügbar ist
  // Checks if an update is available
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),

  // 🔄 Empfängt Statusmeldungen vom Updater (z. B. für Fortschrittsanzeigen)
  // Receives status messages from the updater (e.g., for progress display)
  onUpdateStatus: (callback) =>
    ipcRenderer.on("update-status", (_, message) => callback(message)),

  // 🧰 Prüft, ob eine Datei existiert
  // Checks if a file exists
  fileExists: (filePath) => ipcRenderer.invoke("fileExists", filePath),

  // 🧰 Liest eine Datei (z. B. JSON)
  // Reads a file (e.g., JSON)
  readFile: (filePath) => ipcRenderer.invoke("readFile", filePath),

  // 🧰 Schreibt Daten in eine Datei
  // Writes data to a file
  writeFile: (filePath, data) => ipcRenderer.invoke("writeFile", filePath, data),

  // 🧪 Gibt zurück, ob die App im Entwicklungsmodus läuft
  // Returns whether the app is running in development mode
  isDev: () => ipcRenderer.invoke("is-dev"),
});

/**
 * 🧪 Fallback: Entwicklungsmodus direkt im Fenster verfügbar machen
 * (nur wenn kein contextBridge Zugriff möglich ist)
 * Fallback to provide development mode info directly in the window
 */
contextBridge.exposeInMainWorld("appInfo", {
  isDev: !process.env.NODE_ENV || process.env.NODE_ENV === "development"
});