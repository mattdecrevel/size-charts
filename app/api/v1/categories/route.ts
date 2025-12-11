import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { extractApiKey, validateApiKey, hasScope } from "@/lib/api-auth";
import { withCors, handleCorsOptions } from "@/lib/cors";

// Handle CORS preflight
export async function OPTIONS(request: Request) {
	return handleCorsOptions(request);
}

/**
 * GET /api/v1/categories
 *
 * Public API endpoint for retrieving the category tree with published chart counts.
 * Requires API key authentication when API_AUTH_REQUIRED=true
 *
 * Returns: Array of categories with subcategories and chart counts
 */
export async function GET(request: NextRequest) {
	// Check if API auth is required
	const authRequired = process.env.API_AUTH_REQUIRED === "true";

	if (authRequired) {
		const apiKey = extractApiKey(request);
		const validation = await validateApiKey(apiKey);

		if (!validation.valid) {
			return withCors(
				NextResponse.json({ error: validation.error }, { status: 401 }),
				request
			);
		}

		if (!hasScope(validation.key!.scopes, "read:categories")) {
			return withCors(
				NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
				request
			);
		}
	}

	try {
		const categories = await db.category.findMany({
			orderBy: { displayOrder: "asc" },
			include: {
				subcategories: {
					orderBy: { displayOrder: "asc" },
					include: {
						_count: {
							select: {
								sizeCharts: {
									where: {
										sizeChart: { isPublished: true },
									},
								},
							},
						},
					},
				},
			},
		});

		// Transform to clean API format
		const result = categories.map((cat) => ({
			slug: cat.slug,
			name: cat.name,
			subcategories: cat.subcategories
				.filter((sub) => sub._count.sizeCharts > 0) // Only include subcategories with published charts
				.map((sub) => ({
					slug: sub.slug,
					name: sub.name,
					chartCount: sub._count.sizeCharts,
				})),
		}));

		return withCors(NextResponse.json(result), request);
	} catch (error) {
		console.error("Error fetching categories:", error);
		return withCors(
			NextResponse.json({ error: "Internal server error" }, { status: 500 }),
			request
		);
	}
}
