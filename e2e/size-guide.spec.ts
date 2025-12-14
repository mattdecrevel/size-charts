import { test, expect } from "@playwright/test";

test.describe("Size Guide", () => {
  test("should load the size guide page", async ({ page }) => {
    await page.goto("/size-guide");
    await expect(page.getByRole("heading", { name: /size guide/i })).toBeVisible();
  });

  test("should display category cards", async ({ page }) => {
    await page.goto("/size-guide");

    // Should have at least one category card
    const categoryCards = page.locator("[data-testid='category-card'], a[href*='/size-guide/']");
    await expect(categoryCards.first()).toBeVisible();
  });

  test("should navigate to category page when clicking a category", async ({ page }) => {
    await page.goto("/size-guide");

    // Click on the first category link
    const firstCategory = page.locator("a[href*='/size-guide/']").first();
    await firstCategory.click();

    // Should navigate to a subcategory selection or chart page
    await expect(page).toHaveURL(/\/size-guide\/.+/);
  });
});
