"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Input,
  Skeleton,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import {
  LayoutTemplate,
  Search,
  Shirt,
  Users,
  Footprints,
  Watch,
  ChevronRight,
  X,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Template {
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

type CategoryFilter = "all" | "apparel" | "youth" | "footwear" | "accessories";

const categoryIcons: Record<CategoryFilter, React.ReactNode> = {
  all: <LayoutTemplate className="h-4 w-4" />,
  apparel: <Shirt className="h-4 w-4" />,
  youth: <Users className="h-4 w-4" />,
  footwear: <Footprints className="h-4 w-4" />,
  accessories: <Watch className="h-4 w-4" />,
};

const categoryLabels: Record<CategoryFilter, string> = {
  all: "All Templates",
  apparel: "Apparel",
  youth: "Youth",
  footwear: "Footwear",
  accessories: "Accessories",
};

export default function TemplatesPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>();
  const [isApplying, setIsApplying] = useState(false);

  const { data, isLoading } = useQuery<{
    templates: Template[];
    categoryCounts: Record<string, number>;
  }>({
    queryKey: ["templates"],
    queryFn: async () => {
      const res = await fetch("/api/templates?includeCounts=true");
      if (!res.ok) throw new Error("Failed to fetch templates");
      return res.json();
    },
  });

  const templates = data?.templates || [];
  const categoryCounts = data?.categoryCounts || {};

  const filteredTemplates = templates.filter((t) => {
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const formatCellValue = (value: unknown): string => {
    if (typeof value === "string") return value;
    if (typeof value === "object" && value !== null) {
      if ("min" in value && "max" in value) {
        return `${(value as { min: number; max: number }).min}-${(value as { min: number; max: number }).max}"`;
      }
      if ("value" in value) {
        return `${(value as { value: number }).value}"`;
      }
    }
    return String(value);
  };

  const getPreviewRows = () => {
    if (!selectedTemplate) return [];
    if (selectedVariant && selectedTemplate.variants?.[selectedVariant]) {
      return selectedTemplate.variants[selectedVariant].rows.slice(0, 4);
    }
    return selectedTemplate.rows.slice(0, 4);
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;

    setIsApplying(true);
    try {
      const response = await fetch(`/api/templates/${selectedTemplate.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantKey: selectedVariant }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to apply template");
      }

      const { sizeChart } = await response.json();
      addToast("Size chart created from template", "success");
      router.push(`/admin/size-charts/${sizeChart.id}`);
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Failed to apply template", "error");
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-muted-foreground">
            Browse and use pre-built size chart templates
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-muted-foreground">
            Browse and use pre-built size chart templates
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar - Category filter */}
        <div className="hidden md:block w-48 flex-shrink-0 space-y-1">
          {(Object.keys(categoryLabels) as CategoryFilter[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              {categoryIcons[cat]}
              <span className="flex-1 text-left">{categoryLabels[cat]}</span>
              {cat !== "all" && categoryCounts[cat] !== undefined && (
                <span className="text-xs opacity-70">{categoryCounts[cat]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Mobile category filter */}
          <div className="flex md:hidden gap-2 mb-4 overflow-x-auto pb-2">
            {(Object.keys(categoryLabels) as CategoryFilter[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors",
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                {categoryIcons[cat]}
                <span>{categoryLabels[cat]}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Template list or detail view */}
          {selectedTemplate ? (
            <div className="space-y-4">
              {/* Back button */}
              <button
                onClick={() => setSelectedTemplate(null)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
                Back to templates
              </button>

              {/* Template detail */}
              <Card>
                <CardHeader>
                  <CardTitle>{selectedTemplate.name}</CardTitle>
                  <CardDescription>{selectedTemplate.description}</CardDescription>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedTemplate.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Variant selector */}
                  {selectedTemplate.variants && Object.keys(selectedTemplate.variants).length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Select Variant:</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={selectedVariant === undefined ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedVariant(undefined)}
                        >
                          Default
                        </Button>
                        {Object.entries(selectedTemplate.variants).map(([key, variant]) => (
                          <Button
                            key={key}
                            variant={selectedVariant === key ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedVariant(key)}
                          >
                            {variant.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preview table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {selectedTemplate.columns.map((col) => (
                            <TableHead key={col.name} className="text-xs">
                              {col.name}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getPreviewRows().map((row, idx) => (
                          <TableRow key={idx}>
                            {selectedTemplate.columns.map((col) => (
                              <TableCell key={col.name} className="text-xs py-2">
                                {formatCellValue(row[col.name])}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {((selectedVariant ? selectedTemplate.variants?.[selectedVariant]?.rows.length : selectedTemplate.rows.length) || 0) > 4 && (
                      <p className="text-xs text-muted-foreground text-center py-2 border-t">
                        + {((selectedVariant ? selectedTemplate.variants?.[selectedVariant]?.rows.length : selectedTemplate.rows.length) || 0) - 4} more rows
                      </p>
                    )}
                  </div>

                  {/* Template info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Columns</p>
                      <p className="font-medium">{selectedTemplate.columns.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rows</p>
                      <p className="font-medium">
                        {selectedVariant
                          ? selectedTemplate.variants?.[selectedVariant]?.rows.length
                          : selectedTemplate.rows.length}
                      </p>
                    </div>
                    {selectedTemplate.measurementInstructions.length > 0 && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Measurement Instructions</p>
                        <p className="font-medium capitalize">
                          {selectedTemplate.measurementInstructions.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Use template button */}
                  <Button
                    onClick={handleApplyTemplate}
                    disabled={isApplying}
                    className="w-full"
                  >
                    {isApplying ? (
                      "Creating..."
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Create Size Chart from Template
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer transition-colors hover:border-primary"
                  onClick={() => {
                    setSelectedTemplate(template);
                    setSelectedVariant(undefined);
                  }}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                    <CardDescription className="text-xs line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span>{template.columns.length} columns</span>
                      <span>-</span>
                      <span>{template.rows.length} sizes</span>
                      {template.variants && (
                        <>
                          <span>-</span>
                          <span>{Object.keys(template.variants).length} variants</span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredTemplates.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No templates found matching your criteria.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
