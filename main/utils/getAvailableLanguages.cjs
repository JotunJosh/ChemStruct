const path = require('path');
const fs = require('fs');

const getAvailableLanguages = () => {
  // Zugriff direkt auf src/data/locales
  const localesDir = path.join(__dirname, '../../src/data/locales');

  if (!fs.existsSync(localesDir)) {
    console.warn('Locales-Verzeichnis nicht gefunden:', localesDir);
    return [];
  }

  const files = fs.readdirSync(localesDir);
  return files
    .filter(file => file.endsWith('.translation.json'))
    .map(file => file.replace('.translation.json', ''));
};

module.exports = { getAvailableLanguages };
