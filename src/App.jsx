import { Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useUpdateChecker } from './hooks/useUpdateChecker';
import UpdateNotice from './components/UpdateNotice';
import LayoutPlanner from './pages/LayoutPlanner';
import BuildingCatalog from './pages/BuildingCatalog';
import ObjectCatalog from './pages/ObjectCatalog';
import Settings from './pages/SettingsPage';
import SplashScreen from './pages/SplashScreen';
import i18n from './i18n';

if (typeof window !== 'undefined') {
  window.i18next = i18n;
}

export default function App() {
  // 🧾 Alle Hooks ganz oben – ohne Bedingungen
  const { t, i18n } = useTranslation();
  const [appVersion, setAppVersion] = useState("...");
  const [showSplash, setShowSplash] = useState(false);
  const [loadingDone, setLoadingDone] = useState(false);

  // 🧠 Splash-Handling
  useEffect(() => {
    async function checkSplashVersion() {
      console.log("🔍 Starte SplashCheck...");

      const devForceSplash = false; // ⬅️ einfach auf true stellen beim Testen

      if (devForceSplash) {
        console.log("🧪 Dev-Mode: Splash wird erzwungen!");
        setShowSplash(true);
        setTimeout(() => {
          setShowSplash(false);
          setLoadingDone(true);
        }, 5000);
        return;
      }

      let currentVersion = null;
      try {
        currentVersion = await window.api?.getAppVersion?.();
        console.log("📦 App-Version:", currentVersion);
        setAppVersion(currentVersion || "dev");
      } catch (err) {
        console.warn("⚠️ Konnte App-Version nicht abrufen!", err);
      }

      const lastSplashVersion = localStorage.getItem("lastSplashVersion");
      console.log("💾 Zuletzt angezeigte Version:", lastSplashVersion);

      if (!lastSplashVersion || lastSplashVersion !== currentVersion) {
        console.log("🌊 Splash wird angezeigt!");
        setShowSplash(true);

        setTimeout(() => {
          console.log("✅ Splash fertig – weiter zur App.");
          if (currentVersion) {
            localStorage.setItem("lastSplashVersion", currentVersion);
          }
          setShowSplash(false);
          setLoadingDone(true);
        }, 5000);
      } else {
        console.log("🔁 Splash nicht nötig – Version unverändert.");
        setLoadingDone(true);
      }
    }

    checkSplashVersion();
  }, []);

  const { updateAvailable, latestVersion, releaseUrl } = useUpdateChecker();
  const [hideModal, setHideModal] = useState(false);

  // 🌊 Splashscreen anzeigen
  if (showSplash) {
    console.log("🌊 SplashScreen wird gerendert!");
    return <SplashScreen />;
  }

  // 🧩 Haupt-App
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

      {!hideModal && updateAvailable && latestVersion && releaseUrl && (
        <UpdateNotice
          version={latestVersion}
          url={releaseUrl}
          onClose={() => setHideModal(true)}
        />
      )}

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
