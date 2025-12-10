"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SizeChartFilters } from "@/lib/validations";
import type { SizeChartSummary, SizeChartFull, PaginatedResponse } from "@/types";

async function fetchSizeCharts(filters: SizeChartFilters): Promise<PaginatedResponse<SizeChartSummary>> {
  const params = new URLSearchParams();
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.subcategoryId) params.set("subcategoryId", filters.subcategoryId);
  if (filters.search) params.set("search", filters.search);
  if (filters.isPublished !== undefined) params.set("isPublished", String(filters.isPublished));
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const response = await fetch(`/api/size-charts?${params}`);
  if (!response.ok) throw new Error("Failed to fetch size charts");
  return response.json();
}

async function fetchSizeChart(id: string): Promise<SizeChartFull> {
  const response = await fetch(`/api/size-charts/${id}`);
  if (!response.ok) throw new Error("Failed to fetch size chart");
  return response.json();
}

async function deleteSizeChart(id: string): Promise<void> {
  const response = await fetch(`/api/size-charts/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete size chart");
}

async function duplicateSizeChart(id: string): Promise<SizeChartFull> {
  const response = await fetch("/api/size-charts/duplicate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) throw new Error("Failed to duplicate size chart");
  return response.json();
}

async function togglePublish(id: string, isPublished: boolean): Promise<SizeChartFull> {
  const response = await fetch(`/api/size-charts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isPublished }),
  });
  if (!response.ok) throw new Error("Failed to update size chart");
  return response.json();
}

async function bulkOperation(operation: "delete" | "publish" | "unpublish", ids: string[]): Promise<void> {
  const response = await fetch("/api/size-charts/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operation, ids }),
  });
  if (!response.ok) throw new Error("Failed to perform bulk operation");
}

export function useSizeCharts(filters: SizeChartFilters) {
  return useQuery({
    queryKey: ["size-charts", filters],
    queryFn: () => fetchSizeCharts(filters),
  });
}

export function useSizeChart(id: string) {
  return useQuery({
    queryKey: ["size-chart", id],
    queryFn: () => fetchSizeChart(id),
    enabled: !!id,
  });
}

export function useDeleteSizeChart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSizeChart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["size-charts"] });
    },
  });
}

export function useDuplicateSizeChart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateSizeChart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["size-charts"] });
    },
  });
}

export function useTogglePublish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      togglePublish(id, isPublished),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["size-charts"] });
      queryClient.invalidateQueries({ queryKey: ["size-chart", id] });
    },
  });
}

export function useBulkOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ operation, ids }: { operation: "delete" | "publish" | "unpublish"; ids: string[] }) =>
      bulkOperation(operation, ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["size-charts"] });
    },
  });
}
