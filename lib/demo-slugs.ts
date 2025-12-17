/**
 * Static list of demo slugs - these are protected in demo mode
 *
 * These slugs correspond to the demo data created from templates.
 * In demo mode:
 * - These slugs cannot be changed via the API or UI
 * - Demo reset will upsert data back to factory settings for these slugs
 * - User-created content with different slugs is left untouched
 */

// Category slugs (4 total)
export const DEMO_CATEGORY_SLUGS = [
	"mens",
	"womens",
	"boys",
	"girls",
] as const;

// Subcategory slugs per category (24 total)
// Note: Subcategory slugs are unique within a category, not globally
export const DEMO_SUBCATEGORY_SLUGS = {
	mens: ["tops", "bottoms", "footwear", "gloves", "headwear", "socks"],
	womens: ["tops", "bras", "bottoms", "footwear", "gloves", "headwear", "socks", "plus-sizes"],
	boys: ["tops", "bottoms", "footwear", "gloves", "headwear", "socks"],
	girls: ["tops", "bottoms", "footwear", "gloves", "headwear", "socks"],
} as const;

// Size chart slugs (23 total)
export const DEMO_SIZE_CHART_SLUGS = [
	// Men's
	"mens-tops",
	"mens-bottoms",
	"mens-footwear",
	"mens-gloves",
	"mens-headwear",
	"mens-socks",
	// Women's
	"womens-tops",
	"womens-sports-bras",
	"womens-bottoms",
	"womens-plus-sizes",
	"womens-footwear",
	"womens-gloves",
	"womens-headwear",
	"womens-socks",
	// Youth (shared across boys/girls)
	"youth-big-kids-tops",
	"youth-big-kids-bottoms",
	"youth-little-kids",
	"youth-toddler",
	"youth-infant",
	"youth-footwear",
	"youth-gloves",
	"youth-headwear",
	"youth-socks",
] as const;

/**
 * Size chart URL mappings for sitemap generation
 * Maps size chart slug to [categorySlug, subcategorySlug]
 * For youth charts shared between boys/girls, we use boys as the canonical URL
 */
export const DEMO_SIZE_CHART_URLS: Record<
	(typeof DEMO_SIZE_CHART_SLUGS)[number],
	[string, string]
> = {
	// Men's
	"mens-tops": ["mens", "tops"],
	"mens-bottoms": ["mens", "bottoms"],
	"mens-footwear": ["mens", "footwear"],
	"mens-gloves": ["mens", "gloves"],
	"mens-headwear": ["mens", "headwear"],
	"mens-socks": ["mens", "socks"],
	// Women's
	"womens-tops": ["womens", "tops"],
	"womens-sports-bras": ["womens", "bras"],
	"womens-bottoms": ["womens", "bottoms"],
	"womens-plus-sizes": ["womens", "plus-sizes"],
	"womens-footwear": ["womens", "footwear"],
	"womens-gloves": ["womens", "gloves"],
	"womens-headwear": ["womens", "headwear"],
	"womens-socks": ["womens", "socks"],
	// Youth (canonical URLs use boys category)
	"youth-big-kids-tops": ["boys", "tops"],
	"youth-big-kids-bottoms": ["boys", "bottoms"],
	"youth-little-kids": ["boys", "tops"],
	"youth-toddler": ["boys", "tops"],
	"youth-infant": ["boys", "tops"],
	"youth-footwear": ["boys", "footwear"],
	"youth-gloves": ["boys", "gloves"],
	"youth-headwear": ["boys", "headwear"],
	"youth-socks": ["boys", "socks"],
};

// Type exports for type safety
export type DemoCategorySlug = (typeof DEMO_CATEGORY_SLUGS)[number];
export type DemoSizeChartSlug = (typeof DEMO_SIZE_CHART_SLUGS)[number];

/**
 * Check if a slug is a protected demo category slug
 */
export function isDemoCategorySlug(slug: string): slug is DemoCategorySlug {
	return DEMO_CATEGORY_SLUGS.includes(slug as DemoCategorySlug);
}

/**
 * Check if a slug is a protected demo subcategory slug within a category
 */
export function isDemoSubcategorySlug(categorySlug: string, subcategorySlug: string): boolean {
	const categorySubs = DEMO_SUBCATEGORY_SLUGS[categorySlug as keyof typeof DEMO_SUBCATEGORY_SLUGS];
	if (!categorySubs) return false;
	return (categorySubs as readonly string[]).includes(subcategorySlug);
}

/**
 * Check if a slug is a protected demo size chart slug
 */
export function isDemoSizeChartSlug(slug: string): slug is DemoSizeChartSlug {
	return DEMO_SIZE_CHART_SLUGS.includes(slug as DemoSizeChartSlug);
}

/**
 * Get all demo subcategory slugs as a flat array
 */
export function getAllDemoSubcategorySlugs(): string[] {
	return Object.values(DEMO_SUBCATEGORY_SLUGS).flat();
}
