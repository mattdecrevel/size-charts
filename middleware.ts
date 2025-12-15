import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "admin_session";

// Paths that don't require authentication
const PUBLIC_PATHS = [
	"/admin/login",
	"/api/admin/auth",
	"/.well-known/vercel/flags",
];

// Paths that should never be protected (public site, public API)
const ALWAYS_PUBLIC = [
	"/",
	"/size-guide",
	"/api/v1",
	"/api/health",
	"/api/docs",
];

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Check if this is an admin path
	const isAdminPath = pathname.startsWith("/admin");
	const isAdminApiPath = pathname.startsWith("/api/") && !pathname.startsWith("/api/v1") && !pathname.startsWith("/api/health") && !pathname.startsWith("/api/docs");

	// Skip if not an admin path
	if (!isAdminPath && !isAdminApiPath) {
		return NextResponse.next();
	}

	// Check if path is always public
	for (const publicPath of ALWAYS_PUBLIC) {
		if (pathname.startsWith(publicPath) && pathname !== "/admin") {
			return NextResponse.next();
		}
	}

	// Allow public admin paths (login page, auth API)
	for (const publicPath of PUBLIC_PATHS) {
		if (pathname.startsWith(publicPath)) {
			return NextResponse.next();
		}
	}

	// Check if example mode is enabled (bypasses all auth)
	// Check env var first (production fallback)
	const isExampleModeEnv = process.env.EXAMPLE_MODE === "true";
	if (isExampleModeEnv) {
		return NextResponse.next();
	}

	// Check for feature flag override via cookie (set by Vercel toolbar)
	// The flags package stores overrides in the "vercel-flag-overrides" cookie as JSON
	const flagOverrides = request.cookies.get("vercel-flag-overrides");
	if (flagOverrides?.value) {
		try {
			const overrides = JSON.parse(flagOverrides.value);
			if (overrides["example-mode"] === true) {
				return NextResponse.next();
			}
		} catch {
			// Invalid JSON, ignore
		}
	}

	// Check if auth is enabled (via env vars)
	const adminUsername = process.env.ADMIN_USERNAME;
	const adminPassword = process.env.ADMIN_PASSWORD;
	const authEnabled = Boolean(adminUsername && adminPassword);

	// If auth is not enabled, allow access
	if (!authEnabled) {
		return NextResponse.next();
	}

	// Check for session cookie
	const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

	// For pages, redirect to login if no session
	if (isAdminPath && !sessionCookie?.value) {
		const loginUrl = new URL("/admin/login", request.url);
		loginUrl.searchParams.set("from", pathname);
		return NextResponse.redirect(loginUrl);
	}

	// For API routes, return 401 if no session
	if (isAdminApiPath && !sessionCookie?.value) {
		// Allow public internal API routes
		if (pathname.startsWith("/api/size-charts") ||
			pathname.startsWith("/api/categories") ||
			pathname.startsWith("/api/labels") ||
			pathname.startsWith("/api/label-types") ||
			pathname.startsWith("/api/measurement-instructions") ||
			pathname.startsWith("/api/api-keys")) {
			// These are internal admin APIs - require auth
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}
	}

	// Session exists - allow the request
	// Note: Full session validation happens in the route handlers
	// Middleware just checks for the presence of the cookie
	return NextResponse.next();
}

export const config = {
	matcher: [
		// Match all admin routes
		"/admin/:path*",
		// Match internal API routes (not v1 public API)
		"/api/size-charts/:path*",
		"/api/categories/:path*",
		"/api/labels/:path*",
		"/api/label-types/:path*",
		"/api/measurement-instructions/:path*",
		"/api/api-keys/:path*",
	],
};
