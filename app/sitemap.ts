import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

// Generate sitemap at runtime since it requires database access
export const dynamic = "force-dynamic";

const BASE_URL = "https://www.sizecharts.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// Static pages
	const staticPages: MetadataRoute.Sitemap = [
		{
			url: BASE_URL,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${BASE_URL}/docs/getting-started`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${BASE_URL}/docs/api`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${BASE_URL}/docs/embed`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${BASE_URL}/docs/changelog`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.6,
		},
		{
			url: `${BASE_URL}/templates`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.7,
		},
		{
			url: `${BASE_URL}/examples`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${BASE_URL}/examples/embed`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.6,
		},
		{
			url: `${BASE_URL}/examples/live`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.6,
		},
		{
			url: `${BASE_URL}/size-guide`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.9,
		},
	];

	// Dynamic pages - Categories
	const categories = await db.category.findMany({
		select: {
			slug: true,
			updatedAt: true,
		},
	});

	const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
		url: `${BASE_URL}/size-guide/${category.slug}`,
		lastModified: category.updatedAt,
		changeFrequency: "weekly" as const,
		priority: 0.8,
	}));

	// Dynamic pages - Subcategories
	const subcategories = await db.subcategory.findMany({
		select: {
			slug: true,
			updatedAt: true,
			category: {
				select: { slug: true },
			},
		},
	});

	const subcategoryPages: MetadataRoute.Sitemap = subcategories.map((sub) => ({
		url: `${BASE_URL}/size-guide/${sub.category.slug}/${sub.slug}`,
		lastModified: sub.updatedAt,
		changeFrequency: "weekly" as const,
		priority: 0.7,
	}));

	// Dynamic pages - Published Size Charts
	const charts = await db.sizeChart.findMany({
		where: { isPublished: true },
		select: {
			slug: true,
			updatedAt: true,
			subcategories: {
				take: 1,
				select: {
					subcategory: {
						select: {
							slug: true,
							category: {
								select: { slug: true },
							},
						},
					},
				},
			},
		},
	});

	const chartPages: MetadataRoute.Sitemap = charts
		.filter((chart) => chart.subcategories.length > 0)
		.map((chart) => {
			const sub = chart.subcategories[0].subcategory;
			return {
				url: `${BASE_URL}/size-guide/${sub.category.slug}/${sub.slug}/${chart.slug}`,
				lastModified: chart.updatedAt,
				changeFrequency: "weekly" as const,
				priority: 0.6,
			};
		});

	return [...staticPages, ...categoryPages, ...subcategoryPages, ...chartPages];
}
