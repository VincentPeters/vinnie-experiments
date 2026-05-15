// astro.config.mjs
import { defineConfig, envField } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import remarkBreaks from "remark-breaks";

const SHELL_LANGS = new Set([
  "bash",
  "sh",
  "zsh",
  "powershell",
  "pwsh",
  "shell",
  "console",
  "cmd",
]);

function getNodeText(node) {
  if (!node) return "";
  if (node.type === "text") return node.value || "";
  if (Array.isArray(node.children))
    return node.children.map(getNodeText).join("");
  return "";
}

// Pull `title="..."` (also accept `tab=` and `label=`) out of the Shiki
// meta string. Returns null if no match.
function parseLabelFromMeta(opts) {
  const meta = opts?.meta;
  let raw = "";
  if (typeof meta === "string") raw = meta;
  else if (meta && typeof meta === "object")
    raw = meta.__raw ?? meta.raw ?? "";
  const m = /(?:title|tab|label)\s*=\s*["']([^"']+)["']/.exec(raw);
  return m ? m[1] : null;
}

// Tag <pre> with `data-shell` (shell langs) or `data-numbered` (everything
// else with a real language) so CSS selectors stay short. Comment / empty
// lines inside shell blocks get `data-comment=""` so the `$` prompt skips
// them. `data-code-label` is set when the fence carries `title="..."` so
// CSS / the tab widget can render it as a label. Single source of truth
// for the shell-language list lives here.
const codeBlockMetaTransformer = {
  name: "vinnie-code-meta",
  pre(node) {
    const lang = this.options?.lang;
    node.properties = node.properties ?? {};
    const label = parseLabelFromMeta(this.options);
    if (label) node.properties["data-code-label"] = label;
    if (!lang || lang === "plaintext" || lang === "text") return;
    if (SHELL_LANGS.has(lang)) {
      node.properties["data-shell"] = "";
    } else {
      node.properties["data-numbered"] = "";
    }
  },
  line(node) {
    const lang = this.options?.lang;
    if (!lang || !SHELL_LANGS.has(lang)) return;
    const text = getNodeText(node).trim();
    if (text.length === 0 || text.startsWith("#")) {
      node.properties = node.properties ?? {};
      node.properties["data-comment"] = "";
    }
  },
};

// Syntax highlighting: the "Cool readable" six-role scheme. Six token
// roles get a colour; everything else stays at editor.foreground (ink).
// Background and default foreground are overridden by global.css against
// the live CSS variables, so the hex values here only seed the inline
// --shiki-light / --shiki-dark vars. No fontStyle italic: JetBrains Mono
// ships no italic file, so it would synthesise an oblique (banned by
// DESIGN.md). De-emphasis of comments is carried by colour alone.
const SYNTAX_SCOPES = {
  comment: ["comment", "punctuation.definition.comment"],
  keyword: ["keyword", "keyword.control", "storage.type", "storage.modifier"],
  string: [
    "string",
    "string.quoted",
    "string.template",
    "string.regexp",
    "string.unquoted",
  ],
  function: [
    "entity.name.function",
    "support.function",
    "meta.function-call",
    "entity.name.function.call",
  ],
  number: ["constant.numeric", "constant.language", "constant.language.boolean"],
  type: ["entity.name.type", "support.type", "entity.name.class", "support.class"],
};

const buildSyntaxTheme = (name, type, bg, fg, colors) => ({
  name,
  type,
  colors: { "editor.background": bg, "editor.foreground": fg },
  tokenColors: Object.entries(SYNTAX_SCOPES).map(([role, scope]) => ({
    scope,
    settings: { foreground: colors[role] },
  })),
});

const shikiSyntaxLight = buildSyntaxTheme(
  "vinnie-syntax-light",
  "light",
  "#f1ebde",
  "#19223e",
  {
    comment: "#7a8194",
    keyword: "#3a5a96",
    string: "#3f7a4e",
    function: "#8a5a2a",
    number: "#b05038",
    type: "#6a4a8a",
  },
);

const shikiSyntaxDark = buildSyntaxTheme(
  "vinnie-syntax-dark",
  "dark",
  "#1d2233",
  "#f7f3eb",
  {
    comment: "#8b93a6",
    keyword: "#88a8dd",
    string: "#8fc795",
    function: "#d3a868",
    number: "#e0977e",
    type: "#b9a0d8",
  },
);

export default defineConfig({
  site: "https://blog.vinnie.studio",
  output: "static",
  markdown: {
    // Single newline = <br>, blank line = new paragraph. Matches the
    // mental model of writing where each line break in the source is
    // intentional. Applied to .md and .mdx alike.
    remarkPlugins: [remarkBreaks],
    shikiConfig: {
      themes: {
        light: shikiSyntaxLight,
        dark: shikiSyntaxDark,
      },
      defaultColor: false,
      wrap: true,
      transformers: [codeBlockMetaTransformer],
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
