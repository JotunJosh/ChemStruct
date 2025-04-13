const fs = require('fs');
const path = require('path');

// Setze hier die Referenzsprache (z. B. en oder de)
const referenceLang = 'en';
const checkLang = process.argv[2]; // Sprachcode über Argument, z. B. "fr"

if (!checkLang) {
  console.error('⚠️ Bitte gib eine Sprachkennung an, z. B.:');
  console.error('   node scripts/checkTranslationFile.js fr');
  process.exit(1);
}

const refPath = path.join(__dirname, `../src/locales/${referenceLang}/translation.json`);
const checkPath = path.join(__dirname, `../src/locales/${checkLang}/translation.json`);

if (!fs.existsSync(checkPath)) {
  console.error(`❌ Datei für Sprache "${checkLang}" nicht gefunden unter: ${checkPath}`);
  process.exit(1);
}

const refData = JSON.parse(fs.readFileSync(refPath, 'utf-8'));
const checkData = JSON.parse(fs.readFileSync(checkPath, 'utf-8'));

const flatten = (obj, prefix = '') =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      Object.assign(acc, flatten(value, path));
    } else {
      acc[path] = value;
    }
    return acc;
  }, {});

const refFlat = flatten(refData);
const checkFlat = flatten(checkData);

const missingKeys = [];
const extraKeys = [];

for (const key of Object.keys(refFlat)) {
  if (!(key in checkFlat)) missingKeys.push(key);
}

for (const key of Object.keys(checkFlat)) {
  if (!(key in refFlat)) extraKeys.push(key);
}

console.log(`🔍 Vergleich von "${referenceLang}" ↔ "${checkLang}"`);

if (missingKeys.length === 0 && extraKeys.length === 0) {
  console.log('✅ Alles okay! Die Sprachdatei ist vollständig.');
} else {
  if (missingKeys.length > 0) {
    console.log('\n❗️Fehlende Keys:');
    missingKeys.forEach(k => console.log(`  - ${k}`));
  }
  if (extraKeys.length > 0) {
    console.log('\n⚠️ Unnötige/zusätzliche Keys:');
    extraKeys.forEach(k => console.log(`  - ${k}`));
  }
}
