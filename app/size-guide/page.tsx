import Link from "next/link";
import { db } from "@/lib/db";
import { ChevronRight } from "lucide-react";

export default async function SizeGuidePage() {
  const categories = await db.category.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      subcategories: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  // Get count of published size charts per subcategory via many-to-many
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

  // Add counts to categories
  const categoriesWithCounts = categories.map((category) => ({
    ...category,
    subcategories: category.subcategories.map((sub) => ({
      ...sub,
      _count: {
        sizeCharts: countMap.get(sub.id) || 0,
      },
    })),
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Size Guide
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Find your perfect fit with our comprehensive size charts
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categoriesWithCounts.map((category) => (
          <div
            key={category.id}
            className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {category.name}
            </h2>
            <div className="space-y-2">
              {category.subcategories
                .filter((sub) => sub._count.sizeCharts > 0)
                .map((subcategory) => (
                  <Link
                    key={subcategory.id}
                    href={`/size-guide/${category.slug}/${subcategory.slug}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <span>{subcategory.name}</span>
                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                  </Link>
                ))}
              {category.subcategories.filter((sub) => sub._count.sizeCharts > 0).length === 0 && (
                <p className="text-sm text-zinc-500 italic">No size charts available yet</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
