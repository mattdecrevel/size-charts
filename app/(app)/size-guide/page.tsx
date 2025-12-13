import Link from "next/link";
import { db } from "@/lib/db";
import { ChevronRight } from "lucide-react";

export default async function SizeGuidePage() {
  // Get all categories with published chart counts
  const categories = await db.category.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      subcategories: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  // Get count of published size charts per category
  const categoryCounts = await db.sizeChartSubcategory.groupBy({
    by: ["subcategoryId"],
    where: {
      sizeChart: { isPublished: true },
    },
    _count: {
      sizeChartId: true,
    },
  });

  // Create a map of subcategory ID to count
  const countMap = new Map(
    categoryCounts.map((c) => [c.subcategoryId, c._count.sizeChartId])
  );

  // Calculate total charts per category
  const categoriesWithCounts = categories.map((category) => {
    const totalCharts = category.subcategories.reduce(
      (sum, sub) => sum + (countMap.get(sub.id) || 0),
      0
    );
    return { ...category, totalCharts };
  });

  // Filter to only show categories with published charts
  const activeCategories = categoriesWithCounts.filter((c) => c.totalCharts > 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Size Guide
        </h1>
        <p className="mt-2 text-muted-foreground">
          Find the perfect fit with our comprehensive size charts.
        </p>
      </div>

      {activeCategories.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No size charts available yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeCategories.map((category) => (
            <Link
              key={category.id}
              href={`/size-guide/${category.slug}`}
              className="group rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {category.totalCharts} size chart{category.totalCharts !== 1 ? "s" : ""}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
