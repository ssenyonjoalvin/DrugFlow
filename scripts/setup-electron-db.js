/**
 * One-time setup: create tables and default admin in the same DB used by the
 * Electron app (userData/drugflow.db). Run from project root when you get
 * "The table `main.User` does not exist" or cannot login.
 *
 * Usage (PowerShell, from durgflow folder):
 *   node scripts/setup-electron-db.js
 *
 * Or set the path yourself:
 *   $env:DATABASE_URL="file:C:\Users\ALVIN\AppData\Roaming\durgflow\drugflow.db"
 *   npx prisma db push
 *   npx tsx prisma/seed.ts
 */

const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

// Same logic as electron/main.js getDatabasePath() for unpackaged app
const appName = "durgflow";
const userData =
  process.env.APPDATA ||
  (process.platform === "darwin"
    ? path.join(process.env.HOME || "", "Library", "Application Support")
    : path.join(process.env.HOME || "", ".config"));
const dbDir = path.join(userData, appName);
const dbPath = path.join(dbDir, "drugflow.db");

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

process.env.DATABASE_URL = `file:${path.resolve(dbPath)}`;
console.log("Using database:", process.env.DATABASE_URL);

execSync("npx prisma db push", {
  cwd: path.join(__dirname, ".."),
  stdio: "inherit",
  env: process.env,
});
execSync("npx tsx prisma/seed.ts", {
  cwd: path.join(__dirname, ".."),
  stdio: "inherit",
  env: process.env,
});

console.log("\nDone. You can log in with: administrator@localhost / password123");
console.log("(Change the password after first login.)");
