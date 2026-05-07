/**
 * True when the current build is the production deploy.
 * On Cloudflare Pages, `CF_PAGES_BRANCH` is set to the branch name.
 * Locally and on preview branches it is anything other than "main".
 */
export function isProduction(): boolean {
  const branch = process.env.CF_PAGES_BRANCH;
  return branch === "main";
}
