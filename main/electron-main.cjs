const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const fileManager = require('./fileManager.cjs');
const { importCommunityTranslation } = require('./utils/importCommunityLanguage.cjs');

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
require('./ipcAppHandlers.cjs');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // Menu.setApplicationMenu(null);
  // mainWindow.setMenuBarVisibility(false);
  // mainWindow.removeMenu();

  mainWindow.loadURL(`file://${path.join(__dirname, '../dist/index.html')}`);
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});