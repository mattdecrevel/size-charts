import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

// GET /api/measurement-instructions - List all measurement instructions
export async function GET() {
	try {
		const instructions = await db.measurementInstruction.findMany({
			orderBy: { sortOrder: "asc" },
			include: {
				_count: {
					select: { sizeCharts: true },
				},
			},
		});

		return NextResponse.json(instructions);
	} catch (error) {
		console.error("Failed to fetch measurement instructions:", error);
		return NextResponse.json(
			{ error: "Failed to fetch measurement instructions" },
			{ status: 500 }
		);
	}
}

// Validation schema for creating/updating instructions
const instructionSchema = z.object({
	key: z.string().min(1).max(50).regex(/^[a-z][a-z0-9_]*$/, {
		message: "Key must be lowercase, start with a letter, and only contain letters, numbers, and underscores",
	}),
	name: z.string().min(1).max(100),
	instruction: z.string().min(1).max(500),
	sortOrder: z.number().int().optional(),
});

// POST /api/measurement-instructions - Create new instruction
export async function POST(request: Request) {
	try {
		const body = await request.json();
		const validated = instructionSchema.parse(body);

		// Check for duplicate key
		const existing = await db.measurementInstruction.findUnique({
			where: { key: validated.key },
		});

		if (existing) {
			return NextResponse.json(
				{ error: "An instruction with this key already exists" },
				{ status: 409 }
			);
		}

		const instruction = await db.measurementInstruction.create({
			data: {
				key: validated.key,
				name: validated.name,
				instruction: validated.instruction,
				sortOrder: validated.sortOrder ?? 0,
			},
		});

		return NextResponse.json(instruction, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid request data", details: error.issues },
				{ status: 400 }
			);
		}
		console.error("Failed to create measurement instruction:", error);
		return NextResponse.json(
			{ error: "Failed to create measurement instruction" },
			{ status: 500 }
		);
	}
}
