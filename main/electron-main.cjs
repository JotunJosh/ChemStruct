const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const fileManager = require('./fileManager.cjs');
const { importCommunityLanguage } = require('../src/utils/importCommunityLanguage.cjs');

app.whenReady().then(() => {
  const userDataPath = app.getPath('userData');
  console.log("📂 App speichert Daten in:", userDataPath); // 🖨 Terminal-Ausgabe

  // if (!app.isPackaged) {
  //   shell.openPath(userDataPath); // 🪟 Öffnet Explorer/Finder nur im Dev-Modus
  // }

  fileManager.ensureFileExists('buildings.json');
  fileManager.ensureFileExists('objects.json');
  createWindow();
});

require('./ipcHandlers.cjs');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  mainWindow.loadURL(`file://${path.join(__dirname, '../dist/index.html')}`);
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// 🛠 IPC-Kommandos für Renderer-Prozess
ipcMain.handle("getUserDataPath", (event, filename) => {
  return path.join(app.getPath('userData'), filename);
});

ipcMain.handle('ping', () => {
  return 'pong from main process';
});

ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});

ipcMain.handle("open-external-link", (event, url) => {
  return shell.openExternal(url);
});