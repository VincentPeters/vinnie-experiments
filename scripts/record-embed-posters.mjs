// One-off: capture real /embed map screenshots as webp posters for the posts.
// Requires the local travel-by-trees stack up on :3000 (tiles + brouter).
// Run: node scripts/record-embed-posters.mjs
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

const BASE = "http://localhost:3000";
const OUT = "public/posters";

const shots = [
  { file: "tbt-layers.webp", url: "/en/embed?controls=layers&layers=groenkaart,parks,trees", wait: 5000 },
  { file: "tbt-streets.webp", url: "/en/embed?controls=layers&layers=streets,parks", wait: 5000 },
  { file: "tbt-route.webp", url: "/en/embed?controls=slider&s=4.395,51.23&e=4.425,51.2&intensity=100", wait: 9000 },
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({
  args: ["--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader", "--ignore-gpu-blocklist"],
});
const ctx = await browser.newContext({ viewport: { width: 1000, height: 620 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

for (const s of shots) {
  await page.goto(BASE + s.url, { waitUntil: "load" });
  await page.waitForTimeout(s.wait);
  const png = await page.screenshot({ type: "png" });
  const webp = await sharp(png).webp({ quality: 72 }).toBuffer();
  await writeFile(`${OUT}/${s.file}`, webp);
  console.log("wrote", s.file, webp.length, "bytes");
}

await browser.close();
console.log("done");
