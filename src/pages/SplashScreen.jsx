// ⚛️ React-Komponente + Styling + Übersetzung
import React from "react";
import "./SplashScreen.css";
import { useTranslation } from "react-i18next";
import chemLogo from "./chemstruct-logo.png";

// 🌊 Startscreen-Komponente mit Logo, Begrüßung und Ladeanzeige
// Welcome splash screen with logo, title and loading spinner
const SplashScreen = () => {
  const { t } = useTranslation(); // 🌍 Lokalisierung

  return (
    <div className="splash-screen stylish-splash">
      {/* 💡 Glühender Hintergrundeffekt */}
      <div className="splash-glow"></div>

      {/* 🖼️ Icon oder Maskottchen */}
      <div className="splash-icon">
        <img src={chemLogo} alt="ChemStruct Logo" className="splash-logo-image" />
      </div>

      {/* 📝 Begrüßung & Beschreibung */}
      <h1>{t("splashWelcome")}</h1>   {/* z. B. "Willkommen bei HuntMate" */}
      <p>{t("splashText")}</p>        {/* z. B. "Lade deine Jagddaten..." */}

      {/* 🔄 Ladeindikator */}
      <div className="spinner"></div>
    </div>
  );
};

export default SplashScreen;
