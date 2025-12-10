"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, InputWithLabel, SelectWithLabel } from "@/components/ui";
import { SizeChartEditor, type EditorState } from "@/components/admin/size-chart-editor";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, Save, Eye } from "lucide-react";

const initialState: EditorState = {
  name: "",
  description: "",
  subcategoryId: "",
  isPublished: false,
  columns: [
    { name: "Size", columnType: "SIZE_LABEL", unit: "NONE", displayOrder: 0 },
    { name: "Waist", columnType: "MEASUREMENT", unit: "INCHES", displayOrder: 1 },
    { name: "Hip", columnType: "MEASUREMENT", unit: "INCHES", displayOrder: 2 },
  ],
  rows: [],
};

export default function NewSizeChartPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const [state, setState] = useState<EditorState>(initialState);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customSlug, setCustomSlug] = useState("");

  const subcategories = selectedCategory
    ? categories?.find((c) => c.id === selectedCategory)?.subcategories || []
    : [];

  const handleSave = async (publish = false) => {
    if (!state.name.trim()) {
      addToast("Please enter a name for the size chart", "error");
      return;
    }

    if (!state.subcategoryId) {
      addToast("Please select a category and subcategory", "error");
      return;
    }

    if (state.columns.length === 0) {
      addToast("Please add at least one column", "error");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/size-charts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.name,
          slug: customSlug || undefined,
          description: state.description || undefined,
          subcategoryId: state.subcategoryId,
          columns: state.columns.map((col, index) => ({
            name: col.name,
            columnType: col.columnType,
            unit: col.unit,
            displayOrder: index,
          })),
          rows: state.rows.map((row, rowIndex) => ({
            displayOrder: rowIndex,
            cells: row.cells.map((cell, cellIndex) => ({
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
        throw new Error(error.error || "Failed to create size chart");
      }

      const chart = await response.json();

      if (publish) {
        await fetch(`/api/size-charts/${chart.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublished: true }),
        });
      }

      addToast("Size chart created successfully", "success");
      router.push(`/admin/size-charts/${chart.id}`);
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Failed to create size chart", "error");
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-2xl font-bold">
            New Size Chart
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
              <Save className="h-4 w-4" />
              Save as Draft
            </Button>
            <Button onClick={() => handleSave(true)} disabled={saving}>
              <Eye className="h-4 w-4" />
              Save & Publish
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
              onChange={(e) => setState({ ...state, name: e.target.value })}
              placeholder="e.g., Regular Fit, Contour Fit"
            />
            <InputWithLabel
              label="Chart ID (URL slug, optional)"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              placeholder="e.g., regular-fit (auto-generated if empty)"
            />
            <div className="sm:col-span-2">
              <InputWithLabel
                label="Description (optional)"
                value={state.description}
                onChange={(e) => setState({ ...state, description: e.target.value })}
                placeholder="Brief description of this size chart"
              />
            </div>
            <SelectWithLabel
              label="Category"
              options={[
                { value: "", label: "Select category..." },
                ...(categories?.map((c) => ({ value: c.id, label: c.name })) || []),
              ]}
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setState({ ...state, subcategoryId: "" });
              }}
              disabled={categoriesLoading}
            />
            <SelectWithLabel
              label="Subcategory"
              options={[
                { value: "", label: "Select subcategory..." },
                ...subcategories.map((s) => ({ value: s.id, label: s.name })),
              ]}
              value={state.subcategoryId}
              onChange={(e) => setState({ ...state, subcategoryId: e.target.value })}
              disabled={!selectedCategory}
            />
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
          <SizeChartEditor state={state} onChange={setState} />
        </div>
      </div>
    </div>
  );
}
