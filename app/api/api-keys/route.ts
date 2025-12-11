import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { generateApiKey, DEFAULT_SCOPES, API_SCOPES, type ApiScope } from "@/lib/api-auth";

// GET /api/api-keys - List all API keys (without the actual key values)
export async function GET() {
	try {
		const keys = await db.apiKey.findMany({
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				name: true,
				keyPrefix: true,
				scopes: true,
				isActive: true,
				lastUsedAt: true,
				expiresAt: true,
				createdAt: true,
			},
		});

		return NextResponse.json(keys);
	} catch (error) {
		console.error("Failed to fetch API keys:", error);
		return NextResponse.json(
			{ error: "Failed to fetch API keys" },
			{ status: 500 }
		);
	}
}

// Validation schema for creating API keys
const createKeySchema = z.object({
	name: z.string().min(1).max(100),
	scopes: z.array(z.enum(Object.keys(API_SCOPES) as [ApiScope, ...ApiScope[]])).optional(),
	expiresAt: z.string().datetime().optional(),
});

// POST /api/api-keys - Create new API key
export async function POST(request: Request) {
	try {
		const body = await request.json();
		const validated = createKeySchema.parse(body);

		const { raw, hash, prefix } = generateApiKey();

		const apiKey = await db.apiKey.create({
			data: {
				name: validated.name,
				key: hash,
				keyPrefix: prefix,
				scopes: validated.scopes ?? DEFAULT_SCOPES,
				expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
			},
			select: {
				id: true,
				name: true,
				keyPrefix: true,
				scopes: true,
				isActive: true,
				expiresAt: true,
				createdAt: true,
			},
		});

		// Return the raw key ONLY on creation - it's never shown again
		return NextResponse.json(
			{
				...apiKey,
				key: raw, // Only returned once!
				message: "Save this API key - it won't be shown again",
			},
			{ status: 201 }
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid request data", details: error.issues },
				{ status: 400 }
			);
		}
		console.error("Failed to create API key:", error);
		return NextResponse.json(
			{ error: "Failed to create API key" },
			{ status: 500 }
		);
	}
}
