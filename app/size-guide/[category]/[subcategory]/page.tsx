import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ChevronRight } from "lucide-react";

interface PageProps {
  params: Promise<{ category: string; subcategory: string }>;
}

export default async function SubcategoryPage({ params }: PageProps) {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;

  const subcategory = await db.subcategory.findFirst({
    where: {
      slug: subcategorySlug,
      category: { slug: categorySlug },
    },
    include: {
      category: true,
      sizeCharts: {
        where: { isPublished: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!subcategory) {
    notFound();
  }

  // If only one chart, redirect directly to it
  if (subcategory.sizeCharts.length === 1) {
    redirect(`/size-guide/${categorySlug}/${subcategorySlug}/${subcategory.sizeCharts[0].slug}`);
  }

  return (
    <div>
      <nav className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/size-guide" className="hover:text-zinc-900 dark:hover:text-zinc-50">
          Size Guide
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/size-guide/${categorySlug}`}
          className="hover:text-zinc-900 dark:hover:text-zinc-50"
        >
          {subcategory.category.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-zinc-900 dark:text-zinc-50">{subcategory.name}</span>
      </nav>

      <h1 className="mb-8 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
        {subcategory.name} Size Charts
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subcategory.sizeCharts.map((chart) => (
          <Link
            key={chart.id}
            href={`/size-guide/${categorySlug}/${subcategorySlug}/${chart.slug}`}
            className="rounded-xl border border-zinc-200 bg-white p-6 hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {chart.name}
            </h2>
            {chart.description && (
              <p className="text-sm text-zinc-500">{chart.description}</p>
            )}
          </Link>
        ))}
      </div>

      {subcategory.sizeCharts.length === 0 && (
        <p className="text-center text-zinc-500">No size charts available yet.</p>
      )}
    </div>
  );
}
