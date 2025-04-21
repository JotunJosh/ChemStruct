import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./SettingsPage.css";

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const storedDarkMode = localStorage.getItem("darkMode") === "true";
  const [darkMode, setDarkMode] = useState(storedDarkMode);
  const [selectedLanguage, setSelectedLanguage] = useState(localStorage.getItem("language") || "en");
  const { api } = window;
  const [availableLanguages, setAvailableLanguages] = useState([]);

  useEffect(() => {
    api.getAvailableLanguages().then((langs) => {
      setAvailableLanguages(langs);
    });
  }, []);

  console.log("🔍 api:", window.api);
  console.log("🔍 openExternalLink:", window.api?.openExternalLink);

  useEffect(() => {
    if (storedDarkMode) {
      document.body.classList.add("dark-mode");
    }
  }, [storedDarkMode]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
    document.body.classList.toggle("dark-mode", newDarkMode);
  };

  const changeLanguage = (language) => {
    setSelectedLanguage(language);
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  };

  const storedNameMode = localStorage.getItem("forceEnglishObjectNames") === "true";
  const [forceEnglishObjectNames, setForceEnglishObjectNames] = useState(storedNameMode);

  const handleToggleCatalogAutoClose = () => {
    const newValue = !catalogAutoClose;
    setCatalogAutoClose(newValue);
    localStorage.setItem("catalogAutoClose", newValue);
  };

  const storedCatalogAutoClose = localStorage.getItem("catalogAutoClose") !== "false";
  const [catalogAutoClose, setCatalogAutoClose] = useState(storedCatalogAutoClose);

  return (
    <div className="settings-container">
      <h1>{t("settings.title")}</h1>

      {/* 🌐 Sprache */}
      <div className="settings-section language-section">
        <h2>{t("settings.language")}</h2>
        <select
          className="language-select"
          value={selectedLanguage}
          onChange={async (e) => {
            const langCode = e.target.value;
            console.log("📦 Wechsle Sprache zu:", langCode);
            setSelectedLanguage(langCode);
            localStorage.setItem("language", langCode);

            try {
              if (langCode.startsWith("community:")) {
                const json = await window.api.loadLanguageFile(langCode);
                if (json) {
                  i18n.addResourceBundle(langCode, "translation", json, true, true);
                } else {
                  console.warn("⚠️ Keine gültige Übersetzung erhalten!");
                }
              }

              await i18n.changeLanguage(langCode);
            } catch (err) {
              console.error("❌ Fehler beim Sprachwechsel:", err);
            }
          }}
        >
          {availableLanguages
            .filter((l) => !l.isCommunity)
            .map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          <optgroup label="Community">
            {availableLanguages
              .filter((l) => l.isCommunity)
              .map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
          </optgroup>
        </select>

        <div className="setting-row">
          <label htmlFor="nameToggle">{t("settings.forceEnglishNames")}</label>
          <label className="switch">
            <input
              id="nameToggle"
              type="checkbox"
              checked={forceEnglishObjectNames}
              onChange={(e) => {
                const newValue = e.target.checked;
                setForceEnglishObjectNames(newValue);
                localStorage.setItem("forceEnglishObjectNames", newValue);
              }}
            />
            <span className="slider round"></span>
          </label>
        </div>

        <div className="setting-row">
          <label htmlFor="catalogAutoCloseToggle">{t("settings.catalogAutoClose")}</label>
          <label className="switch">
            <input
              id="catalogAutoCloseToggle"
              type="checkbox"
              checked={catalogAutoClose}
              onChange={handleToggleCatalogAutoClose}
            />
            <span className="slider round"></span>
          </label>
        </div>

        <div className="button-row">
          <button onClick={async () => {
            try {
              const filename = await window.api.importCommunityTranslation();
              if (filename) {
                alert(`✅ Importiert: ${filename}`);
                const refreshedLangs = await window.api.getAvailableLanguages();
                setAvailableLanguages(refreshedLangs);
                const newLangCode = `community:${filename.replace(".translation.json", "")}`;
                setSelectedLanguage(newLangCode);
                const json = await window.api.loadLanguageFile(newLangCode);
                if (json) i18n.addResourceBundle(newLangCode, "translation", json, true, true);
                await i18n.changeLanguage(newLangCode);
                localStorage.setItem("language", newLangCode);
              }
            } catch (err) {
              console.error("❌ Fehler beim Import:", err);
              alert("❌ Fehler beim Import der Datei.");
            }
          }}>
            ➕ {t("settings.importCommunityTranslation") || "Community-Übersetzung importieren"}
          </button>

          <button onClick={async () => {
            try {
              await window.api.downloadLanguageTemplate();
              alert("✅ Template-Datei erfolgreich heruntergeladen!");
            } catch (err) {
              console.error("❌ Fehler beim Herunterladen der Template-Datei:", err);
              alert("❌ Fehler beim Herunterladen der Template-Datei.");
            }
          }}>
            ⬇️ {t("settings.downloadTemplate") || "Template-Datei herunterladen"}
          </button>
        </div>
      </div>

      <button
        onClick={async () => {
          const confirm = window.confirm(t("settings.resetalert"));
          if (!confirm) return;

          try {
            await window.api.resetJsonFile('objects.json');
            await window.api.resetJsonFile('buildings.json');
            alert(t("settings.resetdone"));
          } catch (err) {
            console.error("❌ Fehler beim Zurücksetzen:", err);
            alert("❌ Fehler beim Zurücksetzen – siehe Konsole.");
          }
        }}
      >
        🔄 {t("datareset")}
      </button>

      {/* 🌙 Darkmode */}
      {/* <div className="settings-section">
        <div className="setting-row">
          <label htmlFor="darkToggle">{t("settings.darkMode")}</label>
          <label className="switch">
            <input id="darkToggle" type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
            <span className="slider round"></span>
          </label>
        </div>
      </div> */}

      {/* 🔗 Externe Links */}
      <div className="settings-section">
        <h2>{t("settings.links.title")}</h2>
        <div className="button-group external-links">
          <button
            className="link-button"
            onClick={() => window.api.openExternalLink("https://github.com/JotunJosh/chemstruct")}
          >
            🧪 GitHub
          </button>
          <button
            className="link-button"
            onClick={() => window.api.openExternalLink("https://www.nexusmods.com/schedule1/mods/522")}
          >
            🧬 NexusMods
          </button>
        </div>
      </div>

      {/* ⬅️ Zurück */}
      <hr />
      <button onClick={() => navigate("/")}>{t("settings.back")}</button>
    </div>
  );
};

export default SettingsPage;
