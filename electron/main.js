const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn, fork } = require("child_process");

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

// Only allow one app instance (stops repeated launches / "20 tabs")
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
  process.exit(0);
}
app.on("second-instance", () => {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    win.focus();
    win.show();
  }
});

let nextProcess = null;
let mainWindow = null;
let isHandlingActivate = false;
/** Only true after server started and window was created. Prevents activate from opening windows when startup failed. */
let startupSucceeded = false;

const isDev = !app.isPackaged;

function getLogDir() {
  return path.join(app.getPath("userData"), "logs");
}

function getLogPath() {
  return path.join(getLogDir(), "main.log");
}

function log(message, level = "info") {
  const ts = new Date().toISOString();
  const line = `[${ts}] [${level}] ${message}\n`;
  try {
    const dir = getLogDir();
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(getLogPath(), line);
  } catch (e) {
    console.error("Log write failed", e);
  }
  if (isDev) console.log(line.trim());
}

function getStandalonePath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "standalone");
  }
  return path.join(__dirname, "..", ".next", "standalone");
}

function hasStandaloneBuild() {
  const p = getStandalonePath();
  const serverPath = path.join(p, "server.js");
  try {
    fs.accessSync(serverPath);
    return true;
  } catch {
    return false;
  }
}

function getDatabasePath() {
  return path.join(app.getPath("userData"), "drugflow.db");
}

function ensureDatabase() {
  const dbPath = getDatabasePath();
  if (fs.existsSync(dbPath)) return;
  if (!app.isPackaged) return;
  const templatePath = path.join(process.resourcesPath, "template.db");
  if (fs.existsSync(templatePath)) {
    fs.copyFileSync(templatePath, dbPath);
  }
}

function startNextServer() {
  return new Promise((resolve, reject) => {
    const standalonePath = getStandalonePath();
    const serverPath = path.join(standalonePath, "server.js");

    const dbPath = getDatabasePath();
    const env = {
      ...process.env,
      PORT: String(PORT),
      HOSTNAME: "localhost",
      DATABASE_URL: `file:${dbPath}`,
      NEXTAUTH_URL: BASE_URL,
      NODE_ENV: "production",
    };

    log(`Spawning server: cwd=${standalonePath} server=${serverPath} DATABASE_URL=file:${dbPath}`);
    if (!fs.existsSync(serverPath)) {
      log(`Server file missing: ${serverPath}`, "error");
      reject(new Error("Server file not found"));
      return;
    }

    // When packaged, run server as Node via ELECTRON_RUN_AS_NODE so we don't start another app instance
    const spawnEnv = { ...env, ELECTRON_RUN_AS_NODE: "1" };
    const spawnOptions = {
      cwd: standalonePath,
      env: spawnEnv,
      stdio: ["pipe", "pipe", "pipe", "ipc"],
      execPath: process.execPath,
      execArgv: [],
    };

    nextProcess = fork(serverPath, [], spawnOptions);

    nextProcess.stdout.on("data", (data) => {
      const str = data.toString();
      log(str.trim(), "next-stdout");
      if (str.includes("Ready") || str.includes("started")) {
        resolve();
      }
    });

    nextProcess.stderr.on("data", (data) => {
      const str = data.toString();
      log(str.trim(), "next-stderr");
      if (str.includes("Ready") || str.includes("started") || str.includes("Listening")) {
        resolve();
      }
    });

    nextProcess.on("exit", (code, signal) => {
      log(`Next server exited code=${code} signal=${signal}`);
    });

    nextProcess.on("error", (err) => {
      log(`Next server spawn error: ${err.message}`, "error");
      reject(err);
    });

    setTimeout(() => resolve(), 4000);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: "Drug Flow",
    show: false,
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function waitForServer(timeoutMs = 20000) {
  const timeout = app.isPackaged ? 60000 : timeoutMs; // 60s for installed app (cold start)
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeout;
    const check = () => {
      if (Date.now() > deadline) {
        reject(new Error("Server did not become ready in time"));
        return;
      }
      const http = require("http");
      const req = http.get(BASE_URL, (res) => {
        resolve();
      });
      req.on("error", () => {
        setTimeout(check, 400);
      });
    };
    check();
  });
}

app.whenReady().then(async () => {
  log(`App starting (packaged: ${app.isPackaged}). Log file: ${getLogPath()}`);

  const useStandalone = hasStandaloneBuild();

  if (!useStandalone) {
    mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      minWidth: 900,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
      title: "Drug Flow",
    });
    mainWindow.loadURL(BASE_URL);
    mainWindow.on("closed", () => {
      mainWindow = null;
    });
    return;
  }

  ensureDatabase();
  try {
    await startNextServer();
    await waitForServer();
    createWindow();
    mainWindow.loadURL(BASE_URL);
    startupSucceeded = true;
    log("Window opened successfully.");
  } catch (err) {
    log(`Startup failed: ${err.message}`, "error");
    log(`Stack: ${err.stack}`, "error");
    startupSucceeded = false;
    const { dialog } = require("electron");
    dialog.showErrorBox("Drug Flow", `Startup failed: ${err.message}\n\nSee logs: ${getLogPath()}`);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (nextProcess) {
    nextProcess.kill();
    nextProcess = null;
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Log uncaught errors and show log path (after app is ready so getLogPath works)
process.on("uncaughtException", (err) => {
  try {
    const logPath = app.isPackaged && typeof getLogPath === "function" ? getLogPath() : "(see terminal or run from command line)";
    if (typeof log === "function") {
      log(`Uncaught exception: ${err.message}`, "error");
      if (err.stack) log(err.stack, "error");
    }
    const { dialog } = require("electron");
    if (dialog) {
      dialog.showErrorBox(
        "Drug Flow Error",
        `${err.message}\n\nLogs: ${logPath}`
      );
    }
  } catch (e) {
    console.error(e);
  }
});

// Never restart the backend here. On Windows, activate can fire multiple times.
// Only create a window if startup previously succeeded (server was ready).
app.on("activate", () => {
  if (!startupSucceeded) return;
  if (BrowserWindow.getAllWindows().length === 0 && !isHandlingActivate) {
    isHandlingActivate = true;
    createWindow();
    mainWindow.loadURL(BASE_URL);
    isHandlingActivate = false;
  }
});

app.on("before-quit", () => {
  if (nextProcess) {
    nextProcess.kill();
    nextProcess = null;
  }
});
