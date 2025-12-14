"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, InputWithLabel, SelectWithLabel } from "@/components/ui";
import { SizeChartEditor, MeasurementInstructionsSelector, type EditorState, type EditorColumn, type EditorRow, type EditorCell } from "@/components/admin/size-chart-editor";
import { TemplatePicker } from "@/components/admin/template-picker";
import { useCategories } from "@/hooks/use-categories";
import { useLabels } from "@/hooks/use-labels";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, Save, Eye, LayoutTemplate, Plus } from "lucide-react";

const initialState: EditorState = {
  name: "",
  description: "",
  subcategoryIds: [],
  measurementInstructionIds: [],
  isPublished: false,
  columns: [
    { name: "Size", columnType: "SIZE_LABEL", displayOrder: 0 },
    { name: "Waist", columnType: "MEASUREMENT", displayOrder: 1 },
    { name: "Hip", columnType: "MEASUREMENT", displayOrder: 2 },
  ],
  rows: [],
};

// Map template column types to editor column types
function mapTemplateColumnType(type: string): EditorColumn["columnType"] {
  switch (type) {
    case "SIZE_LABEL":
      return "SIZE_LABEL";
    case "SHOE_SIZE":
      return "SHOE_SIZE";
    case "MEASUREMENT":
      return "MEASUREMENT";
    case "BAND_SIZE":
      return "BAND_SIZE";
    case "CUP_SIZE":
      return "CUP_SIZE";
    case "TEXT":
    default:
      return "TEXT";
  }
}

// Helper to convert inches to cm
function inToCm(inches: number): number {
  return Math.round(inches * 2.54 * 10) / 10;
}

// Template type for type safety
interface TemplateData {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  suggestedCategories: string[];
  measurementInstructions: string[];
  columns: Array<{ name: string; type: string }>;
  rows: Array<Record<string, unknown>>;
  variants?: Record<string, { name: string; description: string; rows: Array<Record<string, unknown>> }>;
}

export default function NewSizeChartPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: labels } = useLabels();

  const [state, setState] = useState<EditorState>(initialState);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [fromTemplate, setFromTemplate] = useState(false);

  // Handle template selection
  const handleTemplateSelect = (template: TemplateData, variantKey?: string) => {
    // Get the rows to use
    const templateRows = variantKey && template.variants?.[variantKey]
      ? template.variants[variantKey].rows
      : template.rows;

    // Map template columns to editor columns
    const columns: EditorColumn[] = template.columns.map((col, idx) => ({
      name: col.name,
      columnType: mapTemplateColumnType(col.type),
      displayOrder: idx,
    }));

    // Map template rows to editor rows with cells
    const rows: EditorRow[] = templateRows.map((templateRow, rowIdx) => {
      const cells: EditorCell[] = columns.map((col, colIdx) => {
        const cellValue = templateRow[col.name];

        // Initialize cell with all required properties
        const cell: EditorCell = {
          columnIndex: colIdx,
          valueInches: null,
          valueCm: null,
          valueText: null,
          valueMinInches: null,
          valueMaxInches: null,
          valueMinCm: null,
          valueMaxCm: null,
          labelId: null,
        };

        if (typeof cellValue === "string") {
          cell.valueText = cellValue;
        } else if (typeof cellValue === "object" && cellValue !== null) {
          if ("min" in cellValue && "max" in cellValue) {
            const range = cellValue as { min: number; max: number };
            cell.valueMinInches = range.min;
            cell.valueMaxInches = range.max;
            cell.valueMinCm = inToCm(range.min);
            cell.valueMaxCm = inToCm(range.max);
          } else if ("value" in cellValue) {
            const single = cellValue as { value: number };
            cell.valueInches = single.value;
            cell.valueCm = inToCm(single.value);
          }
        }

        return cell;
      });

      return { displayOrder: rowIdx, cells };
    });

    // Set the state with template data
    setState({
      name: template.name + (variantKey ? ` (${variantKey})` : ""),
      description: template.description,
      subcategoryIds: [],
      measurementInstructionIds: [],
      isPublished: false,
      columns,
      rows,
    });

    setFromTemplate(true);
    addToast(`Loaded template: ${template.name}`, "success");
  };

  // Reset to blank state
  const handleStartBlank = () => {
    setState(initialState);
    setFromTemplate(false);
    setSelectedCategory("");
    setCustomSlug("");
  };

  const subcategories = selectedCategory
    ? categories?.find((c) => c.id === selectedCategory)?.subcategories || []
    : [];

  const handleSave = async (publish = false) => {
    if (!state.name.trim()) {
      addToast("Please enter a name for the size chart", "error");
      return;
    }

    if (state.subcategoryIds.length === 0) {
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
          subcategoryIds: state.subcategoryIds,
          columns: state.columns.map((col, index) => ({
            name: col.name,
            columnType: col.columnType,
            displayOrder: index,
          })),
          rows: state.rows.map((row, rowIndex) => ({
            displayOrder: rowIndex,
            cells: row.cells.map((cell, cellIndex) => ({
              columnIndex: cellIndex,
              valueInches: cell.valueInches,
              valueCm: cell.valueCm,
              valueText: cell.valueText,
              valueMinInches: cell.valueMinInches,
              valueMaxInches: cell.valueMaxInches,
              valueMinCm: cell.valueMinCm,
              valueMaxCm: cell.valueMaxCm,
              labelId: cell.labelId,
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
          <div>
            <h1 className="text-2xl font-bold">
              New Size Chart
            </h1>
            {fromTemplate && (
              <p className="text-sm text-muted-foreground mt-1">
                Created from template - customize as needed
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <TemplatePicker
              onSelect={handleTemplateSelect}
              trigger={
                <Button variant="outline">
                  <LayoutTemplate className="h-4 w-4" />
                  {fromTemplate ? "Change Template" : "Start from Template"}
                </Button>
              }
            />
            {fromTemplate && (
              <Button variant="ghost" onClick={handleStartBlank}>
                <Plus className="h-4 w-4" />
                Start Blank
              </Button>
            )}
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
                setState({ ...state, subcategoryIds: [] });
              }}
              disabled={categoriesLoading}
            />
            <SelectWithLabel
              label="Subcategory"
              options={[
                { value: "", label: "Select subcategory..." },
                ...subcategories.map((s) => ({ value: s.id, label: s.name })),
              ]}
              value={state.subcategoryIds[0] || ""}
              onChange={(e) => setState({ ...state, subcategoryIds: e.target.value ? [e.target.value] : [] })}
              disabled={!selectedCategory}
            />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">
            Measurement Instructions
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Select which measurement instructions to display on this chart&apos;s public page.
          </p>
          <MeasurementInstructionsSelector
            selectedIds={state.measurementInstructionIds}
            onChange={(ids) => setState({ ...state, measurementInstructionIds: ids })}
          />
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">
            Size Chart Data
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Click on a cell to edit. Use Tab to move to the next cell, Enter to move down.
            Configure columns by clicking the settings icon in the header.
          </p>
          <SizeChartEditor state={state} onChange={setState} labels={labels} />
        </div>
      </div>
    </div>
  );
}
