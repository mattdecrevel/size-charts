"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input, Skeleton, Badge } from "@/components/ui";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/components/ui/toast";
import { Plus, ChevronRight, ChevronDown, FolderTree, TableProperties, FileText, ExternalLink } from "lucide-react";
import type { CategoryTree } from "@/types";
import { useQueryClient, useQuery } from "@tanstack/react-query";

interface SizeChartSummary {
  id: string;
  name: string;
  slug: string;
  isPublished: boolean;
}

interface SubcategoryWithCharts {
  id: string;
  name: string;
  slug: string;
  _count: { sizeCharts: number };
  sizeCharts?: { sizeChart: SizeChartSummary }[];
}

interface CategoryWithCharts {
  id: string;
  name: string;
  slug: string;
  subcategories: SubcategoryWithCharts[];
}

export default function CategoriesPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories with charts included
  const { data: categories, isLoading } = useQuery<CategoryWithCharts[]>({
    queryKey: ["categories", "with-charts"],
    queryFn: async () => {
      const res = await fetch("/api/size-charts/categories?includeCharts=true");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [addingSubcategoryTo, setAddingSubcategoryTo] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSubcategoryExpand = (id: string) => {
    setExpandedSubcategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddSubcategory = async (categoryId: string) => {
    if (!newSubcategoryName.trim()) {
      addToast("Please enter a subcategory name", "error");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/categories/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSubcategoryName,
          categoryId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create subcategory");
      }

      addToast("Subcategory created successfully", "success");
      setNewSubcategoryName("");
      setAddingSubcategoryTo(null);
      queryClient.invalidateQueries({ queryKey: ["categories", "with-charts"] });
    } catch {
      addToast("Failed to create subcategory", "error");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Categories</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Manage product categories and subcategories
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {categories?.map((category) => {
          const isExpanded = expandedCategories.has(category.id);

          return (
            <div
              key={category.id}
              className="rounded-lg border bg-card"
            >
              <div
                className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-accent/50"
                onClick={() => toggleExpand(category.id)}
              >
                <div className="flex items-center gap-3">
                  <ChevronRight
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                  <FolderTree className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">
                    {category.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({category.subcategories.length} subcategories)
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t">
                  {category.subcategories.length === 0 ? (
                    <div className="px-12 py-4 text-sm text-muted-foreground">
                      No subcategories yet
                    </div>
                  ) : (
                    <div className="divide-y">
                      {category.subcategories.map((subcategory) => {
                        const isSubExpanded = expandedSubcategories.has(subcategory.id);
                        const charts = subcategory.sizeCharts || [];
                        const hasCharts = charts.length > 0;

                        return (
                          <div key={subcategory.id}>
                            <div
                              className="flex items-center justify-between px-8 py-3 hover:bg-accent/50 cursor-pointer"
                              onClick={() => hasCharts && toggleSubcategoryExpand(subcategory.id)}
                            >
                              <div className="flex items-center gap-3">
                                {hasCharts ? (
                                  isSubExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )
                                ) : (
                                  <div className="w-4" />
                                )}
                                <TableProperties className="h-4 w-4 text-muted-foreground" />
                                <span>{subcategory.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {subcategory._count.sizeCharts} charts
                                </Badge>
                              </div>
                            </div>

                            {isSubExpanded && hasCharts && (
                              <div className="border-t bg-muted/30">
                                {charts.map(({ sizeChart }) => (
                                  <div
                                    key={sizeChart.id}
                                    className="flex items-center justify-between px-16 py-2 hover:bg-accent/50"
                                  >
                                    <div className="flex items-center gap-3">
                                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span className="text-sm">{sizeChart.name}</span>
                                      {sizeChart.isPublished ? (
                                        <Badge variant="default" className="text-xs">Published</Badge>
                                      ) : (
                                        <Badge variant="outline" className="text-xs">Draft</Badge>
                                      )}
                                    </div>
                                    <Link
                                      href={`/admin/size-charts/${sizeChart.id}`}
                                      className="text-xs text-primary hover:underline flex items-center gap-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Edit <ExternalLink className="h-3 w-3" />
                                    </Link>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {addingSubcategoryTo === category.id ? (
                    <div className="flex items-center gap-2 border-t px-12 py-3">
                      <Input
                        value={newSubcategoryName}
                        onChange={(e) => setNewSubcategoryName(e.target.value)}
                        placeholder="Subcategory name"
                        className="max-w-xs"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddSubcategory(category.id);
                          }
                          if (e.key === "Escape") {
                            setAddingSubcategoryTo(null);
                            setNewSubcategoryName("");
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddSubcategory(category.id)}
                        disabled={saving}
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setAddingSubcategoryTo(null);
                          setNewSubcategoryName("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="border-t px-12 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddingSubcategoryTo(category.id);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Add Subcategory
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Note: Main categories (Men's, Women's, Accessories) are pre-configured. You can add subcategories to organize your size charts.
      </p>
    </div>
  );
}
