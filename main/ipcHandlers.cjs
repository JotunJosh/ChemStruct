const { ipcMain, dialog, app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const fileManager = require('./fileManager.cjs');
const { loadLanguageFile } = require('../src/utils/i18n.cjs');
const https = require('https');

// Aktuelle Sprach Template herunterladen
ipcMain.handle('download-language-template', async () => {
  const url = 'https://raw.githubusercontent.com/JotunJosh/chemstruct/main/src/locales/template.translation.json';
  const targetDir = path.join(app.getPath('userData'), 'i18n', 'community');
  const targetPath = path.join(targetDir, 'template.translation.json');

  return new Promise((resolve, reject) => {
    fs.mkdirSync(targetDir, { recursive: true });

    const file = fs.createWriteStream(targetPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        return reject(new Error(`HTTP-Fehler: ${response.statusCode}`));
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve('template.translation.json'));
      });
    }).on('error', (err) => {
      fs.unlinkSync(targetPath);
      reject(err);
    });
  });
});

// Community Sprachen verfügbar machen
ipcMain.handle('get-available-languages', async () => {
  const basePath = path.join(__dirname, '../src/locales');

  const official = fs.readdirSync(basePath)
    .filter((dir) => fs.statSync(path.join(basePath, dir)).isDirectory())
    .map((lang) => ({
      code: lang,
      name: lang.charAt(0).toUpperCase() + lang.slice(1),
      isCommunity: false,
    }));

  const communityDir = path.join(app.getPath('userData'), 'i18n', 'community');
  const community = [];

  if (fs.existsSync(communityDir)) {
    fs.readdirSync(communityDir).forEach((file) => {
      if (file.endsWith('.translation.json')) {
        const code = path.basename(file, '.translation.json');
        try {
          const content = JSON.parse(fs.readFileSync(path.join(communityDir, file), 'utf-8'));
          const name = content?.meta?.name || `Community: ${code}`;
          community.push({ code: `community:${code}`, name, isCommunity: true });
        } catch (e) {
          console.warn(`❌ Fehler beim Parsen von ${file}:`, e);
        }
      }
    });
  }

  return [...official, ...community];
});

// Community Sprachen importieren
ipcMain.handle('import-community-translation', async () => {
  const win = BrowserWindow.getFocusedWindow();
  const result = await dialog.showOpenDialog(win, {
    title: 'Übersetzungsdatei importieren',
    filters: [{ name: 'JSON-Dateien', extensions: ['json'] }],
    properties: ['openFile'],
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  const selectedFile = result.filePaths[0];
  const filename = path.basename(selectedFile);

  if (!filename.endsWith('.translation.json')) {
    throw new Error('Nur Dateien mit .translation.json erlaubt.');
  }

  const targetDir = path.join(app.getPath('userData'), 'i18n', 'community');
  const targetPath = path.join(targetDir, filename);

  fs.mkdirSync(targetDir, { recursive: true });
  fs.copyFileSync(selectedFile, targetPath);

  return filename;
});

ipcMain.handle('load-language-file', async (_event, langCode) => {
  if (!langCode || typeof langCode !== 'string') {
    console.warn("⚠️ Ungültiger Sprachcode bei load-language-file:", langCode);
    return null;
  }

  try {
    const { app } = require('electron');
    const fs = require('fs');
    const path = require('path');

    const cleanCode = langCode.replace('community:', '');
    const filePath = path.join(app.getPath('userData'), 'i18n', 'community', `${cleanCode}.translation.json`);

    console.log("📂 Lade Sprachdatei von:", filePath);

    if (!fs.existsSync(filePath)) {
      console.warn("❌ Datei existiert nicht:", filePath);
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    console.log("✅ Sprachdatei geladen:", content.slice(0, 100), "..."); // nur ein Auszug

    return JSON.parse(content);
  } catch (err) {
    console.error("❌ Fehler beim Parsen der Sprachdatei:", err);
    return null;
  }
});

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
