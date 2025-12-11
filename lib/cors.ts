import { NextResponse } from "next/server";

/**
 * CORS Configuration
 *
 * Set CORS_ALLOWED_ORIGINS in your .env file:
 * - "*" for any origin (development only!)
 * - "https://example.com,https://app.example.com" for specific origins
 * - Leave empty to use default (same-origin only)
 */

// Parse allowed origins from environment
function getAllowedOrigins(): string[] {
	const origins = process.env.CORS_ALLOWED_ORIGINS || "";

	if (origins === "*") {
		return ["*"];
	}

	return origins
		.split(",")
		.map((o) => o.trim())
		.filter(Boolean);
}

// Check if origin is allowed
export function isOriginAllowed(origin: string | null): boolean {
	if (!origin) return false;

	const allowed = getAllowedOrigins();

	// Wildcard allows everything
	if (allowed.includes("*")) return true;

	// No configured origins = same-origin only (no CORS headers needed)
	if (allowed.length === 0) return false;

	return allowed.includes(origin);
}

// CORS headers to add to responses
export function getCorsHeaders(origin: string | null): HeadersInit {
	const allowed = getAllowedOrigins();

	// If no CORS configured, return empty headers
	if (allowed.length === 0) return {};

	// If wildcard, allow any origin
	if (allowed.includes("*")) {
		return {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
			"Access-Control-Max-Age": "86400", // 24 hours
		};
	}

	// If origin is in allowed list, return specific CORS headers
	if (origin && allowed.includes(origin)) {
		return {
			"Access-Control-Allow-Origin": origin,
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
			"Access-Control-Allow-Credentials": "true",
			"Access-Control-Max-Age": "86400",
			"Vary": "Origin",
		};
	}

	return {};
}

// Add CORS headers to a NextResponse
export function withCors(response: NextResponse, request: Request): NextResponse {
	const origin = request.headers.get("Origin");
	const headers = getCorsHeaders(origin);

	Object.entries(headers).forEach(([key, value]) => {
		response.headers.set(key, value);
	});

	return response;
}

// Handle OPTIONS preflight requests
export function handleCorsOptions(request: Request): NextResponse {
	const origin = request.headers.get("Origin");
	const headers = getCorsHeaders(origin);

	if (Object.keys(headers).length === 0) {
		return new NextResponse(null, { status: 204 });
	}

	return new NextResponse(null, {
		status: 204,
		headers,
	});
}
