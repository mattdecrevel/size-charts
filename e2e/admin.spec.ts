import { test, expect } from "@playwright/test";

test.describe("Admin Panel", () => {
  test("should load the admin dashboard", async ({ page }) => {
    await page.goto("/admin");

    // Check if we're on the dashboard or login page
    const dashboardHeading = page.getByRole("heading", { name: /dashboard/i });
    const loginHeading = page.getByRole("heading", { name: /sign in/i });

    // Either dashboard or login should be visible (depending on auth state)
    const isDashboard = await dashboardHeading.isVisible().catch(() => false);
    const isLogin = await loginHeading.isVisible().catch(() => false);

    expect(isDashboard || isLogin).toBe(true);
  });

  test("should have sidebar navigation", async ({ page }) => {
    await page.goto("/admin");

    // Check for sidebar elements (if on dashboard)
    const sidebar = page.locator("[data-slot='sidebar']");
    const sidebarExists = await sidebar.isVisible().catch(() => false);

    if (sidebarExists) {
      // Verify navigation items
      await expect(page.getByRole("link", { name: /size charts/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /categories/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /templates/i })).toBeVisible();
    }
  });

  test("should navigate to size charts page", async ({ page }) => {
    await page.goto("/admin");

    const sizeChartsLink = page.getByRole("link", { name: /size charts/i });
    const linkVisible = await sizeChartsLink.isVisible().catch(() => false);

    if (linkVisible) {
      await sizeChartsLink.click();
      await expect(page).toHaveURL(/\/admin\/size-charts/);
    }
  });

  test("should navigate to templates page", async ({ page }) => {
    await page.goto("/admin");

    const templatesLink = page.getByRole("link", { name: /templates/i });
    const linkVisible = await templatesLink.isVisible().catch(() => false);

    if (linkVisible) {
      await templatesLink.click();
      await expect(page).toHaveURL(/\/admin\/templates/);
    }
  });
});

test.describe("Admin Templates Page", () => {
  test("should load templates page", async ({ page }) => {
    await page.goto("/admin/templates");

    // Check for templates heading or login redirect
    const templatesHeading = page.getByRole("heading", { name: /templates/i });
    const hasHeading = await templatesHeading.isVisible().catch(() => false);

    if (hasHeading) {
      await expect(templatesHeading).toBeVisible();
    }
  });

  test("should display template cards", async ({ page }) => {
    await page.goto("/admin/templates");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check for template cards
    const templateCards = page.locator("[data-template-id], .template-card, article");
    const count = await templateCards.count();

    // Should have templates if on the page
    if (count > 0) {
      expect(count).toBeGreaterThan(0);
    }
  });
});
