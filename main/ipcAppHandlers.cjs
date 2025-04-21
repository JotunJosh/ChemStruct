// ipcAppHandlers.cjs
const { app, ipcMain, shell } = require('electron');
const path = require('path');

ipcMain.handle("getUserDataPath", (event, filename) => {
  return path.join(app.getPath('userData'), filename);
});

ipcMain.handle("ping", () => {
  return 'pong from main process';
});

ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});

ipcMain.handle("open-external-link", (event, url) => {
  return shell.openExternal(url);
});
