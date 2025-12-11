"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SizeLabel, LabelType } from "@prisma/client";

interface UseLabelsOptions {
	type?: LabelType;
	search?: string;
}

export function useLabels(options: UseLabelsOptions = {}) {
	const params = new URLSearchParams();
	if (options.type) params.set("type", options.type);
	if (options.search) params.set("search", options.search);

	return useQuery<SizeLabel[]>({
		queryKey: ["labels", options],
		queryFn: async () => {
			const response = await fetch(`/api/labels?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch labels");
			return response.json();
		},
	});
}

export function useLabel(id: string) {
	return useQuery<SizeLabel & { _count: { cells: number } }>({
		queryKey: ["labels", id],
		queryFn: async () => {
			const response = await fetch(`/api/labels/${id}`);
			if (!response.ok) throw new Error("Failed to fetch label");
			return response.json();
		},
		enabled: !!id,
	});
}

export function useCreateLabel() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: {
			key: string;
			displayValue: string;
			labelType: LabelType;
			sortOrder?: number;
			description?: string | null;
		}) => {
			const response = await fetch("/api/labels", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to create label");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["labels"] });
		},
	});
}

export function useUpdateLabel() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			...data
		}: {
			id: string;
			key?: string;
			displayValue?: string;
			labelType?: LabelType;
			sortOrder?: number;
			description?: string | null;
		}) => {
			const response = await fetch(`/api/labels/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to update label");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["labels"] });
		},
	});
}

export function useDeleteLabel() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(`/api/labels/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete label");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["labels"] });
		},
	});
}

// Label Type Config types and hooks
export interface LabelTypeConfigData {
	labelType: string;
	displayName: string;
	description: string | null;
	isCustomized: boolean;
	id: string | null;
}

export function useLabelTypeConfigs() {
	return useQuery<LabelTypeConfigData[]>({
		queryKey: ["labelTypeConfigs"],
		queryFn: async () => {
			const response = await fetch("/api/label-types");
			if (!response.ok) throw new Error("Failed to fetch label type configs");
			return response.json();
		},
	});
}

export function useUpdateLabelTypeConfig() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: {
			labelType: string;
			displayName: string;
			description?: string | null;
		}) => {
			const response = await fetch("/api/label-types", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to update label type config");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["labelTypeConfigs"] });
		},
	});
}

export function useResetLabelTypeConfig() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (labelType: string) => {
			const response = await fetch(`/api/label-types?labelType=${labelType}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to reset label type config");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["labelTypeConfigs"] });
		},
	});
}
