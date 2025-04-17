import React, { useState } from 'react';
import styles from './ObjectCatalogPopup.module.css';
import { useTranslation } from 'react-i18next';

export default function ObjectCatalogPopup({ x, y, objects, onSelect, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const { i18n } = useTranslation(); // ✅ muss HIER stehen, innerhalb der Funktion
  const currentLang = i18n.language;
  const forceEnglish = localStorage.getItem("forceEnglishObjectNames") === "true";

  const getLocalizedText = (obj, field) => {
    const value = obj[field];
    if (typeof value === 'object') {
      if (forceEnglish && field === 'name') {
        return value['en'] || '???';
      }
      return value[currentLang] || value['en'] || '???';
    }
    return value;
  };

  const filtered = objects.filter(o =>
    getLocalizedText(o, 'name').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={styles.popup}
      style={{ top: y, left: x }}
      onMouseLeave={onClose}
    >
      <input
        className={styles.search}
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        autoFocus
      />

      <div className={styles.grid}>
        {filtered.map(obj => (
          <div
            key={obj.id}
            className={styles.tile}
            title={`${getLocalizedText(obj, 'name')} (${obj.width}x${obj.height})`}
            onClick={() => onSelect(obj.id)}
            style={{ backgroundColor: obj.color || '#ccc' }}
          >
            <span className={styles.label}>{getLocalizedText(obj, 'name')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
