const fs = require('fs');
const path = require('path');

const referenceLang = 'en';
const targetLang = process.argv[2]; // z. B. "fr"

if (!targetLang) {
  console.error('⚠️ Bitte gib eine Sprachkennung an, z. B.:');
  console.error('   node scripts/fillMissingTranslations.js fr');
  process.exit(1);
}

const refPath = path.join(__dirname, `../src/locales/${referenceLang}/translation.json`);
const targetPath = path.join(__dirname, `../src/locales/${targetLang}/translation.json`);

if (!fs.existsSync(targetPath)) {
  console.error(`❌ Datei für Sprache "${targetLang}" nicht gefunden unter: ${targetPath}`);
  process.exit(1);
}

const refData = JSON.parse(fs.readFileSync(refPath, 'utf-8'));
const targetData = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));

const fillMissing = (ref, target) => {
  const result = { ...target };

  for (const key in ref) {
    if (typeof ref[key] === 'object' && ref[key] !== null) {
      result[key] = fillMissing(ref[key], target[key] || {});
    } else {
      if (!(key in target)) {
        result[key] = "";
      } else {
        result[key] = target[key];
      }
    }
  }

  return result;
};

const fixedData = fillMissing(refData, targetData);

fs.writeFileSync(targetPath, JSON.stringify(fixedData, null, 2), 'utf-8');

console.log(`✅ Fehlende Keys in "${targetLang}" wurden ergänzt (leere Strings).`);
