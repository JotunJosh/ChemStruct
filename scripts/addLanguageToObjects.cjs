const fs = require('fs');

const filePath = './data/objects.json';
const targetLang = 'fr'; // z. B. Französisch hinzufügen

const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

for (const obj of data) {
  if (typeof obj.name === 'object') {
    obj.name[targetLang] ??= "";
  }
  if (typeof obj.description === 'object') {
    obj.description[targetLang] ??= "";
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
console.log(`✅ Sprache "${targetLang}" hinzugefügt (mit leeren Feldern, falls nötig).`);
