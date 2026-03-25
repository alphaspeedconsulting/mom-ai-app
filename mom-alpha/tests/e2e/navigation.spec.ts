import { test, expect } from "@playwright/test";

test.describe("Page Navigation", () => {
  test("landing page loads with hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Mom\.alpha/);
    await expect(page.locator("text=Take a breath")).toBeVisible();
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("text=Sign in")).toBeVisible();
  });

  test("dashboard page loads", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("text=Mom.alpha")).toBeVisible();
  });

  test("calendar page loads", async ({ page }) => {
    await page.goto("/calendar");
    await expect(page.locator("text=Calendar")).toBeVisible();
  });

  test("tasks page loads", async ({ page }) => {
    await page.goto("/tasks");
    await expect(page.locator("text=Tasks")).toBeVisible();
  });

  test("wellness hub page loads", async ({ page }) => {
    await page.goto("/agents/wellness");
    await expect(page.locator("text=Wellness Hub")).toBeVisible();
  });

  test("tutor finder page loads", async ({ page }) => {
    await page.goto("/agents/tutor");
    await expect(page.locator("text=Tutor Finder")).toBeVisible();
  });

  test("budget agent page loads", async ({ page }) => {
    await page.goto("/agents/budget");
    await expect(page.locator("text=Budget")).toBeVisible();
  });

  test("school event hub page loads", async ({ page }) => {
    await page.goto("/agents/school");
    await expect(page.locator("text=School")).toBeVisible();
  });

  test("privacy policy page loads", async ({ page }) => {
    await page.goto("/legal/privacy");
    await expect(page.locator("text=Privacy Policy")).toBeVisible();
    // Verify 18+ statement
    await expect(page.locator("text=users aged 18 and older")).toBeVisible();
  });

  test("terms of service page loads", async ({ page }) => {
    await page.goto("/legal/terms");
    await expect(page.locator("text=Terms of Service")).toBeVisible();
  });

  test("AI disclosure page loads", async ({ page }) => {
    await page.goto("/legal/ai-disclosure");
    await expect(page.locator("text=AI Disclosure")).toBeVisible();
    // Verify PII protection section
    await expect(page.locator("text=PII Protection")).toBeVisible();
  });

  test("profile page loads", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.locator("text=Profile")).toBeVisible();
  });

  test("settings page loads", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("text=Settings")).toBeVisible();
  });

  test("notifications page loads", async ({ page }) => {
    await page.goto("/notifications");
    await expect(page.locator("text=Notification")).toBeVisible();
  });
});

test.describe("Bottom Navigation", () => {
  test("bottom nav is visible on app pages", async ({ page }) => {
    await page.goto("/dashboard");
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("bottom nav has 4 tabs", async ({ page }) => {
    await page.goto("/dashboard");
    const tabs = page.locator("nav a, nav button");
    await expect(tabs).toHaveCount(4);
  });
});
