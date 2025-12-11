"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface MeasurementInstruction {
	id: string;
	key: string;
	name: string;
	instruction: string;
	sortOrder: number;
	createdAt: string;
	updatedAt: string;
	_count?: { sizeCharts: number };
}

export function useMeasurementInstructions() {
	return useQuery<MeasurementInstruction[]>({
		queryKey: ["measurement-instructions"],
		queryFn: async () => {
			const response = await fetch("/api/measurement-instructions");
			if (!response.ok) throw new Error("Failed to fetch measurement instructions");
			return response.json();
		},
	});
}

export function useMeasurementInstruction(id: string) {
	return useQuery<MeasurementInstruction>({
		queryKey: ["measurement-instructions", id],
		queryFn: async () => {
			const response = await fetch(`/api/measurement-instructions/${id}`);
			if (!response.ok) throw new Error("Failed to fetch measurement instruction");
			return response.json();
		},
		enabled: !!id,
	});
}

export function useCreateMeasurementInstruction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: { key: string; name: string; instruction: string; sortOrder?: number }) => {
			const response = await fetch("/api/measurement-instructions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to create measurement instruction");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["measurement-instructions"] });
		},
	});
}

export function useUpdateMeasurementInstruction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: { key?: string; name?: string; instruction?: string; sortOrder?: number };
		}) => {
			const response = await fetch(`/api/measurement-instructions/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to update measurement instruction");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["measurement-instructions"] });
		},
	});
}

export function useDeleteMeasurementInstruction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(`/api/measurement-instructions/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete measurement instruction");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["measurement-instructions"] });
		},
	});
}
