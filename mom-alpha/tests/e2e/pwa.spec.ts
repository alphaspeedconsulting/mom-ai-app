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

  test("service worker is registered and contains precache", async ({ page }) => {
    await page.goto("/");

    // Check that the SW file is accessible
    const swResponse = await page.goto("/sw.js");
    expect(swResponse?.status()).toBe(200);
    const swContent = await swResponse?.text();
    expect(swContent).toContain("precacheAndRoute");
  });

  test("service worker imports push notification handler", async ({ page }) => {
    // sw.js must importScripts('/sw-push.js') so push and cache run in one SW registration
    const swResponse = await page.goto("/sw.js");
    expect(swResponse?.status()).toBe(200);
    const swContent = await swResponse?.text();
    expect(swContent).toContain("sw-push.js");
  });

  test("push notification handler file is accessible", async ({ page }) => {
    const swPushResponse = await page.goto("/sw-push.js");
    expect(swPushResponse?.status()).toBe(200);
    const swPushContent = await swPushResponse?.text();
    expect(swPushContent).toContain("addEventListener");
    expect(swPushContent).toContain("push");
    expect(swPushContent).toContain("notificationclick");
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

test.describe("Subscription Checkout", () => {
  test("settings page shows billing cycle toggle for trial users", async ({ page }) => {
    // Mock trial user tier via localStorage or cookie (adjust to app auth mechanism)
    await page.goto("/settings");
    // Billing cycle toggle buttons should be present
    const monthlyBtn = page.locator("button", { hasText: "Monthly" });
    const yearlyBtn = page.locator("button", { hasText: "Yearly" });
    await expect(monthlyBtn).toBeVisible({ timeout: 5000 });
    await expect(yearlyBtn).toBeVisible({ timeout: 5000 });
  });

  test("checkout success query param shows success feedback", async ({ page }) => {
    await page.goto("/settings?checkout=success");
    const feedback = page.locator("text=Subscription activated");
    await expect(feedback).toBeVisible({ timeout: 5000 });
  });

  test("checkout cancelled query param shows cancel feedback", async ({ page }) => {
    await page.goto("/settings?checkout=cancelled");
    const feedback = page.locator("text=Checkout cancelled");
    await expect(feedback).toBeVisible({ timeout: 5000 });
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
