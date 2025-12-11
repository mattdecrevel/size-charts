import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { extractApiKey, validateApiKey, hasScope } from "@/lib/api-auth";
import { withCors, handleCorsOptions } from "@/lib/cors";

// Handle CORS preflight
export async function OPTIONS(request: Request) {
	return handleCorsOptions(request);
}

/**
 * GET /api/v1/size-charts
 *
 * Public API endpoint for retrieving size charts.
 * Requires API key authentication when API_AUTH_REQUIRED=true
 *
 * Headers:
 * - Authorization: Bearer <api_key>
 * - X-API-Key: <api_key>
 *
 * Query params:
 * - id: Fetch a specific chart by ID (e.g., ?id=cuid123)
 * - category: Filter by category slug (e.g., ?category=mens)
 * - subcategory: Filter by subcategory slug, requires category (e.g., ?category=mens&subcategory=tops)
 * - slug: Fetch by chart slug (unique identifier) (e.g., ?slug=regular-fit)
 * - includeUnpublished: Include unpublished charts (default: false)
 *
 * Returns: Array of size charts with full data (columns, rows, cells with both units)
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

		if (!hasScope(validation.key!.scopes, "read:size-charts")) {
			return withCors(
				NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
				request
			);
		}
	}
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const slug = searchParams.get("slug");
    const includeUnpublished = searchParams.get("includeUnpublished") === "true";

    // Fetch by ID
    if (id) {
      const chart = await db.sizeChart.findUnique({
        where: { id },
        include: {
          subcategories: {
            include: {
              subcategory: {
                include: { category: true },
              },
            },
          },
          columns: { orderBy: { displayOrder: "asc" } },
          rows: {
            orderBy: { displayOrder: "asc" },
            include: {
              cells: {
                include: { label: true },
              },
            },
          },
        },
      });

      if (!chart || (!includeUnpublished && !chart.isPublished)) {
        return withCors(NextResponse.json({ error: "Size chart not found" }, { status: 404 }), request);
      }

      return withCors(NextResponse.json(transformChart(chart)), request);
    }

    // Fetch by slug
    if (slug) {
      const chart = await db.sizeChart.findUnique({
        where: { slug },
        include: {
          subcategories: {
            include: {
              subcategory: {
                include: { category: true },
              },
            },
          },
          columns: { orderBy: { displayOrder: "asc" } },
          rows: {
            orderBy: { displayOrder: "asc" },
            include: {
              cells: {
                include: { label: true },
              },
            },
          },
        },
      });

      if (!chart || (!includeUnpublished && !chart.isPublished)) {
        return withCors(NextResponse.json({ error: "Size chart not found" }, { status: 404 }), request);
      }

      return withCors(NextResponse.json(transformChart(chart)), request);
    }

    // Build filter for list queries
    const where: Record<string, unknown> = {};

    if (!includeUnpublished) {
      where.isPublished = true;
    }

    // Filter by category/subcategory
    if (category || subcategory) {
      const subWhere: Record<string, unknown> = {};

      if (subcategory && category) {
        // Find subcategory by slug within category
        const sub = await db.subcategory.findFirst({
          where: {
            slug: subcategory,
            category: { slug: category },
          },
        });

        if (sub) {
          subWhere.subcategoryId = sub.id;
        } else {
          // No matching subcategory, return empty
          return withCors(NextResponse.json([]), request);
        }
      } else if (category) {
        // Filter by category
        const cat = await db.category.findUnique({
          where: { slug: category },
          include: { subcategories: true },
        });

        if (cat) {
          subWhere.subcategoryId = { in: cat.subcategories.map((s) => s.id) };
        } else {
          return withCors(NextResponse.json([]), request);
        }
      }

      where.subcategories = { some: subWhere };
    }

    const charts = await db.sizeChart.findMany({
      where,
      include: {
        subcategories: {
          include: {
            subcategory: {
              include: { category: true },
            },
          },
        },
        columns: { orderBy: { displayOrder: "asc" } },
        rows: {
          orderBy: { displayOrder: "asc" },
          include: {
            cells: {
              include: { label: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return withCors(NextResponse.json(charts.map(transformChart)), request);
  } catch (error) {
    console.error("Error fetching size charts:", error);
    return withCors(NextResponse.json({ error: "Internal server error" }, { status: 500 }), request);
  }
}

// Transform chart data to a cleaner format for API consumers
function transformChart(chart: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  subcategories: Array<{
    subcategory: {
      id: string;
      name: string;
      slug: string;
      category: {
        id: string;
        name: string;
        slug: string;
      };
    };
  }>;
  columns: Array<{
    id: string;
    name: string;
    columnType: string;
    displayOrder: number;
  }>;
  rows: Array<{
    id: string;
    displayOrder: number;
    cells: Array<{
      id: string;
      columnId: string;
      valueInches: number | null;
      valueCm: number | null;
      valueText: string | null;
      valueMinInches: number | null;
      valueMaxInches: number | null;
      valueMinCm: number | null;
      valueMaxCm: number | null;
      labelId: string | null;
      label: {
        id: string;
        key: string;
        displayValue: string;
        labelType: string;
      } | null;
    }>;
  }>;
}) {
  return {
    id: chart.id,
    name: chart.name,
    slug: chart.slug,
    description: chart.description,
    isPublished: chart.isPublished,
    categories: chart.subcategories.map((sc) => ({
      category: sc.subcategory.category.slug,
      categoryName: sc.subcategory.category.name,
      subcategory: sc.subcategory.slug,
      subcategoryName: sc.subcategory.name,
    })),
    columns: chart.columns.map((col) => ({
      id: col.id,
      name: col.name,
      type: col.columnType,
    })),
    rows: chart.rows.map((row) => ({
      id: row.id,
      cells: chart.columns.map((col) => {
        const cell = row.cells.find((c) => c.columnId === col.id);
        if (!cell) {
          return { columnId: col.id, value: null };
        }

        // For measurement columns, return both units
        if (col.columnType === "MEASUREMENT") {
          if (cell.valueMinInches !== null || cell.valueMaxInches !== null) {
            return {
              columnId: col.id,
              type: "range",
              inches: {
                min: cell.valueMinInches,
                max: cell.valueMaxInches,
              },
              cm: {
                min: cell.valueMinCm,
                max: cell.valueMaxCm,
              },
            };
          }
          return {
            columnId: col.id,
            type: "single",
            inches: cell.valueInches,
            cm: cell.valueCm,
          };
        }

        // For label-linked cells
        if (cell.label) {
          return {
            columnId: col.id,
            type: "label",
            key: cell.label.key,
            value: cell.label.displayValue,
            labelType: cell.label.labelType,
          };
        }

        // For text cells
        return {
          columnId: col.id,
          type: "text",
          value: cell.valueText,
        };
      }),
    })),
    meta: {
      createdAt: chart.createdAt.toISOString(),
      updatedAt: chart.updatedAt.toISOString(),
    },
  };
}
