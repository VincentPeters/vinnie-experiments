import { test, expect } from "@playwright/test";

// The embed iframe must NOT exist on first paint (zero-JS-friendly), and must be
// injected once the embed scrolls into view, pointing at the computed /embed URL.
test("MapEmbed lazy-loads the iframe on scroll with the right src", async ({ page }) => {
  await page.goto("/map-embed-test");

  const stage = page.locator("[data-map-embed]");
  await expect(stage).toHaveAttribute("data-embed-src", /\/en\/embed\?/);

  // Nothing loaded yet.
  await expect(stage.locator("iframe")).toHaveCount(0);

  // Scroll it into view -> the island injects the iframe.
  await stage.scrollIntoViewIfNeeded();

  const iframe = stage.locator("iframe");
  await expect(iframe).toHaveCount(1, { timeout: 5000 });

  const src = await iframe.getAttribute("src");
  expect(src).toContain("/en/embed");
  expect(src).toContain("controls=layers");
  // URLSearchParams encodes the comma in the layer list.
  expect(src).toContain("layers=parks%2Ctrees");
});

test("MapEmbed always offers a no-JS link to the full map", async ({ page }) => {
  await page.goto("/map-embed-test");
  const link = page.locator('figcaption a:has-text("open full map")');
  await expect(link).toHaveAttribute("href", /\/en\/embed\?/);
});
