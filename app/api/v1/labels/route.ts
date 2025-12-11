import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { extractApiKey, validateApiKey, hasScope } from "@/lib/api-auth";
import { withCors, handleCorsOptions } from "@/lib/cors";

// Handle CORS preflight
export async function OPTIONS(request: Request) {
	return handleCorsOptions(request);
}

/**
 * GET /api/v1/labels
 *
 * Public API endpoint for retrieving size labels.
 * Labels are standardized size identifiers (e.g., SIZE_SM -> "SM")
 * Requires API key authentication when API_AUTH_REQUIRED=true
 *
 * Query params:
 * - type: Filter by label type (e.g., ?type=ALPHA_SIZE)
 *
 * Returns: Array of labels grouped by type
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

		if (!hasScope(validation.key!.scopes, "read:labels")) {
			return withCors(
				NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
				request
			);
		}
	}

	try {
		const searchParams = request.nextUrl.searchParams;
		const labelType = searchParams.get("type");

		const where: Record<string, unknown> = {};
		if (labelType) {
			where.labelType = labelType;
		}

		const labels = await db.sizeLabel.findMany({
			where,
			orderBy: [{ labelType: "asc" }, { sortOrder: "asc" }],
		});

		// Group by type for easier consumption
		const grouped = labels.reduce(
			(acc, label) => {
				const type = label.labelType;
				if (!acc[type]) {
					acc[type] = [];
				}
				acc[type].push({
					key: label.key,
					value: label.displayValue,
					sortOrder: label.sortOrder,
					description: label.description,
				});
				return acc;
			},
			{} as Record<
				string,
				Array<{ key: string; value: string; sortOrder: number; description: string | null }>
			>
		);

		return withCors(NextResponse.json(grouped), request);
	} catch (error) {
		console.error("Error fetching labels:", error);
		return withCors(
			NextResponse.json({ error: "Internal server error" }, { status: 500 }),
			request
		);
	}
}
