// astro.config.mjs
import { defineConfig, envField } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://blog.vinnie.studio",
  output: "static",
  adapter: cloudflare(),
  integrations: [mdx(), sitemap()],
  env: {
    schema: {
      CF_PAGES_BRANCH: envField.string({
        context: "server",
        access: "public",
        optional: true,
      }),
      PUBLIC_CF_WEB_ANALYTICS_TOKEN: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
    },
  },
  build: {
    inlineStylesheets: "auto",
  },
  vite: {
    build: {
      cssMinify: "esbuild",
    },
  },
});
