import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categorySlug = searchParams.get("category");
    const subcategorySlug = searchParams.get("subcategory");
    const chartSlug = searchParams.get("chart");

    if (!categorySlug || !subcategorySlug || !chartSlug) {
      return NextResponse.json(
        { error: "Missing required parameters: category, subcategory, chart" },
        { status: 400 }
      );
    }

    const chart = await db.sizeChart.findFirst({
      where: {
        slug: chartSlug,
        isPublished: true,
        subcategory: {
          slug: subcategorySlug,
          category: {
            slug: categorySlug,
          },
        },
      },
      include: {
        subcategory: {
          include: { category: true },
        },
        columns: { orderBy: { displayOrder: "asc" } },
        rows: {
          orderBy: { displayOrder: "asc" },
          include: { cells: true },
        },
      },
    });

    if (!chart) {
      return NextResponse.json({ error: "Size chart not found" }, { status: 404 });
    }

    return NextResponse.json(chart);
  } catch (error) {
    console.error("Error fetching public size chart:", error);
    return NextResponse.json({ error: "Failed to fetch size chart" }, { status: 500 });
  }
}
