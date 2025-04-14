import React, { useEffect, useState } from 'react';
import { getAvailableLanguages } from '../utils/getAvailableLanguages';
import { loadLanguageFile } from '../i18n';
import i18n from 'i18next';

const LanguageSelector = () => {
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState(i18n.language);

  useEffect(() => {
    const langs = getAvailableLanguages();
    setLanguages(langs);
  }, []);

  const handleChange = async (e) => {
    const langCode = e.target.value;
    setSelectedLang(langCode);
    await loadLanguageFile(langCode);
  };

  return (
    <div>
      <label htmlFor="lang-select">🌐 Sprache wählen:</label>
      <select id="lang-select" value={selectedLang} onChange={handleChange}>
        <optgroup label="Offiziell">
          {languages
            .filter((l) => !l.isCommunity)
            .map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
        </optgroup>
        <optgroup label="Community">
          {languages
            .filter((l) => l.isCommunity)
            .map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
        </optgroup>
      </select>
    </div>
  );
};

export default LanguageSelector;
