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
    },
  });

  if (!subcategory) {
    notFound();
  }

  // Get published size charts for this subcategory via many-to-many
  const sizeCharts = await db.sizeChart.findMany({
    where: {
      isPublished: true,
      subcategories: {
        some: { subcategoryId: subcategory.id },
      },
    },
    orderBy: { name: "asc" },
  });

  const subcategoryWithCharts = {
    ...subcategory,
    sizeCharts,
  };

  // If only one chart, redirect directly to it
  if (subcategoryWithCharts.sizeCharts.length === 1) {
    redirect(`/size-guide/${categorySlug}/${subcategorySlug}/${subcategoryWithCharts.sizeCharts[0].slug}`);
  }

  return (
    <div>
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/size-guide" className="hover:text-foreground transition-colors">
          Size Guide
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/size-guide/${categorySlug}`}
          className="hover:text-foreground transition-colors"
        >
          {subcategoryWithCharts.category.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{subcategoryWithCharts.name}</span>
      </nav>

      <h1 className="mb-8 text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
        {subcategoryWithCharts.name} Size Charts
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subcategoryWithCharts.sizeCharts.map((chart) => (
          <Link
            key={chart.id}
            href={`/size-guide/${categorySlug}/${subcategorySlug}/${chart.slug}`}
            className="group rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:bg-primary/5 transition-colors"
          >
            <h2 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {chart.name}
            </h2>
            {chart.description && (
              <p className="text-sm text-muted-foreground">{chart.description}</p>
            )}
          </Link>
        ))}
      </div>

      {subcategoryWithCharts.sizeCharts.length === 0 && (
        <p className="text-center text-muted-foreground">No size charts available yet.</p>
      )}
    </div>
  );
}
