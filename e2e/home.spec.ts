import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Size Charts/);
  });

  test("should have navigation links", async ({ page }) => {
    await page.goto("/");

    // Check for main navigation elements
    await expect(page.getByRole("link", { name: /size guide/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /admin/i })).toBeVisible();
  });

  test("should navigate to size guide", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /size guide/i }).click();
    await expect(page).toHaveURL(/\/size-guide/);
  });
});
