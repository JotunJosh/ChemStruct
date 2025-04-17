import React from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

const ImportTranslationButton = ({ onImport }) => {
  const handleClick = async () => {
    try {
      const filename = await ipcRenderer.invoke('import-community-translation');
      if (filename && onImport) {
        onImport(filename); // z. B. Liste neu laden
        alert(`${t("importLanguageDone")} ${filename}`);
      }
    } catch (err) {
      console.error(err);
      alert(`❌ ${t("importLanguageError")}`);
    }
  };

  return (
    <button onClick={handleClick}>
      ➕ {t("importLanguage")}
    </button>
  );
};

export default ImportTranslationButton;
