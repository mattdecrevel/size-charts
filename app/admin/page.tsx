import Link from "next/link";
import { db } from "@/lib/db";
import { TableProperties, FolderTree, Plus } from "lucide-react";

export default async function AdminDashboard() {
  const [sizeChartCount, categoryCount, publishedCount] = await Promise.all([
    db.sizeChart.count(),
    db.category.count(),
    db.sizeChart.count({ where: { isPublished: true } }),
  ]);

  const recentCharts = await db.sizeChart.findMany({
    take: 5,
    orderBy: { updatedAt: "desc" },
    include: {
      subcategory: {
        include: { category: true },
      },
    },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage your size charts and categories
          </p>
        </div>
        <Link
          href="/admin/size-charts/new"
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          New Size Chart
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
              <TableProperties className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Size Charts</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{sizeChartCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
              <TableProperties className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Published</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{publishedCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
              <FolderTree className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Categories</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{categoryCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Recently Updated
          </h2>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {recentCharts.length === 0 ? (
            <div className="px-6 py-8 text-center text-zinc-500">
              No size charts yet.{" "}
              <Link href="/admin/size-charts/new" className="text-blue-600 hover:underline">
                Create your first one
              </Link>
            </div>
          ) : (
            recentCharts.map((chart) => (
              <Link
                key={chart.id}
                href={`/admin/size-charts/${chart.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{chart.name}</p>
                  <p className="text-sm text-zinc-500">
                    {chart.subcategory.category.name} &rarr; {chart.subcategory.name}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      chart.isPublished
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {chart.isPublished ? "Published" : "Draft"}
                  </span>
                  <span className="text-sm text-zinc-500">
                    {new Date(chart.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
