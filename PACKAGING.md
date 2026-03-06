# Drug Flow – Packaging & Distribution

This document covers building the Windows .exe installer, versioning, code signing, native modules, and testing.

## Quick start

1. **Icon (required for Windows build)**  
   Place a Windows icon file at `build/icon.ico` (e.g. 256×256). Without it, the NSIS build may fail. Use an online PNG→ICO converter or a tool like ImageMagick.

2. **Production build and installer**
   ```bash
   npm run electron:build   # Next.js build + prepare standalone + default DB
   npm run electron:package # Then run electron-builder (NSIS)
   # Or in one step:
   npm run dist
   ```
   Output: `dist/Drug Flow Setup 1.0.0.exe` (or similar).

3. **Development**
   - `npm run electron:dev` – Next.js dev server + Electron window (online dev).
   - `npm run electron:package:dir` – Build then unpacked app in `dist/win-unpacked` (no installer) for quick testing.

---

## Versioning strategy

- **App version** is taken from `package.json` → `version` (e.g. `1.0.0`). Bump it before each release.
- **Installer filename** and metadata use this version.
- Recommended: semantic versioning (e.g. `1.0.1` for fixes, `1.1.0` for features).

---

## Code signing (placeholder)

To avoid Windows SmartScreen warnings, sign the installer and executable.

- **Environment variables** (optional, used by electron-builder when set):
  - `CSC_LINK` – path to your `.pfx` (or use `CSC_LINK` with base64-encoded cert).
  - `CSC_KEY_PASSWORD` – password for the certificate.
- **Config placeholder** in `package.json` under `build.win`:
  - `certificateFile`, `certificatePassword` (or use env vars above).
- **Signing tools**: e.g. SignTool (Windows SDK), or use a service (e.g. Azure Key Vault, DigiCert). For testing, an unsigned build runs but may show “Unknown publisher”.

---

## Native modules (Prisma, bcrypt)

- **@prisma/client** and **bcrypt** are unpacked via `asarUnpack` so they work inside the packaged app.
- If you add other native modules, add their globs to `build.asarUnpack` in `package.json`.
- If you upgrade Node/Electron and see native crashes, rebuild for Electron:
  ```bash
  npx electron-rebuild
  ```
  (Add `electron-rebuild` as a dev dependency if you use this.)

---

## Debugging the packaged app

- **Console**: Run the installed app from a terminal to see main-process logs:
  ```text
  "C:\Users\<You>\AppData\Local\Programs\Drug Flow\Drug Flow.exe"
  ```
- **DevTools**: In `electron/main.js`, you can temporarily add `mainWindow.webContents.openDevTools()` after `createWindow()` (remove before release).
- **App data**: DB and config live under:
  ```text
  %APPDATA%\Drug Flow\data\
  ```
  (e.g. `drugflow.db`, `.nextauth-secret`). Clearing this folder resets the app to first-launch behavior (fresh DB copy).

---

## Testing the installer before distribution

1. **Unpacked run** (no installer):
   ```bash
   npm run electron:package:dir
   ```
   Run `dist/win-unpacked/Drug Flow.exe` and test flows (login, DB, offline).

2. **Full installer**:
   ```bash
   npm run dist
   ```
   Run `dist/Drug Flow Setup 1.0.0.exe` on a clean VM or machine (or different user). Test:
   - Install to a custom directory.
   - Desktop and Start menu shortcuts.
   - Uninstall from “Add or remove programs”.
   - App runs fully offline and data persists under `%APPDATA%\Drug Flow\data\`.

3. **Offline**: Disconnect the network and confirm the app loads and works (no CDN or external requests).

---

## Summary of scripts

| Script | Purpose |
|--------|--------|
| `npm run electron:dev` | Development: Next dev server + Electron. |
| `npm run electron:build` | Production Next build + `prepare-standalone.js` (standalone + static + public + `resources/default.db`). |
| `npm run electron:package` | `electron:build` + electron-builder → NSIS installer. |
| `npm run electron:package:dir` | `electron:build` + unpacked app in `dist/win-unpacked`. |
| `npm run dist` | Same as `electron:package` (full installer). |

---

## Icon and resources

- **Installer / EXE icon**: `build/icon.ico`. Must exist for the Windows build.
- **Window icon** (optional): To show the same icon in the app window when packaged, add to `build.extraResources` in `package.json`:
  ```json
  { "from": "build/icon.ico", "to": "icon.ico" }
  ```
  Then in `electron/main.js` the packaged app already uses `process.resourcesPath + "/icon.ico"` when that file is present.
