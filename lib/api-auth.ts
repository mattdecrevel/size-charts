import { db } from "@/lib/db";
import { createHash, randomBytes } from "crypto";

// API key format: sc_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx (32 chars after prefix)
const API_KEY_PREFIX = "sc_live_";
const API_KEY_LENGTH = 32;

/**
 * Generate a new API key
 * Returns both the raw key (to show user once) and the hash (to store)
 */
export function generateApiKey(): { raw: string; hash: string; prefix: string } {
	const randomPart = randomBytes(API_KEY_LENGTH).toString("base64url").slice(0, API_KEY_LENGTH);
	const raw = `${API_KEY_PREFIX}${randomPart}`;
	const hash = hashApiKey(raw);
	const prefix = raw.slice(0, 12); // "sc_live_xxxx"
	return { raw, hash, prefix };
}

/**
 * Hash an API key for storage
 */
export function hashApiKey(key: string): string {
	return createHash("sha256").update(key).digest("hex");
}

/**
 * Available API scopes
 */
export const API_SCOPES = {
	"read:size-charts": "Read size charts",
	"read:categories": "Read categories",
	"read:labels": "Read labels",
	"read:instructions": "Read measurement instructions",
} as const;

export type ApiScope = keyof typeof API_SCOPES;

export const DEFAULT_SCOPES: ApiScope[] = [
	"read:size-charts",
	"read:categories",
	"read:labels",
	"read:instructions",
];

/**
 * Validate an API key and return the key record if valid
 */
export async function validateApiKey(rawKey: string | null): Promise<{
	valid: boolean;
	key?: {
		id: string;
		name: string;
		scopes: string[];
	};
	error?: string;
}> {
	if (!rawKey) {
		return { valid: false, error: "Missing API key" };
	}

	// Check format
	if (!rawKey.startsWith(API_KEY_PREFIX)) {
		return { valid: false, error: "Invalid API key format" };
	}

	const hash = hashApiKey(rawKey);

	try {
		const apiKey = await db.apiKey.findUnique({
			where: { key: hash },
			select: {
				id: true,
				name: true,
				scopes: true,
				isActive: true,
				expiresAt: true,
			},
		});

		if (!apiKey) {
			return { valid: false, error: "Invalid API key" };
		}

		if (!apiKey.isActive) {
			return { valid: false, error: "API key is inactive" };
		}

		if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
			return { valid: false, error: "API key has expired" };
		}

		// Update last used timestamp (fire and forget)
		db.apiKey.update({
			where: { id: apiKey.id },
			data: { lastUsedAt: new Date() },
		}).catch(() => {});

		return {
			valid: true,
			key: {
				id: apiKey.id,
				name: apiKey.name,
				scopes: apiKey.scopes,
			},
		};
	} catch (error) {
		console.error("API key validation error:", error);
		return { valid: false, error: "Failed to validate API key" };
	}
}

/**
 * Check if a key has a specific scope
 */
export function hasScope(scopes: string[], requiredScope: ApiScope): boolean {
	return scopes.includes(requiredScope);
}

/**
 * Extract API key from request headers
 * Supports: Authorization: Bearer <key> or X-API-Key: <key>
 */
export function extractApiKey(request: Request): string | null {
	const authHeader = request.headers.get("Authorization");
	if (authHeader?.startsWith("Bearer ")) {
		return authHeader.slice(7);
	}

	return request.headers.get("X-API-Key");
}
