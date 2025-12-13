"use client";

import { Suspense, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Button,
  Checkbox,
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
import { Plus, Search, Trash2, Copy, Eye, EyeOff, Pencil, ChevronLeft, ChevronRight, Download, Upload } from "lucide-react";
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
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<"create" | "upsert" | "skip">("create");
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    summary: { created: number; updated: number; skipped: number; errors: number };
  } | null>(null);

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

  const handleExport = () => {
    const url = new URL("/api/size-charts/export", window.location.origin);
    if (selectedCategory) url.searchParams.set("category", categories?.find(c => c.id === selectedCategory)?.slug || "");
    if (selectedSubcategory) {
      const sub = categories?.find(c => c.id === selectedCategory)?.subcategories.find(s => s.id === selectedSubcategory);
      if (sub) url.searchParams.set("subcategory", sub.slug);
    }
    window.location.href = url.toString();
  };

  const handleImport = async () => {
    if (!importFile) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const content = await importFile.text();
      const data = JSON.parse(content);

      const response = await fetch(`/api/size-charts/import?mode=${importMode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setImportResult(result);
        if (result.success) {
          addToast(`Imported: ${result.summary.created} created, ${result.summary.updated} updated`, "success");
          refetch();
        } else {
          addToast(`Import completed with ${result.summary.errors} error(s)`, "error");
        }
      } else {
        addToast(result.error || "Import failed", "error");
      }
    } catch (error) {
      addToast(`Invalid JSON file: ${error instanceof Error ? error.message : "Unknown error"}`, "error");
    } finally {
      setIsImporting(false);
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Link href="/admin/size-charts/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Size Chart
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search charts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
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
                    <Checkbox
                      checked={data.data.length > 0 && selectedIds.size === data.data.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
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
                        <Checkbox
                          checked={selectedIds.has(chart.id)}
                          onCheckedChange={() => handleSelect(chart.id)}
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
                        {chart.subcategories.length > 0
                          ? `${chart.subcategories[0].subcategory.category.name} → ${chart.subcategories[0].subcategory.name}${chart.subcategories.length > 1 ? ` +${chart.subcategories.length - 1}` : ""}`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={chart.isPublished ? "default" : "secondary"}>
                          {chart.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(chart.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
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

      <Dialog open={importDialogOpen} onOpenChange={(open) => {
        setImportDialogOpen(open);
        if (!open) {
          setImportFile(null);
          setImportResult(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Size Charts</DialogTitle>
            <DialogDescription>
              Upload a JSON file exported from this system. Choose how to handle existing charts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">File</label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="mt-1.5 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Import Mode</label>
              <SimpleSelect
                options={[
                  { value: "create", label: "Create only (skip existing)" },
                  { value: "upsert", label: "Update existing, create new" },
                  { value: "skip", label: "Skip existing charts" },
                ]}
                value={importMode}
                onChange={(e) => setImportMode(e.target.value as "create" | "upsert" | "skip")}
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {importMode === "create" && "Fails if a chart with the same slug already exists."}
                {importMode === "upsert" && "Updates existing charts with matching slugs."}
                {importMode === "skip" && "Skips charts that already exist, creates new ones."}
              </p>
            </div>

            {importResult && (
              <div className={`rounded-lg p-3 text-sm ${importResult.success ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300" : "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"}`}>
                <p className="font-medium mb-1">
                  {importResult.success ? "Import Complete" : "Import Completed with Errors"}
                </p>
                <ul className="text-xs space-y-0.5">
                  {importResult.summary.created > 0 && <li>{importResult.summary.created} created</li>}
                  {importResult.summary.updated > 0 && <li>{importResult.summary.updated} updated</li>}
                  {importResult.summary.skipped > 0 && <li>{importResult.summary.skipped} skipped</li>}
                  {importResult.summary.errors > 0 && <li>{importResult.summary.errors} errors</li>}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setImportDialogOpen(false);
                setImportFile(null);
                setImportResult(null);
              }}
            >
              {importResult ? "Close" : "Cancel"}
            </Button>
            {!importResult && (
              <Button
                disabled={!importFile || isImporting}
                onClick={handleImport}
              >
                {isImporting ? "Importing..." : "Import"}
              </Button>
            )}
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
