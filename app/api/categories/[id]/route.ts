import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateCategorySchema } from "@/lib/validations";
import { generateSlug } from "@/lib/utils";
import { z } from "zod";
import { isDemoCategorySlug } from "@/lib/demo-slugs";
import { isDemoModeEnabled } from "@/lib/admin-auth";

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;

		const category = await db.category.findUnique({
			where: { id },
			include: {
				subcategories: {
					orderBy: { displayOrder: "asc" },
					include: {
						_count: { select: { sizeCharts: true } },
					},
				},
			},
		});

		if (!category) {
			return NextResponse.json({ error: "Category not found" }, { status: 404 });
		}

		return NextResponse.json(category);
	} catch (error) {
		console.error("Error fetching category:", error);
		return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
	}
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const body = await request.json();
		const data = updateCategorySchema.parse(body);

		const existing = await db.category.findUnique({
			where: { id },
		});

		if (!existing) {
			return NextResponse.json({ error: "Category not found" }, { status: 404 });
		}

		// If name is changing, update slug too (unless slug is explicitly provided)
		const updateData: Record<string, unknown> = {};

		// Calculate what the new slug would be
		let newSlug: string | undefined;
		if (data.slug !== undefined) {
			newSlug = data.slug;
		} else if (data.name !== undefined) {
			newSlug = generateSlug(data.name);
		}

		// Block slug changes for demo data in demo mode
		if (newSlug !== undefined && newSlug !== existing.slug) {
			const demoMode = await isDemoModeEnabled();
			if (demoMode && isDemoCategorySlug(existing.slug)) {
				return NextResponse.json(
					{
						error: "Cannot change slug of demo category in demo mode",
						code: "DEMO_SLUG_PROTECTED",
					},
					{ status: 403 }
				);
			}
		}

		if (data.name !== undefined) {
			updateData.name = data.name;
			// Auto-update slug if name changes and no explicit slug provided
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

		// Check for duplicate name/slug
		if (updateData.name || updateData.slug) {
			const duplicate = await db.category.findFirst({
				where: {
					id: { not: id },
					OR: [
						updateData.name ? { name: updateData.name as string } : {},
						updateData.slug ? { slug: updateData.slug as string } : {},
					].filter(obj => Object.keys(obj).length > 0),
				},
			});

			if (duplicate) {
				return NextResponse.json(
					{ error: "A category with this name or slug already exists" },
					{ status: 409 }
				);
			}
		}

		const category = await db.category.update({
			where: { id },
			data: updateData,
			include: {
				subcategories: {
					orderBy: { displayOrder: "asc" },
				},
			},
		});

		return NextResponse.json(category);
	} catch (error) {
		console.error("Error updating category:", error);
		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
		}
		return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;

		const category = await db.category.findUnique({
			where: { id },
			include: {
				subcategories: {
					include: {
						_count: { select: { sizeCharts: true } },
					},
				},
			},
		});

		if (!category) {
			return NextResponse.json({ error: "Category not found" }, { status: 404 });
		}

		// Check if any subcategory has size charts
		const hasCharts = category.subcategories.some((sub) => sub._count.sizeCharts > 0);
		if (hasCharts) {
			return NextResponse.json(
				{ error: "Cannot delete category that contains size charts. Remove charts first." },
				{ status: 409 }
			);
		}

		await db.category.delete({
			where: { id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting category:", error);
		return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
	}
}
