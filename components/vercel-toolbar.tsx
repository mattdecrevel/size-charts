import { VercelToolbar } from "@vercel/toolbar/next";

export function DevToolbar() {
	// Show toolbar in development, preview, or when explicitly enabled
	const shouldShowToolbar =
		process.env.NODE_ENV === "development" ||
		process.env.VERCEL_ENV === "preview" ||
		process.env.VERCEL_ENV === "development";

	if (!shouldShowToolbar) {
		return null;
	}

	return <VercelToolbar />;
}

// Re-export for dynamic import if needed
export default DevToolbar;
