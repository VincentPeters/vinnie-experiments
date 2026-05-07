// scripts/copy-pyodide.mjs
import { cpSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const pkg = JSON.parse(
  readFileSync(join(root, "node_modules/pyodide/package.json"), "utf8"),
);
const minor = pkg.version.split(".").slice(0, 2).join(".");
const versionDir = `v${minor}.x`;
const src = join(root, "node_modules/pyodide");
const dest = join(root, "public/pyodide", versionDir);

if (!existsSync(dest)) mkdirSync(dest, { recursive: true });

const files = [
  "pyodide.js",
  "pyodide.mjs",
  "pyodide.asm.js",
  "pyodide.asm.wasm",
  "python_stdlib.zip",
  "pyodide-lock.json",
  "package.json",
];

for (const f of files) {
  const from = join(src, f);
  const to = join(dest, f);
  if (existsSync(from)) {
    cpSync(from, to);
    console.log(`copy: ${f}`);
  }
}

console.log(`pyodide ${pkg.version} → ${dest}`);
