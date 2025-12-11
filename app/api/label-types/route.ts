import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LABEL_TYPES } from "@/lib/constants";
import { z } from "zod";
import type { LabelType } from "@prisma/client";

const updateLabelTypeSchema = z.object({
	labelType: z.string(),
	displayName: z.string().min(1).max(100),
	description: z.string().max(500).optional().nullable(),
});

// GET all label type configs (merged with defaults)
export async function GET() {
	try {
		// Fetch any custom configurations from the database
		const customConfigs = await db.labelTypeConfig.findMany();

		// Create a map for quick lookup
		const configMap = new Map(
			customConfigs.map(c => [c.labelType, c])
		);

		// Merge defaults with custom configs
		const result = LABEL_TYPES.map(defaultType => {
			const custom = configMap.get(defaultType.value as LabelType);
			return {
				labelType: defaultType.value,
				displayName: custom?.displayName ?? defaultType.label,
				description: custom?.description ?? defaultType.description,
				isCustomized: !!custom,
				id: custom?.id ?? null,
			};
		});

		return NextResponse.json(result);
	} catch (error) {
		console.error("Error fetching label type configs:", error);
		return NextResponse.json({ error: "Failed to fetch label type configs" }, { status: 500 });
	}
}

// POST/PUT to update a label type config
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const data = updateLabelTypeSchema.parse(body);

		// Validate that labelType is valid
		const validType = LABEL_TYPES.find(t => t.value === data.labelType);
		if (!validType) {
			return NextResponse.json({ error: "Invalid label type" }, { status: 400 });
		}

		// Upsert the config
		const config = await db.labelTypeConfig.upsert({
			where: { labelType: data.labelType as LabelType },
			update: {
				displayName: data.displayName,
				description: data.description,
			},
			create: {
				labelType: data.labelType as LabelType,
				displayName: data.displayName,
				description: data.description,
			},
		});

		return NextResponse.json(config);
	} catch (error) {
		console.error("Error updating label type config:", error);
		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
		}
		return NextResponse.json({ error: "Failed to update label type config" }, { status: 500 });
	}
}

// DELETE to reset a label type config back to defaults
export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const labelType = searchParams.get("labelType");

		if (!labelType) {
			return NextResponse.json({ error: "labelType is required" }, { status: 400 });
		}

		// Validate that labelType is valid
		const validType = LABEL_TYPES.find(t => t.value === labelType);
		if (!validType) {
			return NextResponse.json({ error: "Invalid label type" }, { status: 400 });
		}

		// Delete the custom config (will fall back to defaults)
		await db.labelTypeConfig.delete({
			where: { labelType: labelType as LabelType },
		}).catch(() => {
			// Ignore if it doesn't exist
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error resetting label type config:", error);
		return NextResponse.json({ error: "Failed to reset label type config" }, { status: 500 });
	}
}
