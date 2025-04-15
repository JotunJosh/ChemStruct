const fs = require('fs');
const path = require('path');
const i18n = require('i18next');
const Backend = require('i18next-fs-backend');
const { app } = require('electron');

function loadLanguageFile(langCode) {
  const isCommunity = langCode.startsWith('community:');
  const cleanCode = langCode.replace('community:', '');

  const filepath = isCommunity
    ? path.join(app.getPath('userData'), 'i18n', 'community', `${cleanCode}.translation.json`)
    : path.join(__dirname, '../src/locales', cleanCode, 'translation.json');

  try {
    const fileContent = fs.readFileSync(filepath, 'utf-8');
    const json = JSON.parse(fileContent);
    i18n.addResourceBundle(langCode, 'translation', json, true, true);
    i18n.changeLanguage(langCode);
    return true;
  } catch (err) {
    console.error('Fehler beim Laden der Sprachdatei:', err);
    return false;
  }
}

module.exports = { loadLanguageFile };