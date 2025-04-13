const { ipcMain, dialog, app } = require('electron');
const fs = require('fs');
const path = require('path');
const fileManager = require('./fileManager.cjs');

// Dateien direkt lesen (Import)
ipcMain.handle('readFile', (event, filepath) => {
  return fs.readFileSync(filepath, 'utf-8');
});

// Dateien direkt schreiben (Export)
ipcMain.handle('writeFile', (event, { path, content }) => {
  fs.writeFileSync(path, content, 'utf-8');
});

// Export-Dialog
ipcMain.handle('showSaveDialog', async (event, defaultName) => {
  const result = await dialog.showSaveDialog({
    defaultPath: defaultName,
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  return result.canceled ? null : result.filePath;
});

// Import-Dialog
ipcMain.handle('showOpenDialog', async (event, fileType = 'json') => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Datei öffnen',
    filters: [{ name: fileType.toUpperCase(), extensions: [fileType] }],
    properties: ['openFile']
  });

  if (canceled || filePaths.length === 0) return null;
  return filePaths[0];
});

// Zurücksetzen auf Original (aus /data/)
ipcMain.handle('resetJsonFile', (event, filename) => {
  const userDataPath = path.join(app.getPath('userData'), filename);
  const fallbackPath = path.join(__dirname, '..', 'data', filename);

  if (!fs.existsSync(fallbackPath)) {
    throw new Error(`Fallback-Datei nicht gefunden: ${fallbackPath}`);
  }

  fs.copyFileSync(fallbackPath, userDataPath);
  return true;
});

ipcMain.handle('writeJsonFile', async (event, relativePath, data) => {
  const userDataPath = app.getPath('userData');
  const targetPath = path.join(userDataPath, relativePath);

  try {
    // sicherstellen, dass der Ordner existiert
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Fehler beim Schreiben:', err);
    throw err;
  }
});

// Beliebige JSON-Datei aus userData lesen
ipcMain.handle('readJsonFile', async (event, relativePath) => {
  const userDataPath = app.getPath('userData');
  const targetPath = path.join(userDataPath, relativePath);

  try {
    const data = fs.readFileSync(targetPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('❌ Fehler beim Lesen der JSON-Datei:', err);
    throw err;
  }
});

// Liste aller gespeicherten Layout-Dateien (Dateinamen ohne .json)
ipcMain.handle('listLayouts', async () => {
  const layoutDir = path.join(app.getPath('userData'), 'layouts');

  try {
    fs.mkdirSync(layoutDir, { recursive: true });
    const files = fs.readdirSync(layoutDir)
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
    return files;
  } catch (err) {
    console.error('❌ Fehler beim Lesen der Layout-Liste:', err);
    throw err;
  }
});

// Einzelnes Layout aus layouts laden
ipcMain.handle('readLayoutFile', async (event, layoutName) => {
  const filePath = path.join(app.getPath('userData'), 'layouts', `${layoutName}.json`);

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('❌ Fehler beim Lesen des Layouts:', err);
    throw err;
  }
});
