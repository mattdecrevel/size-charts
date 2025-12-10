import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/utils";
import { createSubcategorySchema } from "@/lib/validations";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createSubcategorySchema.parse(body);

    const slug = generateSlug(data.name);

    // Check for duplicate slug in same category
    const existing = await db.subcategory.findUnique({
      where: {
        categoryId_slug: {
          categoryId: data.categoryId,
          slug,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A subcategory with this name already exists in this category" },
        { status: 409 }
      );
    }

    // Get highest display order
    const lastSubcategory = await db.subcategory.findFirst({
      where: { categoryId: data.categoryId },
      orderBy: { displayOrder: "desc" },
    });

    const subcategory = await db.subcategory.create({
      data: {
        name: data.name,
        slug,
        categoryId: data.categoryId,
        displayOrder: (lastSubcategory?.displayOrder ?? -1) + 1,
      },
    });

    return NextResponse.json(subcategory, { status: 201 });
  } catch (error) {
    console.error("Error creating subcategory:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create subcategory" }, { status: 500 });
  }
}
