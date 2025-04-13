const { app } = require('electron');
const fs = require('fs');
const path = require('path');

// 📁 Daten landen in userData (beschreibbares Verzeichnis)
const getUserDataPath = (filename) => {
  const dir = app.getPath('userData');
  return path.join(dir, filename);
};

// 🔄 Datei aus data/ kopieren oder neu erstellen
const ensureFileExists = (filename, defaultContent = '[]') => {
  const targetPath = getUserDataPath(filename);

  if (!fs.existsSync(targetPath)) {
    const fallbackSource = path.join(__dirname, '..', 'data', filename);
    console.log("📦 Fallback-Quelle prüfen:", fallbackSource);

    try {
      if (fs.existsSync(fallbackSource)) {
        fs.copyFileSync(fallbackSource, targetPath);
        console.log(`📦 ${filename} aus /data kopiert ➜ ${targetPath}`);
      } else {
        fs.writeFileSync(targetPath, defaultContent, 'utf-8');
        console.log(`📄 ${filename} neu erstellt im userData-Ordner`);
      }
    } catch (err) {
      console.error(`❌ Fehler bei Datei ${filename}:`, err);
    }
  }
};

const readFile = (filename) => {
  const filePath = getUserDataPath(filename);
  return fs.readFileSync(filePath, 'utf-8');
};

const writeFile = (filename, content) => {
  const filePath = getUserDataPath(filename);
  fs.writeFileSync(filePath, content, 'utf-8');
};

module.exports = {
  getUserDataPath,
  ensureFileExists,
  readFile,
  writeFile,
};
