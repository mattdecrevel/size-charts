import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCategorySchema } from "@/lib/validations";
import { generateSlug } from "@/lib/utils";
import { z } from "zod";

export async function GET() {
	try {
		const categories = await db.category.findMany({
			orderBy: { displayOrder: "asc" },
			include: {
				subcategories: {
					orderBy: { displayOrder: "asc" },
					include: {
						_count: { select: { sizeCharts: true } },
					},
				},
			},
		});

		return NextResponse.json(categories);
	} catch (error) {
		console.error("Error fetching categories:", error);
		return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const data = createCategorySchema.parse(body);

		const slug = data.slug || generateSlug(data.name);

		// Check for duplicate
		const existing = await db.category.findFirst({
			where: {
				OR: [{ name: data.name }, { slug }],
			},
		});

		if (existing) {
			return NextResponse.json(
				{ error: "A category with this name or slug already exists" },
				{ status: 409 }
			);
		}

		// Get highest display order
		const lastCategory = await db.category.findFirst({
			orderBy: { displayOrder: "desc" },
		});

		const category = await db.category.create({
			data: {
				name: data.name,
				slug,
				displayOrder: data.displayOrder ?? (lastCategory?.displayOrder ?? -1) + 1,
			},
			include: {
				subcategories: true,
			},
		});

		return NextResponse.json(category, { status: 201 });
	} catch (error) {
		console.error("Error creating category:", error);
		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
		}
		return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
	}
}
