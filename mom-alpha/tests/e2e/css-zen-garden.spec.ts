import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

/**
 * CSS Zen Garden Compliance Tests
 *
 * Validates that no component files contain hardcoded colors,
 * arbitrary font sizes, or inline styles.
 */

const SRC_DIR = path.resolve(__dirname, "../../src");

// Patterns that indicate CSS Zen Garden violations
const HARDCODED_COLOR_PATTERNS = [
  // Hex colors (but allow inside index.css Layer 1)
  /#[0-9a-fA-F]{3,8}\b/,
  // rgb/rgba/hsl/hsla function calls (but allow inside index.css and mom-alpha.css)
  /\b(?:rgb|rgba|hsl|hsla)\s*\(/,
];

const INLINE_STYLE_PATTERN = /style\s*=\s*\{/;
const ARBITRARY_FONT_PATTERN = /text-\[\d+(?:px|rem|em)\]/;

// Files that ARE allowed to have hardcoded colors (Layer 1 and Layer 3)
const ALLOWED_FILES = ["index.css", "mom-alpha.css", "globals.css"];

function getComponentFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getComponentFiles(fullPath));
    } else if (
      (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) &&
      !entry.name.endsWith(".test.ts") &&
      !entry.name.endsWith(".test.tsx") &&
      !entry.name.endsWith(".spec.ts")
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

test.describe("CSS Zen Garden Compliance", () => {
  const componentFiles = getComponentFiles(SRC_DIR);

  test("no hardcoded hex colors in component files", () => {
    const violations: string[] = [];

    for (const filePath of componentFiles) {
      const fileName = path.basename(filePath);
      if (ALLOWED_FILES.includes(fileName)) continue;

      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip comments and imports
        if (line.trim().startsWith("//") || line.trim().startsWith("*") || line.trim().startsWith("import")) continue;
        // Allow fontVariationSettings (needed for Material Symbols filled style)
        if (line.includes("fontVariationSettings")) continue;

        const hexMatch = line.match(/#[0-9a-fA-F]{3,8}\b/);
        if (hexMatch) {
          // Allow anchors (#section-name) and non-color hex
          const ctx = line.substring(Math.max(0, (hexMatch.index ?? 0) - 10), (hexMatch.index ?? 0) + (hexMatch[0]?.length ?? 0) + 5);
          if (ctx.includes('href="') || ctx.includes("href='") || ctx.includes("id=")) continue;
          violations.push(`${path.relative(SRC_DIR, filePath)}:${i + 1} — ${hexMatch[0]}`);
        }
      }
    }

    expect(violations, `Hardcoded hex colors found:\n${violations.join("\n")}`).toHaveLength(0);
  });

  test("no inline style objects in component files", () => {
    const violations: string[] = [];

    for (const filePath of componentFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (INLINE_STYLE_PATTERN.test(line)) {
          // Allow fontVariationSettings (Material Symbols need it)
          if (line.includes("fontVariationSettings")) continue;
          violations.push(`${path.relative(SRC_DIR, filePath)}:${i + 1}`);
        }
      }
    }

    expect(violations, `Inline styles found:\n${violations.join("\n")}`).toHaveLength(0);
  });

  test("no arbitrary Tailwind font sizes in component files", () => {
    const violations: string[] = [];

    for (const filePath of componentFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        if (ARBITRARY_FONT_PATTERN.test(lines[i])) {
          violations.push(`${path.relative(SRC_DIR, filePath)}:${i + 1}`);
        }
      }
    }

    expect(
      violations,
      `Arbitrary font sizes found (use text-alphaai-* tokens):\n${violations.join("\n")}`
    ).toHaveLength(0);
  });
});

test.describe("Theme Swap Test", () => {
  const APP_PAGES = [
    "/dashboard",
    "/calendar",
    "/tasks",
    "/agents/wellness",
    "/agents/tutor",
    "/agents/budget",
    "/agents/school",
    "/profile",
    "/settings",
    "/notifications",
    "/legal/privacy",
    "/legal/terms",
    "/legal/ai-disclosure",
  ];

  for (const pagePath of APP_PAGES) {
    test(`midnight-mom theme renders on ${pagePath}`, async ({ page }) => {
      await page.goto(pagePath);

      // Apply dark theme
      await page.evaluate(() => {
        document.documentElement.classList.remove("lullaby-logic");
        document.documentElement.classList.add("midnight-mom");
      });

      // Verify CSS variables are applied (background should change)
      const bgColor = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue("--background").trim()
      );
      expect(bgColor).toBeTruthy();
      // Midnight Mom uses 200 30% 8% (dark background)
      expect(bgColor).toContain("30%");

      // Verify page doesn't have broken layout (no elements overflowing viewport)
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // small tolerance
    });
  }
});
