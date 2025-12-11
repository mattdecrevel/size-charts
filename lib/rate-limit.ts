/**
 * Simple in-memory rate limiter
 *
 * For production with multiple instances, consider using Redis-based rate limiting.
 * This implementation works well for single-instance deployments.
 */

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

// In-memory store for rate limit tracking
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
let cleanupInterval: NodeJS.Timeout | null = null;

function startCleanup() {
	if (cleanupInterval) return;
	cleanupInterval = setInterval(() => {
		const now = Date.now();
		for (const [key, entry] of rateLimitStore.entries()) {
			if (now > entry.resetAt) {
				rateLimitStore.delete(key);
			}
		}
	}, 60000); // Clean up every minute
}

export interface RateLimitConfig {
	/** Maximum number of requests allowed in the window */
	limit: number;
	/** Window size in seconds */
	windowSeconds: number;
}

export interface RateLimitResult {
	/** Whether the request is allowed */
	allowed: boolean;
	/** Current request count */
	current: number;
	/** Maximum allowed requests */
	limit: number;
	/** Seconds until the rate limit resets */
	resetInSeconds: number;
	/** Remaining requests in this window */
	remaining: number;
}

/**
 * Default rate limit configurations
 */
export const RATE_LIMITS = {
	// Standard API read operations
	api: {
		limit: parseInt(process.env.RATE_LIMIT_PER_MINUTE || "100"),
		windowSeconds: 60,
	},
	// Write operations (more restrictive)
	apiWrite: {
		limit: parseInt(process.env.RATE_LIMIT_WRITE_PER_MINUTE || "30"),
		windowSeconds: 60,
	},
	// Auth attempts (very restrictive to prevent brute force)
	auth: {
		limit: 5,
		windowSeconds: 300, // 5 minutes
	},
} as const;

/**
 * Check rate limit for a given identifier
 *
 * @param identifier - Unique identifier (e.g., API key, IP address)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
	identifier: string,
	config: RateLimitConfig
): RateLimitResult {
	startCleanup();

	const now = Date.now();
	const windowMs = config.windowSeconds * 1000;
	const key = `${identifier}:${config.windowSeconds}`;

	let entry = rateLimitStore.get(key);

	// Create new entry if doesn't exist or has expired
	if (!entry || now > entry.resetAt) {
		entry = {
			count: 0,
			resetAt: now + windowMs,
		};
	}

	// Increment count
	entry.count++;
	rateLimitStore.set(key, entry);

	const resetInSeconds = Math.ceil((entry.resetAt - now) / 1000);
	const remaining = Math.max(0, config.limit - entry.count);

	return {
		allowed: entry.count <= config.limit,
		current: entry.count,
		limit: config.limit,
		resetInSeconds,
		remaining,
	};
}

/**
 * Get rate limit headers for HTTP response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
	return {
		"X-RateLimit-Limit": result.limit.toString(),
		"X-RateLimit-Remaining": result.remaining.toString(),
		"X-RateLimit-Reset": result.resetInSeconds.toString(),
	};
}

/**
 * Check if rate limiting is enabled
 */
export function isRateLimitEnabled(): boolean {
	// Rate limiting is enabled by default, can be disabled with env var
	return process.env.RATE_LIMIT_DISABLED !== "true";
}
