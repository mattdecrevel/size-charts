import * as Sentry from "@sentry/nextjs";

Sentry.init({
	dsn: process.env.SENTRY_DSN,

	// Performance Monitoring
	tracesSampleRate: 1.0, // Capture 100% of transactions in dev, reduce in production

	// Only enable in production
	enabled: process.env.NODE_ENV === "production",

	// Set environment
	environment: process.env.NODE_ENV,

	// Ignore common non-actionable errors
	ignoreErrors: [
		"NEXT_NOT_FOUND",
		"NEXT_REDIRECT",
	],
});
