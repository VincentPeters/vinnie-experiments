// scripts/fetch-fonts.mjs
//
// Downloads the self-hosted woff2 files for Source Serif 4 (Adobe, OFL)
// and Switzer (Indian Type Foundry, Fontshare). Run once after install.
//
// Usage:  node scripts/fetch-fonts.mjs
//         pnpm fetch-fonts
//
// JetBrains Mono is already in the repo and is not refetched.

import { mkdir, writeFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fontsDir = join(__dirname, "..", "public", "fonts");

const targets = [
  // Source Serif 4 — via Google Fonts CSS API.
  // The API returns CSS with fonts.gstatic.com woff2 URLs we can download directly.
  {
    name: "SourceSerif4-400.woff2",
    cssUrl:
      "https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400&display=swap",
    filter: (face) => face.weight === "400" && face.style === "normal",
  },
  {
    name: "SourceSerif4-400i.woff2",
    cssUrl:
      "https://fonts.googleapis.com/css2?family=Source+Serif+4:ital@1&display=swap",
    filter: (face) => face.weight === "400" && face.style === "italic",
  },
  {
    name: "SourceSerif4-700.woff2",
    cssUrl:
      "https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@700&display=swap",
    filter: (face) => face.weight === "700" && face.style === "normal",
  },
  // Switzer — via Fontshare CSS API.
  {
    name: "Switzer-400.woff2",
    cssUrl: "https://api.fontshare.com/v2/css?f[]=switzer@400&display=swap",
    filter: (face) => face.weight === "400" && face.style === "normal",
  },
  {
    name: "Switzer-600.woff2",
    cssUrl: "https://api.fontshare.com/v2/css?f[]=switzer@600&display=swap",
    filter: (face) => face.weight === "600" && face.style === "normal",
  },
  {
    name: "Switzer-700.woff2",
    cssUrl: "https://api.fontshare.com/v2/css?f[]=switzer@700&display=swap",
    filter: (face) => face.weight === "700" && face.style === "normal",
  },
];

const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0 Safari/537.36";

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function parseFontFaces(css) {
  const faces = [];
  const re = /@font-face\s*\{([^}]+)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const block = m[1];
    const get = (k) => {
      const r = new RegExp(`${k}\\s*:\\s*([^;]+);`).exec(block);
      return r ? r[1].trim() : null;
    };
    const srcLine = get("src") ?? "";
    // First woff2 wins; tolerate protocol-relative URLs and quoted url() args.
    const woff2Re = /url\(\s*['"]?((?:https?:)?\/\/[^'")\s]+\.woff2)['"]?\s*\)/;
    let url = woff2Re.exec(srcLine)?.[1];
    if (url && url.startsWith("//")) url = "https:" + url;
    faces.push({
      family: get("font-family")?.replace(/['"]/g, ""),
      weight: get("font-weight"),
      style: get("font-style") ?? "normal",
      url,
    });
  }
  return faces;
}

async function fetchText(url) {
  const r = await fetch(url, { headers: { "user-agent": userAgent } });
  if (!r.ok) throw new Error(`${url}: ${r.status} ${r.statusText}`);
  return r.text();
}

async function fetchBytes(url) {
  const r = await fetch(url, { headers: { "user-agent": userAgent } });
  if (!r.ok) throw new Error(`${url}: ${r.status} ${r.statusText}`);
  return Buffer.from(await r.arrayBuffer());
}

async function main() {
  await mkdir(fontsDir, { recursive: true });
  let downloaded = 0;
  let skipped = 0;
  for (const t of targets) {
    const out = join(fontsDir, t.name);
    if (await exists(out)) {
      skipped++;
      continue;
    }
    try {
      const css = await fetchText(t.cssUrl);
      const faces = parseFontFaces(css);
      const match = faces.find(t.filter);
      if (!match?.url) throw new Error(`no matching woff2 in ${t.cssUrl}`);
      const bytes = await fetchBytes(match.url);
      await writeFile(out, bytes);
      console.log(`  fetched  ${t.name}  (${(bytes.length / 1024).toFixed(1)} kB)`);
      downloaded++;
    } catch (err) {
      console.error(`  failed   ${t.name}: ${err.message}`);
    }
  }
  console.log(
    `\nfonts: ${downloaded} downloaded, ${skipped} already present.`,
  );
  if (downloaded === 0 && skipped === targets.length) {
    console.log("nothing to do.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
