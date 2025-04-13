// 📦 Importiert benötigte Node.js-Module
// Load required core modules
const fs = require("fs");
const { execSync } = require("child_process");
const readline = require("readline");
require("dotenv").config(); // 🔐 Lädt Umgebungsvariablen aus .env-Datei (für GitHub Token etc.)

// 📄 Pfade zur package.json und zum Release-Log
// Define paths to important files
const pkgPath = "package.json";
const logPath = "RELEASE_LOG.md";

// 📦 Aktuelle package.json einlesen
// Load current package.json
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

// 🔢 Lese Argument für Versionssprung (patch | minor | major)
// Read CLI argument for version bump type
const args = process.argv.slice(2);
const bumpType = args[0] || "patch"; // Default: patch

// 🔍 Version aufteilen (z. B. 1.2.3 → [1,2,3])
// Split version into major, minor, patch
let [major, minor, patch] = pkg.version.split(".").map(Number);

// 🎚️ Erhöhe Version abhängig vom Argument
// Bump version based on the bump type
switch (bumpType) {
  case "major":
    major++; minor = 0; patch = 0;
    break;
  case "minor":
    minor++; patch = 0;
    break;
  case "patch":
  default:
    patch++;
    break;
}

// 🆕 Neue Version als String erstellen
// Create the new version string
const newVersion = `${major}.${minor}.${patch}`;
pkg.version = newVersion;

// ✍️ Speichere neue Version in package.json
// Save new version to package.json
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log(`📦 Neue Version: ${newVersion}`);

// 🔄 Version-Badge in README.md aktualisieren
const readmePath = "README.md";
let readmeContent = fs.readFileSync(readmePath, "utf8");
readmeContent = readmeContent.replace(
  /(!\[version\]\(https:\/\/img\.shields\.io\/badge\/version-)([\d.]+)(-blue\.svg\))/,
  `$1${newVersion}$3`
);
fs.writeFileSync(readmePath, readmeContent);
console.log("📝 README.md Version-Badge aktualisiert.");

// 💬 Eingabeaufforderung für den Changelog
// Prompt user for changelog input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("📝 Changelog für dieses Release:\n> ", (changelogText) => {
  // 🗒️ Neuen Eintrag formatieren und an RELEASE_LOG.md anhängen
  // Format and append changelog entry to release log file
  const logEntry = `📦 v${newVersion} – ${new Date().toLocaleDateString("de-DE")}\n\n- ${changelogText}\n\n`;
  fs.appendFileSync(logPath, logEntry);
  console.log("✅ RELEASE_LOG.md aktualisiert.");

  // 🛠️ Build-Befehl (React + Electron Build & GitHub-Release)
  // Build command for app and GitHub release
  const buildCommand = `npm run build && npx electron-builder --config electron-builder.yml --publish always`;

  try {
    // 🚀 Build starten
    execSync(buildCommand, { stdio: "inherit", env: { ...process.env } });

    // 📝 Release Notes auf GitHub ergänzen (via gh CLI)
    const ghCommand = `gh release edit v${newVersion} --notes "${changelogText}" --draft=false`;
    execSync(ghCommand, { stdio: "inherit", env: { ...process.env } });
    console.log("🚀 Release Notes auf GitHub aktualisiert!");

    // 🔗 MSI-Download-Link anzeigen
    const msiUrl = `https://github.com/JotunJosh/chemstruct/releases/download/v${newVersion}/ChemStruct-Setup-${newVersion}.msi`;
    console.log("⬇️ Direktlink zur neuen Version:");
    console.log(msiUrl);

  } catch (err) {
    // ❌ Fehler beim Build oder Upload
    console.error("❌ Build- oder Upload-Fehler:", err);
  }

  rl.close();
});
