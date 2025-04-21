// ⚛️ React-Komponente + Styling + Übersetzung
import React from "react";
import "./SplashScreen.css";
import { useTranslation } from "react-i18next";
import chemLogo from "../../assets/chemstruct-logo.png";
import spinner from "../../assets/FlaskSpinner.svg";

// 🌊 Startscreen-Komponente mit Logo, Begrüßung und Ladeanzeige
// Welcome splash screen with logo, title and loading spinner
const SplashScreen = () => {
  const { t } = useTranslation(); // 🌍 Lokalisierung

  return (
    <div className="splash-wrapper">
      {/* 🌫 Nebel ganz unten, z-index: 0 */}
      <div className="fog"></div>
      {/* 💡 Glühender Hintergrundeffekt */}
      <div className="splash-glow"></div>

      {/* Inhalt darüber */}
      <div className="splash-container">
        <div className="splash-icon">
          <img src={chemLogo} alt="ChemStruct Logo" className="splash-logo-image" />
        </div>

        <h1 className="splash-title">{t("splashWelcome")}</h1>
        <p className="splash-sub">{t("splashText")}</p>

        <img src={spinner} alt="Loading..." className="flask-spinner" />
      </div>
    </div>
  );
};

export default SplashScreen;
