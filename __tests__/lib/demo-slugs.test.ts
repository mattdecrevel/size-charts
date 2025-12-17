import { describe, it, expect } from "vitest";
import {
	DEMO_CATEGORY_SLUGS,
	DEMO_SIZE_CHART_SLUGS,
	DEMO_SUBCATEGORY_SLUGS,
	isDemoCategorySlug,
	isDemoSubcategorySlug,
	isDemoSizeChartSlug,
	getAllDemoSubcategorySlugs,
} from "@/lib/demo-slugs";

describe("Demo Slugs", () => {
	describe("constants", () => {
		it("should have exactly 4 category slugs", () => {
			expect(DEMO_CATEGORY_SLUGS).toHaveLength(4);
			expect(DEMO_CATEGORY_SLUGS).toContain("mens");
			expect(DEMO_CATEGORY_SLUGS).toContain("womens");
			expect(DEMO_CATEGORY_SLUGS).toContain("boys");
			expect(DEMO_CATEGORY_SLUGS).toContain("girls");
		});

		it("should have exactly 23 size chart slugs", () => {
			expect(DEMO_SIZE_CHART_SLUGS).toHaveLength(23);
		});

		it("should have correct subcategory counts per category", () => {
			expect(DEMO_SUBCATEGORY_SLUGS.mens).toHaveLength(6);
			expect(DEMO_SUBCATEGORY_SLUGS.womens).toHaveLength(8);
			expect(DEMO_SUBCATEGORY_SLUGS.boys).toHaveLength(6);
			expect(DEMO_SUBCATEGORY_SLUGS.girls).toHaveLength(6);
		});

		it("should have 24 total subcategory slugs", () => {
			const total = getAllDemoSubcategorySlugs().length;
			expect(total).toBe(26); // 6 + 8 + 6 + 6 = 26 (with duplicates across categories)
		});
	});

	describe("isDemoCategorySlug", () => {
		it("should return true for demo category slugs", () => {
			expect(isDemoCategorySlug("mens")).toBe(true);
			expect(isDemoCategorySlug("womens")).toBe(true);
			expect(isDemoCategorySlug("boys")).toBe(true);
			expect(isDemoCategorySlug("girls")).toBe(true);
		});

		it("should return false for non-demo slugs", () => {
			expect(isDemoCategorySlug("custom-category")).toBe(false);
			expect(isDemoCategorySlug("")).toBe(false);
			expect(isDemoCategorySlug("men")).toBe(false); // typo
			expect(isDemoCategorySlug("MENS")).toBe(false); // case sensitive
		});
	});

	describe("isDemoSubcategorySlug", () => {
		it("should return true for valid category/subcategory pairs", () => {
			expect(isDemoSubcategorySlug("mens", "tops")).toBe(true);
			expect(isDemoSubcategorySlug("mens", "bottoms")).toBe(true);
			expect(isDemoSubcategorySlug("womens", "bras")).toBe(true);
			expect(isDemoSubcategorySlug("womens", "plus-sizes")).toBe(true);
			expect(isDemoSubcategorySlug("boys", "footwear")).toBe(true);
			expect(isDemoSubcategorySlug("girls", "headwear")).toBe(true);
		});

		it("should return false for invalid category", () => {
			expect(isDemoSubcategorySlug("invalid", "tops")).toBe(false);
			expect(isDemoSubcategorySlug("", "tops")).toBe(false);
		});

		it("should return false for non-demo subcategory", () => {
			expect(isDemoSubcategorySlug("mens", "custom")).toBe(false);
			expect(isDemoSubcategorySlug("mens", "")).toBe(false);
		});

		it("should return false for subcategory not in that category", () => {
			// bras only exists in womens
			expect(isDemoSubcategorySlug("mens", "bras")).toBe(false);
			// plus-sizes only exists in womens
			expect(isDemoSubcategorySlug("boys", "plus-sizes")).toBe(false);
		});
	});

	describe("isDemoSizeChartSlug", () => {
		it("should return true for demo size chart slugs", () => {
			expect(isDemoSizeChartSlug("mens-tops")).toBe(true);
			expect(isDemoSizeChartSlug("womens-sports-bras")).toBe(true);
			expect(isDemoSizeChartSlug("youth-footwear")).toBe(true);
			expect(isDemoSizeChartSlug("youth-big-kids-tops")).toBe(true);
		});

		it("should return false for non-demo slugs", () => {
			expect(isDemoSizeChartSlug("custom-chart")).toBe(false);
			expect(isDemoSizeChartSlug("")).toBe(false);
			expect(isDemoSizeChartSlug("mens-custom")).toBe(false);
		});

		it("should be case sensitive", () => {
			expect(isDemoSizeChartSlug("MENS-TOPS")).toBe(false);
			expect(isDemoSizeChartSlug("Mens-Tops")).toBe(false);
		});
	});

	describe("getAllDemoSubcategorySlugs", () => {
		it("should return flat array of all subcategory slugs", () => {
			const all = getAllDemoSubcategorySlugs();
			expect(all).toContain("tops");
			expect(all).toContain("bras");
			expect(all).toContain("plus-sizes");
			expect(all).toContain("footwear");
		});

		it("should include duplicates from different categories", () => {
			const all = getAllDemoSubcategorySlugs();
			// "tops" appears in all 4 categories
			const topsCount = all.filter((s) => s === "tops").length;
			expect(topsCount).toBe(4);
		});
	});
});
