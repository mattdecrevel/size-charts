import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { API_SCOPES, type ApiScope } from "@/lib/api-auth";

// GET /api/api-keys/[id] - Get single API key details
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;

		const apiKey = await db.apiKey.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				keyPrefix: true,
				scopes: true,
				isActive: true,
				lastUsedAt: true,
				expiresAt: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!apiKey) {
			return NextResponse.json(
				{ error: "API key not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(apiKey);
	} catch (error) {
		console.error("Failed to fetch API key:", error);
		return NextResponse.json(
			{ error: "Failed to fetch API key" },
			{ status: 500 }
		);
	}
}

// Validation schema for updating API keys
const updateKeySchema = z.object({
	name: z.string().min(1).max(100).optional(),
	scopes: z.array(z.enum(Object.keys(API_SCOPES) as [ApiScope, ...ApiScope[]])).optional(),
	isActive: z.boolean().optional(),
	expiresAt: z.string().datetime().nullable().optional(),
});

// PUT /api/api-keys/[id] - Update API key
export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const body = await request.json();
		const validated = updateKeySchema.parse(body);

		// Check if key exists
		const existing = await db.apiKey.findUnique({
			where: { id },
		});

		if (!existing) {
			return NextResponse.json(
				{ error: "API key not found" },
				{ status: 404 }
			);
		}

		const apiKey = await db.apiKey.update({
			where: { id },
			data: {
				...validated,
				expiresAt: validated.expiresAt === null
					? null
					: validated.expiresAt
						? new Date(validated.expiresAt)
						: undefined,
			},
			select: {
				id: true,
				name: true,
				keyPrefix: true,
				scopes: true,
				isActive: true,
				lastUsedAt: true,
				expiresAt: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return NextResponse.json(apiKey);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid request data", details: error.issues },
				{ status: 400 }
			);
		}
		console.error("Failed to update API key:", error);
		return NextResponse.json(
			{ error: "Failed to update API key" },
			{ status: 500 }
		);
	}
}

// DELETE /api/api-keys/[id] - Revoke/delete API key
export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;

		// Check if key exists
		const existing = await db.apiKey.findUnique({
			where: { id },
		});

		if (!existing) {
			return NextResponse.json(
				{ error: "API key not found" },
				{ status: 404 }
			);
		}

		await db.apiKey.delete({
			where: { id },
		});

		return NextResponse.json({
			success: true,
			message: "API key revoked and deleted",
		});
	} catch (error) {
		console.error("Failed to delete API key:", error);
		return NextResponse.json(
			{ error: "Failed to delete API key" },
			{ status: 500 }
		);
	}
}
