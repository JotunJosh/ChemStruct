import { useEffect, useState } from 'react';

export function useUpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [releaseUrl, setReleaseUrl] = useState(null);
  const [latestVersion, setLatestVersion] = useState(null);

  useEffect(() => {
    async function check() {
      try {
        const currentVersion = await window.electronAPI.getAppVersion();
        const response = await fetch("https://api.github.com/repos/JotunJosh/chemstruct/releases/latest"); // richtige URL
        // const response = await fetch("https://api.github.com/repos/JotunJosh/huntmate/releases/latest"); // Debug zum Testen
        const data = await response.json();
        const remoteVersion = data.tag_name.replace(/^v/, '');

        if (isNewerVersion(remoteVersion, currentVersion)) {
          setLatestVersion(remoteVersion);
          setReleaseUrl(data.html_url);
          setUpdateAvailable(true);
        }
      } catch (err) {
        console.warn("Update-Check fehlgeschlagen:", err);
      }
    }

    check();
  }, []);

  return { updateAvailable, latestVersion, releaseUrl };
}

function isNewerVersion(remote, local) {
  const r = remote.split('.').map(Number);
  const l = local.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((r[i] || 0) > (l[i] || 0)) return true;
    if ((r[i] || 0) < (l[i] || 0)) return false;
  }
  return false;
}
