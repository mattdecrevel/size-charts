import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

// GET /api/measurement-instructions/[id] - Get single instruction
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;

		const instruction = await db.measurementInstruction.findUnique({
			where: { id },
			include: {
				sizeCharts: {
					include: {
						sizeChart: {
							select: { id: true, name: true, slug: true },
						},
					},
				},
			},
		});

		if (!instruction) {
			return NextResponse.json(
				{ error: "Measurement instruction not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(instruction);
	} catch (error) {
		console.error("Failed to fetch measurement instruction:", error);
		return NextResponse.json(
			{ error: "Failed to fetch measurement instruction" },
			{ status: 500 }
		);
	}
}

// Validation schema for updating instructions
const updateSchema = z.object({
	key: z.string().min(1).max(50).regex(/^[a-z][a-z0-9_]*$/, {
		message: "Key must be lowercase, start with a letter, and only contain letters, numbers, and underscores",
	}).optional(),
	name: z.string().min(1).max(100).optional(),
	instruction: z.string().min(1).max(500).optional(),
	sortOrder: z.number().int().optional(),
});

// PUT /api/measurement-instructions/[id] - Update instruction
export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const body = await request.json();
		const validated = updateSchema.parse(body);

		// Check if instruction exists
		const existing = await db.measurementInstruction.findUnique({
			where: { id },
		});

		if (!existing) {
			return NextResponse.json(
				{ error: "Measurement instruction not found" },
				{ status: 404 }
			);
		}

		// Check for duplicate key if changing key
		if (validated.key && validated.key !== existing.key) {
			const duplicate = await db.measurementInstruction.findUnique({
				where: { key: validated.key },
			});
			if (duplicate) {
				return NextResponse.json(
					{ error: "An instruction with this key already exists" },
					{ status: 409 }
				);
			}
		}

		const instruction = await db.measurementInstruction.update({
			where: { id },
			data: validated,
		});

		return NextResponse.json(instruction);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid request data", details: error.issues },
				{ status: 400 }
			);
		}
		console.error("Failed to update measurement instruction:", error);
		return NextResponse.json(
			{ error: "Failed to update measurement instruction" },
			{ status: 500 }
		);
	}
}

// DELETE /api/measurement-instructions/[id] - Delete instruction
export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;

		// Check if instruction exists and count usages
		const existing = await db.measurementInstruction.findUnique({
			where: { id },
			include: {
				_count: { select: { sizeCharts: true } },
			},
		});

		if (!existing) {
			return NextResponse.json(
				{ error: "Measurement instruction not found" },
				{ status: 404 }
			);
		}

		// Warn if in use (but still allow deletion - cascade will remove links)
		const usageCount = existing._count.sizeCharts;

		await db.measurementInstruction.delete({
			where: { id },
		});

		return NextResponse.json({
			success: true,
			message: usageCount > 0
				? `Deleted instruction and removed from ${usageCount} size chart(s)`
				: "Deleted instruction",
		});
	} catch (error) {
		console.error("Failed to delete measurement instruction:", error);
		return NextResponse.json(
			{ error: "Failed to delete measurement instruction" },
			{ status: 500 }
		);
	}
}
