import React from 'react';
import { ipcRenderer } from 'electron';

const ImportTranslationButton = ({ onImport }) => {
  const handleClick = async () => {
    try {
      const filename = await ipcRenderer.invoke('import-community-translation');
      if (filename && onImport) {
        onImport(filename); // z. B. Liste neu laden
        alert(`Import erfolgreich: ${filename}`);
      }
    } catch (err) {
      console.error(err);
      alert('Import fehlgeschlagen.');
    }
  };

  return (
    <button onClick={handleClick}>
      ➕ Community-Übersetzung importieren
    </button>
  );
};

export default ImportTranslationButton;
