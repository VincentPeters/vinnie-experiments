import { test, expect } from "@playwright/test";

// The embed iframe must NOT exist on page load (zero-JS-friendly, no broken
// cross-origin frame), and must be injected when the reader clicks "load
// interactive map", pointing at the computed /embed URL.
test("MapEmbed loads the iframe on button click with the right src", async ({ page }) => {
  await page.goto("/map-embed-test");

  const stage = page.locator("[data-map-embed]");
  await expect(stage).toHaveAttribute("data-embed-src", /\/en\/embed\?/);

  // Nothing loaded until the reader asks for it.
  await expect(stage.locator("iframe")).toHaveCount(0);

  await page.locator("[data-map-embed-load]").click();

  const iframe = stage.locator("iframe");
  await expect(iframe).toHaveCount(1, { timeout: 5000 });

  const src = await iframe.getAttribute("src");
  expect(src).toContain("/en/embed");
  expect(src).toContain("controls=layers");
  expect(src).toContain("layers=parks%2Ctrees");
});

test("MapEmbed always offers a no-JS link to the full map", async ({ page }) => {
  await page.goto("/map-embed-test");
  const link = page.locator('figcaption a:has-text("open full map")');
  await expect(link).toHaveAttribute("href", /\/en\/embed\?/);
});
