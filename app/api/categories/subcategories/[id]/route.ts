import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateSubcategorySchema } from "@/lib/validations";
import { generateSlug } from "@/lib/utils";
import { z } from "zod";

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;

		const subcategory = await db.subcategory.findUnique({
			where: { id },
			include: {
				category: true,
				_count: { select: { sizeCharts: true } },
			},
		});

		if (!subcategory) {
			return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
		}

		return NextResponse.json(subcategory);
	} catch (error) {
		console.error("Error fetching subcategory:", error);
		return NextResponse.json({ error: "Failed to fetch subcategory" }, { status: 500 });
	}
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const body = await request.json();
		const data = updateSubcategorySchema.parse(body);

		const existing = await db.subcategory.findUnique({
			where: { id },
		});

		if (!existing) {
			return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
		}

		const updateData: Record<string, unknown> = {};

		if (data.name !== undefined) {
			updateData.name = data.name;
			// Auto-update slug if name changes
			if (data.slug === undefined) {
				updateData.slug = generateSlug(data.name);
			}
		}

		if (data.slug !== undefined) {
			updateData.slug = data.slug;
		}

		if (data.displayOrder !== undefined) {
			updateData.displayOrder = data.displayOrder;
		}

		// Check for duplicate slug in same category
		if (updateData.slug) {
			const duplicate = await db.subcategory.findFirst({
				where: {
					id: { not: id },
					categoryId: existing.categoryId,
					slug: updateData.slug as string,
				},
			});

			if (duplicate) {
				return NextResponse.json(
					{ error: "A subcategory with this slug already exists in this category" },
					{ status: 409 }
				);
			}
		}

		const subcategory = await db.subcategory.update({
			where: { id },
			data: updateData,
			include: {
				category: true,
			},
		});

		return NextResponse.json(subcategory);
	} catch (error) {
		console.error("Error updating subcategory:", error);
		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
		}
		return NextResponse.json({ error: "Failed to update subcategory" }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;

		const subcategory = await db.subcategory.findUnique({
			where: { id },
			include: {
				_count: { select: { sizeCharts: true } },
			},
		});

		if (!subcategory) {
			return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
		}

		// Check if subcategory has size charts
		if (subcategory._count.sizeCharts > 0) {
			return NextResponse.json(
				{ error: "Cannot delete subcategory that contains size charts. Remove or reassign charts first." },
				{ status: 409 }
			);
		}

		await db.subcategory.delete({
			where: { id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting subcategory:", error);
		return NextResponse.json({ error: "Failed to delete subcategory" }, { status: 500 });
	}
}
