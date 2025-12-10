"use client";

import { Suspense, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Button,
  Input,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  SimpleSelect,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
} from "@/components/ui";
import { useSizeCharts, useDeleteSizeChart, useDuplicateSizeChart, useTogglePublish, useBulkOperation } from "@/hooks/use-size-charts";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/components/ui/toast";
import { Plus, Search, Trash2, Copy, Eye, EyeOff, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import type { SizeChartSummary } from "@/types";

function SizeChartsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("categoryId") || "");
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get("subcategoryId") || "");
  const [publishedFilter, setPublishedFilter] = useState(searchParams.get("isPublished") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chartToDelete, setChartToDelete] = useState<string | null>(null);

  const { data: categories } = useCategories();
  const { data, isLoading, refetch } = useSizeCharts({
    search: search || undefined,
    categoryId: selectedCategory || undefined,
    subcategoryId: selectedSubcategory || undefined,
    isPublished: publishedFilter === "" ? undefined : publishedFilter === "true",
    page,
    limit: 20,
  });

  const deleteMutation = useDeleteSizeChart();
  const duplicateMutation = useDuplicateSizeChart();
  const togglePublishMutation = useTogglePublish();
  const bulkMutation = useBulkOperation();

  const subcategories = selectedCategory
    ? categories?.find((c) => c.id === selectedCategory)?.subcategories || []
    : [];

  const handleSearch = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      addToast("Size chart deleted successfully", "success");
      setDeleteDialogOpen(false);
      setChartToDelete(null);
    } catch {
      addToast("Failed to delete size chart", "error");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const duplicate = await duplicateMutation.mutateAsync(id);
      addToast("Size chart duplicated successfully", "success");
      router.push(`/admin/size-charts/${duplicate.id}`);
    } catch {
      addToast("Failed to duplicate size chart", "error");
    }
  };

  const handleTogglePublish = async (id: string, currentState: boolean) => {
    try {
      await togglePublishMutation.mutateAsync({ id, isPublished: !currentState });
      addToast(currentState ? "Size chart unpublished" : "Size chart published", "success");
    } catch {
      addToast("Failed to update size chart", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      await bulkMutation.mutateAsync({ operation: "delete", ids: Array.from(selectedIds) });
      addToast(`${selectedIds.size} size chart(s) deleted`, "success");
      setSelectedIds(new Set());
    } catch {
      addToast("Failed to delete size charts", "error");
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (!data) return;
    if (selectedIds.size === data.data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.data.map((c) => c.id)));
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Size Charts</h1>
          <p className="text-muted-foreground">
            Manage your size charts
          </p>
        </div>
        <Link href="/admin/size-charts/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Size Chart
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] max-w-xs">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <SimpleSelect
          options={[
            { value: "", label: "All Categories" },
            ...(categories?.map((c) => ({ value: c.id, label: c.name })) || []),
          ]}
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedSubcategory("");
            setPage(1);
          }}
          className="w-40"
        />
        {subcategories.length > 0 && (
          <SimpleSelect
            options={[
              { value: "", label: "All Subcategories" },
              ...subcategories.map((s) => ({ value: s.id, label: s.name })),
            ]}
            value={selectedSubcategory}
            onChange={(e) => {
              setSelectedSubcategory(e.target.value);
              setPage(1);
            }}
            className="w-40"
          />
        )}
        <SimpleSelect
          options={[
            { value: "", label: "All Status" },
            { value: "true", label: "Published" },
            { value: "false", label: "Draft" },
          ]}
          value={publishedFilter}
          onChange={(e) => {
            setPublishedFilter(e.target.value);
            setPage(1);
          }}
          className="w-32"
        />
        <Button variant="outline" onClick={handleSearch}>
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-muted px-4 py-2">
          <span className="text-sm">
            {selectedIds.size} selected
          </span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear Selection
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={data.data.length > 0 && selectedIds.size === data.data.length}
                      onChange={handleSelectAll}
                      className="rounded border-input"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="w-32"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No size charts found. Create your first one!
                    </TableCell>
                  </TableRow>
                ) : (
                  data.data.map((chart) => (
                    <TableRow key={chart.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(chart.id)}
                          onChange={() => handleSelect(chart.id)}
                          className="rounded border-input"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <Link
                            href={`/admin/size-charts/${chart.id}`}
                            className="font-medium hover:underline"
                          >
                            {chart.name}
                          </Link>
                          {chart.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-xs">{chart.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {chart.subcategory.category.name} &rarr; {chart.subcategory.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant={chart.isPublished ? "default" : "secondary"}>
                          {chart.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {chart._count.rows} rows &times; {chart._count.columns} cols
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => router.push(`/admin/size-charts/${chart.id}`)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleTogglePublish(chart.id, chart.isPublished)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            title={chart.isPublished ? "Unpublish" : "Publish"}
                          >
                            {chart.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDuplicate(chart.id)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            title="Duplicate"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setChartToDelete(chart.id);
                              setDeleteDialogOpen(true);
                            }}
                            className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {data.pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(data.pagination.page - 1) * data.pagination.limit + 1} to{" "}
                {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{" "}
                {data.pagination.total} results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                  disabled={page === data.pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : null}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Size Chart</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this size chart? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setChartToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => chartToDelete && handleDelete(chartToDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SizeChartsListPage() {
  return (
    <Suspense fallback={
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    }>
      <SizeChartsListContent />
    </Suspense>
  );
}
