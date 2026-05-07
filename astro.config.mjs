// astro.config.mjs
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://blog.vinnie.studio",
  output: "static",
  adapter: cloudflare(),
  integrations: [mdx(), sitemap()],
  build: {
    inlineStylesheets: "auto",
  },
  vite: {
    build: {
      cssMinify: "esbuild",
    },
  },
});
