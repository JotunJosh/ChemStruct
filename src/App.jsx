// App.jsx
import { Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import LayoutPlanner from './pages/LayoutPlanner';
import BuildingCatalog from './pages/BuildingCatalog';
import ObjectCatalog from './pages/ObjectCatalog';
import Settings from './pages/SettingsPage';
import './i18n';
import { useTranslation } from 'react-i18next';


export default function App() {

   // 🧾 Version für Footer
   const [appVersion, setAppVersion] = useState("...");

  useEffect(() => {
    if (window.electronAPI?.getAppVersion) {
      window.electronAPI.getAppVersion().then(setAppVersion);
    }
  }, []);

  const { t, i18n } = useTranslation();

  return (
    <div className="app-container">
      <nav className="nav">
        <Link to="/">{t("layoutPlanner")}</Link>
        <Link to="/buildings">{t("buildingCatalog")}</Link>
        <Link to="/objects">{t("objectCatalog")}</Link>
        <Link to="/settings">{t("settings.title")}</Link>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LayoutPlanner />} />
          <Route path="/buildings" element={<BuildingCatalog />} />
          <Route path="/objects" element={<ObjectCatalog />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      <footer
        style={{
          textAlign: "center",
          padding: "10px",
          background: "#222",
          color: "#fff",
          marginTop: "30px",
        }}
      >
        © 2025 ChemStruct – {t("copyright")} – Version {appVersion}
      </footer>

    </div>
    
  );
}
