import { test, expect } from "@playwright/test";

function seedAuthState(
  page: import("@playwright/test").Page,
  user: {
    household_id: string | null;
    household_role?: "admin" | "member" | null;
    parent_brand?: "mom" | "dad" | "neutral";
    household_membership_status?: "none" | "pending_invite" | "active";
  }
) {
  return page.addInitScript((seededUser) => {
    localStorage.setItem(
      "mom-alpha-auth",
      JSON.stringify({
        state: {
          user: {
            id: "user_1",
            email: "mom@example.com",
            name: "Mom User",
            household_id: seededUser.household_id,
            tier: "trial",
            consent_current: true,
            household_role: seededUser.household_role ?? null,
            parent_brand: seededUser.parent_brand ?? "mom",
            household_membership_status: seededUser.household_membership_status ?? "active",
          },
          token: "test-token",
          isAuthenticated: true,
        },
        version: 0,
      })
    );
  }, user);
}

test.describe("Shared Household UX", () => {
  test("settings shows create/join actions when no household is linked", async ({ page }) => {
    await seedAuthState(page, {
      household_id: null,
      household_membership_status: "none",
      parent_brand: "mom",
    });

    await page.goto("/settings");

    await expect(page.getByText("Household & Co-Parent Access")).toBeVisible();
    await expect(page.getByText("Create a household")).toBeVisible();
    await expect(page.getByText("Join via invite token")).toBeVisible();
  });

  test("admin parent can access co-parent invite controls", async ({ page }) => {
    await seedAuthState(page, {
      household_id: "hh_123",
      household_role: "admin",
      parent_brand: "mom",
      household_membership_status: "active",
    });

    await page.goto("/settings");

    await expect(page.getByText("Invite co-parent")).toBeVisible();
    await expect(page.getByRole("button", { name: "Invite" })).toBeEnabled();
  });

  test("member parent sees invite action disabled", async ({ page }) => {
    await seedAuthState(page, {
      household_id: "hh_456",
      household_role: "member",
      parent_brand: "dad",
      household_membership_status: "active",
    });

    await page.goto("/settings");

    await expect(page.getByRole("button", { name: "Invite" })).toBeDisabled();
    await expect(page.getByText("Only household admins can send invites.")).toBeVisible();
  });
});
