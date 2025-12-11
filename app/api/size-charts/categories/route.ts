import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCharts = searchParams.get("includeCharts") === "true";

    const categories = await db.category.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        subcategories: {
          orderBy: { displayOrder: "asc" },
          include: {
            _count: { select: { sizeCharts: true } },
            ...(includeCharts
              ? {
                  sizeCharts: {
                    orderBy: { displayOrder: "asc" },
                    include: {
                      sizeChart: {
                        select: {
                          id: true,
                          name: true,
                          slug: true,
                          isPublished: true,
                        },
                      },
                    },
                  },
                }
              : {}),
          },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
