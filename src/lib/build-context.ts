import { CF_PAGES_BRANCH } from "astro:env/server";

/**
 * True when the current build is the production deploy.
 * On Cloudflare Pages, `CF_PAGES_BRANCH` is set to the branch name.
 * Locally and on preview branches it is anything other than "main".
 *
 * Reads via `astro:env/server` because Astro 6 + Cloudflare adapter
 * runs the prerender in workerd, where `process.env` is not exposed.
 */
export function isProduction(): boolean {
  return CF_PAGES_BRANCH === "main";
}
