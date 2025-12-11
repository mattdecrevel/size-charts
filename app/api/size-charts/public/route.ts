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
        subcategories: {
          some: {
            subcategory: {
              slug: subcategorySlug,
              category: {
                slug: categorySlug,
              },
            },
          },
        },
      },
      include: {
        subcategories: {
          include: {
            subcategory: {
              include: { category: true },
            },
          },
        },
        measurementInstructions: {
          include: { instruction: true },
          orderBy: { displayOrder: "asc" },
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

    if (!chart) {
      return NextResponse.json({ error: "Size chart not found" }, { status: 404 });
    }

    // Transform response to match expected format (with singular subcategory for backward compat)
    const primarySubcategory = chart.subcategories.find(
      (sc) => sc.subcategory.slug === subcategorySlug && sc.subcategory.category.slug === categorySlug
    );

    return NextResponse.json({
      ...chart,
      subcategory: primarySubcategory?.subcategory || chart.subcategories[0]?.subcategory,
    });
  } catch (error) {
    console.error("Error fetching public size chart:", error);
    return NextResponse.json({ error: "Failed to fetch size chart" }, { status: 500 });
  }
}
