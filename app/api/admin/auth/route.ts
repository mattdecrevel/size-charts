import { NextRequest, NextResponse } from "next/server";
import {
	validateCredentials,
	createSession,
	invalidateSession,
	isAdminAuthEnabled,
	getSessionCookieName,
	getSessionExpirySeconds,
} from "@/lib/admin-auth";

/**
 * POST /api/admin/auth - Login
 */
export async function POST(request: NextRequest) {
	// If auth is not enabled, return success
	if (!(await isAdminAuthEnabled())) {
		return NextResponse.json({
			success: true,
			message: "Authentication not required",
		});
	}

	try {
		const body = await request.json();
		const { username, password } = body;

		if (!username || !password) {
			return NextResponse.json(
				{ error: "Username and password are required" },
				{ status: 400 }
			);
		}

		if (!validateCredentials(username, password)) {
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 }
			);
		}

		// Create session
		const sessionToken = createSession();

		// Set cookie
		const response = NextResponse.json({
			success: true,
			message: "Login successful",
		});

		response.cookies.set({
			name: getSessionCookieName(),
			value: sessionToken,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: getSessionExpirySeconds(),
			path: "/",
		});

		return response;
	} catch {
		return NextResponse.json(
			{ error: "Invalid request body" },
			{ status: 400 }
		);
	}
}

/**
 * DELETE /api/admin/auth - Logout
 */
export async function DELETE(request: NextRequest) {
	const sessionCookie = request.cookies.get(getSessionCookieName());

	if (sessionCookie?.value) {
		invalidateSession(sessionCookie.value);
	}

	const response = NextResponse.json({
		success: true,
		message: "Logged out successfully",
	});

	// Clear the cookie
	response.cookies.set({
		name: getSessionCookieName(),
		value: "",
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 0,
		path: "/",
	});

	return response;
}

/**
 * GET /api/admin/auth - Check auth status
 */
export async function GET() {
	return NextResponse.json({
		authEnabled: await isAdminAuthEnabled(),
	});
}
