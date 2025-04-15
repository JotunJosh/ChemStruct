const fs = require('fs');
const path = require('path');
const { app, dialog, BrowserWindow } = require('electron');

/**
 * Öffnet einen Dateidialog und importiert eine Übersetzungsdatei.
 */
async function importCommunityLanguage() {
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
}

module.exports = { importCommunityLanguage };