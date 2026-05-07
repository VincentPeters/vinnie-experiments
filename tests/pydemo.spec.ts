// tests/pydemo.spec.ts
import { test, expect } from "@playwright/test";

test.describe("PyDemo on /demo-test", () => {
  test("loads pyodide on viewport entry, runs default code, updates on input", async ({ page }) => {
    await page.goto("/demo-test/");
    const status1 = page.locator(".pydemo").first().locator("[data-pydemo-status]");
    await expect(status1).toHaveAttribute("data-state", "ready", { timeout: 60_000 });

    const button = page.locator(".pydemo").first().locator("[data-pydemo-run]");
    await button.click();
    await expect(status1).toHaveAttribute("data-state", "ready", { timeout: 30_000 });

    await expect(page.locator(".pydemo").first().locator("[data-pydemo-out] div")).toBeVisible();

    const slider = page.locator(".pydemo").first().locator('input[name="noise"]');
    await slider.fill("0.5");
    await page.waitForTimeout(500);
    await expect(status1).toHaveAttribute("data-state", "ready");
  });

  test("error demo shows traceback in red", async ({ page }) => {
    await page.goto("/demo-test/");
    const errorDemo = page.locator(".pydemo").nth(2);
    const status = errorDemo.locator("[data-pydemo-status]");
    await expect(status).toHaveAttribute("data-state", "ready", { timeout: 60_000 });
    await errorDemo.locator("[data-pydemo-run]").click();
    const out = errorDemo.locator("[data-pydemo-out] pre");
    await expect(out).toContainText("intentional smoke-test error", { timeout: 30_000 });
  });
});

test("home page does not load pyodide", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (req) => {
    if (req.url().includes("pyodide")) requests.push(req.url());
  });
  await page.goto("/");
  await page.waitForTimeout(1000);
  expect(requests).toEqual([]);
});
