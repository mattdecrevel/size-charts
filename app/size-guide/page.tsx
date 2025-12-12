import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { db } from "@/lib/db";

export default async function SizeGuidePage() {
  const categories = await db.category.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      subcategories: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  // Get chart counts per subcategory
  const subcategoryCounts = await db.sizeChartSubcategory.groupBy({
    by: ["subcategoryId"],
    where: {
      sizeChart: { isPublished: true },
    },
    _count: {
      sizeChartId: true,
    },
  });

  const countMap = new Map(
    subcategoryCounts.map((c) => [c.subcategoryId, c._count.sizeChartId])
  );

  const categoriesWithCounts = categories.map((category) => ({
    ...category,
    subcategories: category.subcategories.map((sub) => ({
      ...sub,
      chartCount: countMap.get(sub.id) || 0,
    })),
    totalCharts: category.subcategories.reduce(
      (sum, sub) => sum + (countMap.get(sub.id) || 0),
      0
    ),
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Size Guide</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Find the right size across all our product categories.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categoriesWithCounts.map((category) => (
          <div
            key={category.id}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
          >
            <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {category.name}
                </h2>
                <span className="text-sm text-zinc-500">
                  {category.totalCharts} {category.totalCharts === 1 ? "chart" : "charts"}
                </span>
              </div>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {category.subcategories
                .filter((sub) => sub.chartCount > 0)
                .map((subcategory) => (
                  <Link
                    key={subcategory.id}
                    href={`/size-guide/${category.slug}/${subcategory.slug}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div>
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">
                        {subcategory.name}
                      </span>
                      <span className="ml-2 text-sm text-zinc-500">
                        ({subcategory.chartCount})
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                  </Link>
                ))}

              {category.subcategories.filter((sub) => sub.chartCount > 0).length === 0 && (
                <div className="px-5 py-4 text-sm text-zinc-500 italic">
                  No size charts available yet
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Unit preference note */}
      <div className="mt-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <strong>Tip:</strong> All measurements are available in both inches and centimeters.
          Use the unit toggle on any size chart to switch between units.
        </p>
      </div>
    </div>
  );
}
