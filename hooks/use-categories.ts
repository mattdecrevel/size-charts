"use client";

import { useQuery } from "@tanstack/react-query";
import type { CategoryTree } from "@/types";

async function fetchCategories(): Promise<CategoryTree[]> {
  const response = await fetch("/api/size-charts/categories");
  if (!response.ok) throw new Error("Failed to fetch categories");
  return response.json();
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
