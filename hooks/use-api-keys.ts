"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface ApiKey {
	id: string;
	name: string;
	keyPrefix: string;
	scopes: string[];
	isActive: boolean;
	lastUsedAt: string | null;
	expiresAt: string | null;
	createdAt: string;
}

export interface CreateApiKeyInput {
	name: string;
	scopes?: string[];
	expiresAt?: string;
}

export interface UpdateApiKeyInput {
	id: string;
	name?: string;
	scopes?: string[];
	isActive?: boolean;
	expiresAt?: string | null;
}

export interface CreateApiKeyResponse extends ApiKey {
	key: string; // Raw key, only returned on creation
	message: string;
}

export function useApiKeys() {
	return useQuery<ApiKey[]>({
		queryKey: ["api-keys"],
		queryFn: async () => {
			const response = await fetch("/api/api-keys");
			if (!response.ok) {
				throw new Error("Failed to fetch API keys");
			}
			return response.json();
		},
	});
}

export function useCreateApiKey() {
	const queryClient = useQueryClient();

	return useMutation<CreateApiKeyResponse, Error, CreateApiKeyInput>({
		mutationFn: async (data) => {
			const response = await fetch("/api/api-keys", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to create API key");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["api-keys"] });
		},
	});
}

export function useUpdateApiKey() {
	const queryClient = useQueryClient();

	return useMutation<ApiKey, Error, UpdateApiKeyInput>({
		mutationFn: async ({ id, ...data }) => {
			const response = await fetch(`/api/api-keys/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to update API key");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["api-keys"] });
		},
	});
}

export function useDeleteApiKey() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, string>({
		mutationFn: async (id) => {
			const response = await fetch(`/api/api-keys/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete API key");
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["api-keys"] });
		},
	});
}
