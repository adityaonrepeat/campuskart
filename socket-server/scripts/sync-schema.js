// Copy the root schema into this package so prisma generate resolves @prisma/client here.
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "..", "prisma", "schema.prisma");
const destDir = path.join(__dirname, "..", "prisma");
const dest = path.join(destDir, "schema.prisma");

if (!fs.existsSync(src)) {
  console.error(`sync-schema: source schema not found at ${src}`);
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log(`sync-schema: copied ${src} -> ${dest}`);
