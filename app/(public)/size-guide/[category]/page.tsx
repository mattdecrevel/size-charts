import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ChevronRight } from "lucide-react";

interface PageProps {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: categorySlug } = await params;

  const category = await db.category.findUnique({
    where: { slug: categorySlug },
    include: {
      subcategories: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!category) {
    notFound();
  }

  // Get count of published size charts per subcategory via many-to-many
  const subcategoryCounts = await db.sizeChartSubcategory.groupBy({
    by: ["subcategoryId"],
    where: {
      subcategory: { categoryId: category.id },
      sizeChart: { isPublished: true },
    },
    _count: {
      sizeChartId: true,
    },
  });

  const countMap = new Map(
    subcategoryCounts.map((c) => [c.subcategoryId, c._count.sizeChartId])
  );

  // Add counts to subcategories
  const categoryWithCounts = {
    ...category,
    subcategories: category.subcategories.map((sub) => ({
      ...sub,
      _count: {
        sizeCharts: countMap.get(sub.id) || 0,
      },
    })),
  };

  return (
    <div>
      <nav className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/size-guide" className="hover:text-zinc-900 dark:hover:text-zinc-50">
          Size Guide
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-zinc-900 dark:text-zinc-50">{categoryWithCounts.name}</span>
      </nav>

      <h1 className="mb-8 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
        {categoryWithCounts.name} Size Charts
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categoryWithCounts.subcategories
          .filter((sub) => sub._count.sizeCharts > 0)
          .map((subcategory) => (
            <Link
              key={subcategory.id}
              href={`/size-guide/${categoryWithCounts.slug}/${subcategory.slug}`}
              className="rounded-xl border border-zinc-200 bg-white p-6 hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {subcategory.name}
              </h2>
              <p className="text-sm text-zinc-500">
                {subcategory._count.sizeCharts} size chart{subcategory._count.sizeCharts !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
      </div>

      {categoryWithCounts.subcategories.filter((sub) => sub._count.sizeCharts > 0).length === 0 && (
        <p className="text-center text-zinc-500">No size charts available for this category yet.</p>
      )}
    </div>
  );
}
