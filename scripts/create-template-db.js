const { execSync } = require("child_process");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const templatePath = path.join(projectRoot, "template.db");

process.env.DATABASE_URL = `file:${templatePath}`;
execSync("npx prisma db push", {
  cwd: projectRoot,
  stdio: "inherit",
  env: process.env,
});
execSync("npx tsx prisma/seed.ts", {
  cwd: projectRoot,
  stdio: "inherit",
  env: process.env,
});

console.log("Created template.db with default admin for packaged app.");
