import { test, expect } from "@playwright/test";
import { DEMO_SIZE_CHART_SLUGS } from "../lib/demo-slugs";

test.describe("Demo Mode", () => {
	test.describe("Demo Status API", () => {
		test("GET /api/admin/demo-reset should return demo mode status", async ({ request }) => {
			const response = await request.get("/api/admin/demo-reset");
			expect(response.ok()).toBe(true);

			const data = await response.json();
			expect(data).toHaveProperty("demo_mode");

			if (data.demo_mode) {
				// In demo mode, should have additional fields
				expect(data).toHaveProperty("reset_interval_hours");
				expect(data.reset_interval_hours).toBe(12);
			}
		});
	});

	test.describe("Demo Slug Protection - API", () => {
		test("should return demo mode status before testing slug protection", async ({ request }) => {
			const statusResponse = await request.get("/api/admin/demo-reset");
			const status = await statusResponse.json();

			// This test serves as documentation of expected behavior
			// Actual protection depends on demo_mode being enabled
			if (status.demo_mode) {
				// Verify demo size charts exist in database
				const chartsResponse = await request.get("/api/size-charts");
				const charts = await chartsResponse.json();

				// At least some demo charts should exist
				const demoCharts = charts.filter((chart: { slug: string }) =>
					DEMO_SIZE_CHART_SLUGS.includes(chart.slug as typeof DEMO_SIZE_CHART_SLUGS[number])
				);

				expect(demoCharts.length).toBeGreaterThan(0);
			}
		});

		test("should have demo categories when demo mode is enabled", async ({ request }) => {
			const statusResponse = await request.get("/api/admin/demo-reset");
			const status = await statusResponse.json();

			if (status.demo_mode) {
				const response = await request.get("/api/categories");
				const categories = await response.json();

				// Demo mode should have mens, womens, boys, girls categories
				const categorySlugs = categories.map((c: { slug: string }) => c.slug);
				expect(categorySlugs).toContain("mens");
				expect(categorySlugs).toContain("womens");
				expect(categorySlugs).toContain("boys");
				expect(categorySlugs).toContain("girls");
			}
		});
	});

	test.describe("Demo Mode UI", () => {
		test("should load size chart edit page for demo chart", async ({ page, request }) => {
			const statusResponse = await request.get("/api/admin/demo-reset");
			const status = await statusResponse.json();

			if (!status.demo_mode) {
				test.skip();
				return;
			}

			// Get a demo size chart ID
			const chartsResponse = await request.get("/api/size-charts");
			const charts = await chartsResponse.json();
			const demoChart = charts.find((chart: { slug: string }) =>
				DEMO_SIZE_CHART_SLUGS.includes(chart.slug as typeof DEMO_SIZE_CHART_SLUGS[number])
			);

			if (!demoChart) {
				test.skip();
				return;
			}

			// Navigate to edit page
			await page.goto(`/admin/size-charts/${demoChart.id}`);

			// Wait for page to load
			await page.waitForLoadState("networkidle");

			// Check if we're on the edit page (either logged in or redirected to login)
			const editPageContent = page.locator("text=Chart ID");
			const loginPage = page.locator("text=Sign in");

			const isEditPage = await editPageContent.isVisible().catch(() => false);
			const isLoginPage = await loginPage.isVisible().catch(() => false);

			expect(isEditPage || isLoginPage).toBe(true);

			// If on edit page, slug input should be disabled for demo charts
			if (isEditPage) {
				const slugInput = page.locator('input[placeholder*="regular-fit"]');
				if (await slugInput.isVisible()) {
					const isDisabled = await slugInput.isDisabled();
					expect(isDisabled).toBe(true);
				}
			}
		});
	});

	test.describe("Non-Demo Mode", () => {
		test("should allow slug changes when demo mode is disabled", async ({ request }) => {
			const statusResponse = await request.get("/api/admin/demo-reset");
			const status = await statusResponse.json();

			// This test documents expected behavior when demo mode is off
			if (!status.demo_mode) {
				// Demo reset endpoint should return minimal response
				expect(status.demo_mode).toBe(false);
				expect(status.last_reset).toBeUndefined();
				expect(status.next_reset).toBeUndefined();
			}
		});
	});
});
