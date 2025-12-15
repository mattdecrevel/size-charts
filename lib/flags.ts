import { flag } from "flags/next";

/**
 * Demo mode feature flag
 *
 * When enabled:
 * - Admin authentication is bypassed (no login required)
 * - Anyone can access and modify the admin panel
 * - Database resets on a schedule (for public demo site)
 *
 * Toggle via:
 * - Vercel toolbar in development
 * - Vercel dashboard in production
 * - FLAGS_SECRET cookie for local overrides
 */
export const demoMode = flag<boolean>({
	key: "demo-mode",
	description: "Enable demo mode for public demo site",
	defaultValue: false,
	options: [
		{ value: true, label: "Enabled" },
		{ value: false, label: "Disabled" },
	],
	// Decide function - called on every request
	async decide() {
		// Check environment variable as fallback
		// This allows DEMO_MODE=true to still work for backwards compatibility
		if (process.env.DEMO_MODE === "true") {
			return true;
		}
		return this.defaultValue as boolean;
	},
});

// Export all flags for the toolbar
export const flags = [demoMode] as const;
