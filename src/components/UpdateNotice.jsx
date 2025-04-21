import React from 'react';
import './UpdateNotice.css';
import { useTranslation } from "react-i18next";

function UpdateNotice({ version, url, onClose }) {
  // → Nexus-Link manuell definieren
  const nexusUrl = 'https://www.nexusmods.com/schedule1/mods/522'; // <- Ersetze durch deinen echten Link
  const { t } = useTranslation();

  return (
    <div className="update-modal-backdrop">
      <div className="update-modal">
        <h2>🔔 {t("updateNotice.newversionalert")}</h2>
        <p>{t("updateNotice.versioninfo1")} <strong>{version}</strong> {t("updateNotice.versioninfo2")}</p>
        <div className="update-actions update-buttons">
          <button onClick={() => window.api.openExternalLink("https://github.com/JotunJosh/ChemStruct/releases")}>
            {t("updateNotice.download_github")}
          </button>
          <button onClick={() => window.api.openExternalLink("https://www.nexusmods.com/schedule1/mods/522")}>
            {t("updateNotice.download_nexus")}
          </button>
        </div>
        <div className="update-dismiss">
          <button onClick={onClose}>{t("updateNotice.later")}</button>
        </div>
      </div>
    </div>
  );
}

export default UpdateNotice;
