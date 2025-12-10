import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/v1/labels
 *
 * Public API endpoint for retrieving size labels.
 * Labels are standardized size identifiers (e.g., SIZE_SM -> "SM")
 *
 * Query params:
 * - type: Filter by label type (e.g., ?type=ALPHA_SIZE)
 *
 * Returns: Array of labels grouped by type
 */
export async function GET(request: NextRequest) {
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
    const grouped = labels.reduce((acc, label) => {
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
    }, {} as Record<string, Array<{ key: string; value: string; sortOrder: number; description: string | null }>>);

    return NextResponse.json(grouped);
  } catch (error) {
    console.error("Error fetching labels:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
