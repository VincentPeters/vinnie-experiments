// scripts/media-to-webm.mjs
//
// Converts every .mp4 under src/content/posts/ to .webm (VP9 + Opus) and
// removes the original .mp4. Astro already serves images as WebP/AVIF at
// build time; video is the one media format the build pipeline doesn't touch.
//
// Usage:  node scripts/media-to-webm.mjs
//         pnpm media:webm
//
// Requires ffmpeg on PATH. Install:
//   Windows: winget install --id=Gyan.FFmpeg -e
//   macOS:   brew install ffmpeg
//   Linux:   apt install ffmpeg  (or your distro's package manager)

import { readdir, stat, unlink } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = resolve(__dirname, "..", "src", "content", "posts");

// VP9 settings tuned for short demo clips on a blog:
//   crf 32 + b:v 0 = constant-quality mode (recommended for VP9)
//   deadline good + cpu-used 2 = production quality, reasonable encode speed
//   row-mt 1 = multi-threaded row encoding
//   libopus @ 96k = transparent audio at a small bitrate
const FFMPEG_ARGS = (input, output) => [
  "-y",
  "-i", input,
  "-c:v", "libvpx-vp9",
  "-crf", "32",
  "-b:v", "0",
  "-deadline", "good",
  "-cpu-used", "2",
  "-row-mt", "1",
  "-c:a", "libopus",
  "-b:a", "96k",
  output,
];

function run(cmd, args, opts = {}) {
  return new Promise((resolveRun, rejectRun) => {
    const proc = spawn(cmd, args, { stdio: "inherit", ...opts });
    proc.on("close", (code) => {
      if (code === 0) resolveRun();
      else rejectRun(new Error(`${cmd} exited with ${code}`));
    });
    proc.on("error", rejectRun);
  });
}

async function ffmpegAvailable() {
  return new Promise((resolveCheck) => {
    const proc = spawn("ffmpeg", ["-version"], { stdio: "ignore" });
    proc.on("close", (code) => resolveCheck(code === 0));
    proc.on("error", () => resolveCheck(false));
  });
}

async function findMp4s(root) {
  const names = await readdir(root, { recursive: true });
  return names
    .filter((n) => n.toLowerCase().endsWith(".mp4"))
    .map((n) => join(root, n));
}

async function convert(mp4Path) {
  const webmPath = mp4Path.replace(/\.mp4$/i, ".webm");
  const before = (await stat(mp4Path)).size;
  console.log(`\nconverting  ${mp4Path}`);
  await run("ffmpeg", FFMPEG_ARGS(mp4Path, webmPath));
  const after = (await stat(webmPath)).size;
  if (after === 0) throw new Error(`empty output: ${webmPath}`);
  await unlink(mp4Path);
  const beforeMb = (before / 1024 / 1024).toFixed(2);
  const afterMb = (after / 1024 / 1024).toFixed(2);
  const ratio = ((1 - after / before) * 100).toFixed(0);
  console.log(`            ${beforeMb} MB -> ${afterMb} MB  (${ratio}% smaller). removed mp4.`);
}

async function main() {
  if (!(await ffmpegAvailable())) {
    console.error("ffmpeg not found on PATH. install it first:");
    console.error("  Windows: winget install --id=Gyan.FFmpeg -e");
    console.error("  macOS:   brew install ffmpeg");
    console.error("  Linux:   apt install ffmpeg");
    process.exit(1);
  }

  const mp4s = await findMp4s(POSTS_DIR);
  if (mp4s.length === 0) {
    console.log(`no .mp4 files found under ${POSTS_DIR}`);
    return;
  }

  console.log(`found ${mp4s.length} .mp4 file(s) under src/content/posts/`);
  let ok = 0;
  let failed = 0;
  for (const f of mp4s) {
    try {
      await convert(f);
      ok++;
    } catch (err) {
      console.error(`  failed: ${err.message}`);
      failed++;
    }
  }
  console.log(`\ndone: ${ok} converted, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
