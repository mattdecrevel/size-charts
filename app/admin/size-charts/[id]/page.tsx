"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, InputWithLabel, Badge } from "@/components/ui";
import { SizeChartEditor, type EditorState } from "@/components/admin/size-chart-editor";
import { useSizeChart } from "@/hooks/use-size-charts";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Eye, EyeOff, ExternalLink } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditSizeChartPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { addToast } = useToast();

  const { data: chart, isLoading } = useSizeChart(id);
  const { data: categories } = useCategories();

  const [state, setState] = useState<EditorState | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [slug, setSlug] = useState("");

  useEffect(() => {
    if (chart && !state) {
      setState({
        name: chart.name,
        description: chart.description || "",
        subcategoryId: chart.subcategoryId,
        isPublished: chart.isPublished,
        columns: chart.columns.map((col) => ({
          id: col.id,
          name: col.name,
          columnType: col.columnType,
          unit: col.unit,
          displayOrder: col.displayOrder,
        })),
        rows: chart.rows.map((row) => ({
          id: row.id,
          displayOrder: row.displayOrder,
          cells: chart.columns.map((col, colIndex) => {
            const cell = row.cells.find((c) => c.columnId === col.id);
            return {
              id: cell?.id,
              columnId: col.id,
              columnIndex: colIndex,
              valueInches: cell?.valueInches ?? null,
              valueText: cell?.valueText ?? null,
              valueMinInches: cell?.valueMinInches ?? null,
              valueMaxInches: cell?.valueMaxInches ?? null,
            };
          }),
        })),
      });
      setSelectedCategory(chart.subcategory.categoryId);
      setSlug(chart.slug);
    }
  }, [chart, state]);

  const subcategories = selectedCategory
    ? categories?.find((c) => c.id === selectedCategory)?.subcategories || []
    : [];

  const handleStateChange = (newState: EditorState) => {
    setState(newState);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!state) return;

    if (!state.name.trim()) {
      addToast("Please enter a name for the size chart", "error");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/size-charts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.name,
          slug: slug,
          description: state.description || null,
          columns: state.columns.map((col, index) => ({
            id: col.id,
            name: col.name,
            columnType: col.columnType,
            unit: col.unit,
            displayOrder: index,
          })),
          rows: state.rows.map((row, rowIndex) => ({
            id: row.id,
            displayOrder: rowIndex,
            cells: row.cells.map((cell, cellIndex) => ({
              id: cell.id,
              columnId: cell.columnId,
              columnIndex: cellIndex,
              valueInches: cell.valueInches,
              valueText: cell.valueText,
              valueMinInches: cell.valueMinInches,
              valueMaxInches: cell.valueMaxInches,
            })),
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save size chart");
      }

      addToast("Size chart saved successfully", "success");
      setHasChanges(false);
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Failed to save size chart", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!state) return;

    setSaving(true);

    try {
      const response = await fetch(`/api/size-charts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !state.isPublished }),
      });

      if (!response.ok) {
        throw new Error("Failed to update publish status");
      }

      setState({ ...state, isPublished: !state.isPublished });
      addToast(state.isPublished ? "Size chart unpublished" : "Size chart published", "success");
    } catch (error) {
      addToast("Failed to update publish status", "error");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !state) {
    return (
      <div>
        <div className="mb-6">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/size-charts"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Size Charts
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              {state.name || "Untitled Size Chart"}
            </h1>
            <Badge variant={state.isPublished ? "default" : "secondary"}>
              {state.isPublished ? "Published" : "Draft"}
            </Badge>
            {hasChanges && (
              <Badge variant="outline">Unsaved changes</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {state.isPublished && chart && (
              <Link
                href={`/size-guide/${chart.subcategory.category.slug}/${chart.subcategory.slug}/${chart.slug}`}
                target="_blank"
              >
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4" />
                  View Live
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              onClick={handleTogglePublish}
              disabled={saving}
            >
              {state.isPublished ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Unpublish
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Publish
                </>
              )}
            </Button>
            <Button onClick={handleSave} disabled={saving || !hasChanges}>
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">
            Basic Information
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputWithLabel
              label="Name"
              value={state.name}
              onChange={(e) => handleStateChange({ ...state, name: e.target.value })}
              placeholder="e.g., Regular Fit, Contour Fit"
            />
            <InputWithLabel
              label="Chart ID (URL slug)"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                setHasChanges(true);
              }}
              placeholder="e.g., regular-fit"
            />
            <div className="sm:col-span-2">
              <InputWithLabel
                label="Description (optional)"
                value={state.description}
                onChange={(e) => handleStateChange({ ...state, description: e.target.value })}
                placeholder="Brief description of this size chart"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Category:</span>{" "}
              {chart?.subcategory.category.name} &rarr; {chart?.subcategory.name}
            </div>
            {slug && chart && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Public URL:</span>{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-xs">
                  /size-guide/{chart.subcategory.category.slug}/{chart.subcategory.slug}/{slug}
                </code>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">
            Size Chart Data
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Click on a cell to edit. Use Tab to move to the next cell, Enter to move down.
            Configure columns by clicking the settings icon in the header.
          </p>
          <SizeChartEditor state={state} onChange={handleStateChange} />
        </div>
      </div>
    </div>
  );
}
