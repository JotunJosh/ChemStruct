import fs from 'fs';
import path from 'path';
import { app } from 'electron';

export function getAvailableLanguages() {
  const basePath = path.resolve(__dirname, '../locales');

  const official = fs.readdirSync(basePath)
    .filter((dir) => fs.statSync(path.join(basePath, dir)).isDirectory())
    .map((lang) => ({
      code: lang,
      name: lang.charAt(0).toUpperCase() + lang.slice(1),
      isCommunity: false,
    }));

  const appDataPath = path.join(app.getPath('userData'), 'i18n', 'community');
  const community = [];

  if (fs.existsSync(appDataPath)) {
    fs.readdirSync(appDataPath).forEach((file) => {
      if (file.endsWith('.translation.json')) {
        const code = path.basename(file, '.translation.json');
        try {
          const content = JSON.parse(fs.readFileSync(path.join(appDataPath, file), 'utf-8'));
          const name = content?.meta?.name || `Community: ${code}`;
          community.push({ code: `community:${code}`, name, isCommunity: true });
        } catch (e) {
          console.warn(`Fehler beim Parsen von ${file}:`, e);
        }
      }
    });
  }

  return [...official, ...community];
}
