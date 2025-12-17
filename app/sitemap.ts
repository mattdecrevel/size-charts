import type { MetadataRoute } from "next";
import {
	DEMO_CATEGORY_SLUGS,
	DEMO_SUBCATEGORY_SLUGS,
	DEMO_SIZE_CHART_SLUGS,
	DEMO_SIZE_CHART_URLS,
} from "@/lib/demo-slugs";

const BASE_URL = "https://www.sizecharts.dev";

export default function sitemap(): MetadataRoute.Sitemap {
	const now = new Date();

	// Static pages
	const staticPages: MetadataRoute.Sitemap = [
		{
			url: BASE_URL,
			lastModified: now,
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${BASE_URL}/docs/getting-started`,
			lastModified: now,
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${BASE_URL}/docs/api`,
			lastModified: now,
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${BASE_URL}/docs/embed`,
			lastModified: now,
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${BASE_URL}/docs/changelog`,
			lastModified: now,
			changeFrequency: "weekly",
			priority: 0.6,
		},
		{
			url: `${BASE_URL}/templates`,
			lastModified: now,
			changeFrequency: "weekly",
			priority: 0.7,
		},
		{
			url: `${BASE_URL}/examples`,
			lastModified: now,
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${BASE_URL}/examples/embed`,
			lastModified: now,
			changeFrequency: "monthly",
			priority: 0.6,
		},
		{
			url: `${BASE_URL}/examples/live`,
			lastModified: now,
			changeFrequency: "monthly",
			priority: 0.6,
		},
		{
			url: `${BASE_URL}/size-guide`,
			lastModified: now,
			changeFrequency: "weekly",
			priority: 0.9,
		},
	];

	// Category pages from static demo slugs
	const categoryPages: MetadataRoute.Sitemap = DEMO_CATEGORY_SLUGS.map((slug) => ({
		url: `${BASE_URL}/size-guide/${slug}`,
		lastModified: now,
		changeFrequency: "weekly" as const,
		priority: 0.8,
	}));

	// Subcategory pages from static demo slugs
	const subcategoryPages: MetadataRoute.Sitemap = Object.entries(DEMO_SUBCATEGORY_SLUGS).flatMap(
		([categorySlug, subcategorySlugs]) =>
			subcategorySlugs.map((subSlug) => ({
				url: `${BASE_URL}/size-guide/${categorySlug}/${subSlug}`,
				lastModified: now,
				changeFrequency: "weekly" as const,
				priority: 0.7,
			}))
	);

	// Size chart pages from static demo slugs
	const chartPages: MetadataRoute.Sitemap = DEMO_SIZE_CHART_SLUGS.map((chartSlug) => {
		const [categorySlug, subcategorySlug] = DEMO_SIZE_CHART_URLS[chartSlug];
		return {
			url: `${BASE_URL}/size-guide/${categorySlug}/${subcategorySlug}/${chartSlug}`,
			lastModified: now,
			changeFrequency: "weekly" as const,
			priority: 0.6,
		};
	});

	return [...staticPages, ...categoryPages, ...subcategoryPages, ...chartPages];
}
