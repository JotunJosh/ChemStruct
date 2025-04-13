const fs = require('fs');
const path = require('path');

// Quelle: z. B. Deutsch
const sourcePath = path.join(__dirname, '../src/locales/de/translation.json');
// Ziel: Template-Datei
const templatePath = path.join(__dirname, '../src/locales/template.translation.json');

const raw = fs.readFileSync(sourcePath, 'utf-8');
const data = JSON.parse(raw);

// Rekursive Funktion zum Leeren aller Texte
const clearValues = (obj) => {
  const cleared = {};
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      cleared[key] = clearValues(obj[key]);
    } else {
      cleared[key] = "";
    }
  }
  return cleared;
};

const templateData = clearValues(data);

fs.writeFileSync(templatePath, JSON.stringify(templateData, null, 2), 'utf-8');

console.log('✅ Template-Datei erstellt unter:', templatePath);
