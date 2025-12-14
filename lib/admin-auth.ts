import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";

// Session token configuration
const SESSION_COOKIE_NAME = "admin_session";
const SESSION_EXPIRY_HOURS = 24;

// In-memory session store (works for single instance deployments)
// For multi-instance, consider using Redis or database sessions
const sessions = new Map<string, { expiresAt: Date }>();

/**
 * Get admin credentials from environment variables
 */
export function getAdminCredentials(): { username: string; password: string } | null {
	const username = process.env.ADMIN_USERNAME;
	const password = process.env.ADMIN_PASSWORD;

	if (!username || !password) {
		return null;
	}

	return { username, password };
}

/**
 * Check if admin authentication is enabled
 * Note: Demo mode bypasses auth entirely (public demo site)
 */
export function isAdminAuthEnabled(): boolean {
	// Demo mode bypasses all auth - anyone can access admin
	if (isDemoModeEnabled()) {
		return false;
	}

	// Auth is enabled if admin credentials are set
	const creds = getAdminCredentials();
	if (creds !== null && creds.username.length > 0 && creds.password.length > 0) {
		return true;
	}

	return false;
}

/**
 * Check if demo mode is enabled
 */
export function isDemoModeEnabled(): boolean {
	return process.env.DEMO_MODE === "true";
}

/**
 * Validate admin credentials
 */
export function validateCredentials(username: string, password: string): boolean {
	const creds = getAdminCredentials();

	if (creds) {
		const validUsername = creds.username === username;
		const validPassword = creds.password === password;
		if (validUsername && validPassword) return true;
	}

	return false;
}

/**
 * Create a new session and return the token
 */
export function createSession(): string {
	const token = randomBytes(32).toString("hex");
	const hashedToken = hashToken(token);

	const expiresAt = new Date();
	expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRY_HOURS);

	sessions.set(hashedToken, { expiresAt });

	// Clean up expired sessions periodically
	cleanupExpiredSessions();

	return token;
}

/**
 * Validate a session token
 */
export function validateSession(token: string): boolean {
	if (!token) return false;

	const hashedToken = hashToken(token);
	const session = sessions.get(hashedToken);

	if (!session) return false;

	if (new Date() > session.expiresAt) {
		sessions.delete(hashedToken);
		return false;
	}

	return true;
}

/**
 * Invalidate a session (logout)
 */
export function invalidateSession(token: string): void {
	const hashedToken = hashToken(token);
	sessions.delete(hashedToken);
}

/**
 * Hash a token for storage
 */
function hashToken(token: string): string {
	return createHash("sha256").update(token).digest("hex");
}

/**
 * Clean up expired sessions
 */
function cleanupExpiredSessions(): void {
	const now = new Date();
	for (const [hash, session] of sessions.entries()) {
		if (now > session.expiresAt) {
			sessions.delete(hash);
		}
	}
}

/**
 * Check if the current request is authenticated (for use in Server Components)
 */
export async function isAuthenticated(): Promise<boolean> {
	// If auth is not enabled, always return true
	if (!isAdminAuthEnabled()) {
		return true;
	}

	const cookieStore = await cookies();
	const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

	if (!sessionCookie?.value) {
		return false;
	}

	return validateSession(sessionCookie.value);
}

/**
 * Get the session cookie name
 */
export function getSessionCookieName(): string {
	return SESSION_COOKIE_NAME;
}

/**
 * Get session expiry in seconds (for cookie maxAge)
 */
export function getSessionExpirySeconds(): number {
	return SESSION_EXPIRY_HOURS * 60 * 60;
}
