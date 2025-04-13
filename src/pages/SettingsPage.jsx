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
  const { electronAPI } = window;

  console.log("🔍 electronAPI:", window.electronAPI);
  console.log("🔍 openExternalLink:", window.electronAPI?.openExternalLink);

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

  return (
    <div className="settings-container">
      <h1>{t("settings.title")}</h1>

      {/* 🌐 Sprache */}
      <div className="settings-section">
        <h2>{t("settings.language")}</h2>
        <div className="button-group">
          <button onClick={() => changeLanguage("de")}>🇩🇪 {t("language.german")}</button>
          <button onClick={() => changeLanguage("en")}>🇺🇸 {t("language.english")}</button>
          <button onClick={() => changeLanguage("fr")}>🇫🇷 {t("language.french")}</button>
        </div>
      </div>

            <button
        onClick={async () => {
          const confirm = window.confirm("⚠️ Bist du sicher? Alle Layouts & Objekte werden überschrieben!");
          if (!confirm) return;

          try {
            await window.api.resetJsonFile('objects.json');
            await window.api.resetJsonFile('buildings.json');
            alert("✅ Zurückgesetzt! Bitte App neu starten oder Seite neu laden.");
          } catch (err) {
            console.error("❌ Fehler beim Zurücksetzen:", err);
            alert("❌ Fehler beim Zurücksetzen – siehe Konsole.");
          }
        }}
      >
        🔄 {t("datareset")}
      </button>

      {/* 🌙 Darkmode */}
      <div className="settings-section">
        <div className="setting-row">
          <label htmlFor="darkToggle">{t("settings.darkMode")}</label>
          <label className="switch">
            <input id="darkToggle" type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      {/* 🔗 Externe Links */}
      <div className="settings-section">
        <h2>{t("settings.links.title")}</h2>
        <div className="button-group external-links">
        <button
              className="link-button"
              onClick={() => window.electronAPI.openExternalLink("https://github.com/JotunJosh/chemstruct")}
            >
              🧪 GitHub
        </button>
        <button
              className="link-button"
              onClick={() => window.electronAPI.openExternalLink("https://www.nexusmods.com/schedule1/mods/522")}
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
