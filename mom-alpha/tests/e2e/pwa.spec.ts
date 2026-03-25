import { test, expect } from "@playwright/test";

test.describe("PWA Requirements", () => {
  test("manifest.json is served with correct fields", async ({ page }) => {
    const response = await page.goto("/manifest.json");
    expect(response?.status()).toBe(200);

    const manifest = await response?.json();
    expect(manifest.name).toContain("Mom.alpha");
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBeTruthy();
    expect(manifest.icons).toHaveLength(2);
    expect(manifest.icons[0].sizes).toBe("192x192");
    expect(manifest.icons[1].sizes).toBe("512x512");
  });

  test("service worker is registered", async ({ page }) => {
    await page.goto("/");

    // Check that the SW file is accessible
    const swResponse = await page.goto("/sw.js");
    expect(swResponse?.status()).toBe(200);
    const swContent = await swResponse?.text();
    expect(swContent).toContain("precacheAndRoute");
  });

  test("robots.txt is served", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);
  });

  test("sitemap.xml is served", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);
  });

  test("meta viewport is set for mobile", async ({ page }) => {
    await page.goto("/");
    const viewport = await page.locator('meta[name="viewport"]').getAttribute("content");
    expect(viewport).toContain("width=device-width");
  });

  test("manifest link tag exists in HTML", async ({ page }) => {
    await page.goto("/");
    const manifestLink = await page.locator('link[rel="manifest"]').getAttribute("href");
    expect(manifestLink).toContain("manifest.json");
  });

  test("theme-color meta tag exists", async ({ page }) => {
    await page.goto("/");
    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute("content");
    expect(themeColor).toBeTruthy();
  });
});

test.describe("Offline Support", () => {
  test("offline banner appears when offline", async ({ page, context }) => {
    await page.goto("/dashboard");

    // Go offline
    await context.setOffline(true);

    // Wait for offline banner to appear
    await page.waitForTimeout(1000);
    const offlineBanner = page.locator("text=offline");
    // OfflineBanner component should be visible
    await expect(offlineBanner).toBeVisible({ timeout: 5000 });

    // Go back online
    await context.setOffline(false);
  });
});
