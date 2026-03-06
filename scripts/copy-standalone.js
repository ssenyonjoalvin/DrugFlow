const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const standaloneDir = path.join(projectRoot, ".next", "standalone");
const publicDir = path.join(projectRoot, "public");
const staticSource = path.join(projectRoot, ".next", "static");
const staticDest = path.join(standaloneDir, ".next", "static");
const publicDest = path.join(standaloneDir, "public");

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (!fs.existsSync(standaloneDir)) {
  console.error("Run 'next build' first. .next/standalone not found.");
  process.exit(1);
}

if (fs.existsSync(publicDir)) {
  copyRecursive(publicDir, publicDest);
  console.log("Copied public/ to standalone/public");
}

if (fs.existsSync(staticSource)) {
  fs.mkdirSync(path.dirname(staticDest), { recursive: true });
  copyRecursive(staticSource, staticDest);
  console.log("Copied .next/static to standalone/.next/static");
}

console.log("Standalone copy complete.");
