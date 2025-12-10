import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/v1/categories
 *
 * Public API endpoint for retrieving the category tree with published chart counts.
 *
 * Returns: Array of categories with subcategories and chart counts
 */
export async function GET() {
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

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
