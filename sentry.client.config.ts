import * as Sentry from "@sentry/nextjs";

Sentry.init({
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

	// Performance Monitoring
	tracesSampleRate: 1.0, // Capture 100% of transactions in dev, reduce in production

	// Session Replay - captures user sessions for debugging
	replaysSessionSampleRate: 0.1, // 10% of sessions
	replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

	// Only enable in production
	enabled: process.env.NODE_ENV === "production",

	// Set environment
	environment: process.env.NODE_ENV,

	// Ignore common non-actionable errors
	ignoreErrors: [
		// Browser extensions
		"top.GLOBALS",
		"originalCreateNotification",
		"canvas.contentDocument",
		"MyApp_RemoveAllHighlights",
		"http://tt.teletrax.web",
		"jigsaw is not defined",
		// Facebook
		"fb_xd_fragment",
		// Chrome extensions
		/extensions\//i,
		/^chrome:\/\//i,
		// Network errors
		"Network request failed",
		"Failed to fetch",
		"NetworkError",
		"Load failed",
	],

	// Filter out noisy breadcrumbs
	beforeBreadcrumb(breadcrumb) {
		// Ignore UI clicks that don't have useful info
		if (breadcrumb.category === "ui.click" && !breadcrumb.message) {
			return null;
		}
		return breadcrumb;
	},
});
