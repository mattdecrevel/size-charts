import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
});

const securityHeaders = [
	{
		key: "X-DNS-Prefetch-Control",
		value: "on",
	},
	{
		key: "Strict-Transport-Security",
		value: "max-age=63072000; includeSubDomains; preload",
	},
	{
		key: "X-Content-Type-Options",
		value: "nosniff",
	},
	{
		key: "X-Frame-Options",
		value: "SAMEORIGIN",
	},
	{
		key: "X-XSS-Protection",
		value: "1; mode=block",
	},
	{
		key: "Referrer-Policy",
		value: "strict-origin-when-cross-origin",
	},
	{
		key: "Permissions-Policy",
		value: "camera=(), microphone=(), geolocation=()",
	},
];

const nextConfig: NextConfig = {
	// Enable standalone output for Docker deployments
	output: "standalone",

	// Disable x-powered-by header for security
	poweredByHeader: false,

	// Security headers
	async headers() {
		return [
			{
				// Apply to all routes
				source: "/:path*",
				headers: securityHeaders,
			},
		];
	},

	// Logging configuration
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
};

// Apply bundle analyzer, then Sentry config
export default withSentryConfig(withBundleAnalyzer(nextConfig), {
	// Sentry organization and project
	org: process.env.SENTRY_ORG,
	project: process.env.SENTRY_PROJECT,

	// Only upload source maps in production builds
	silent: !process.env.CI,

	// Upload a larger set of source maps for prettier stack traces
	widenClientFileUpload: true,

	// Automatically tree-shake Sentry logger statements to reduce bundle size
	disableLogger: true,

	// Enables automatic instrumentation of Vercel Cron Monitors
	automaticVercelMonitors: true,
});
