// astro.config.mjs
import { defineConfig, envField } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://blog.vinnie.studio",
  output: "static",
  markdown: {
    shikiConfig: {
      theme: "github-light",
      wrap: true,
    },
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes("/demo-test"),
    }),
  ],
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
