import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSizeLabelSchema } from "@/lib/validations";
import { z } from "zod";

// GET /api/labels - List all labels with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const labelType = searchParams.get("type");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (labelType) {
      where.labelType = labelType;
    }

    if (search) {
      where.OR = [
        { key: { contains: search, mode: "insensitive" } },
        { displayValue: { contains: search, mode: "insensitive" } },
      ];
    }

    const labels = await db.sizeLabel.findMany({
      where,
      orderBy: [{ labelType: "asc" }, { sortOrder: "asc" }, { displayValue: "asc" }],
    });

    return NextResponse.json(labels);
  } catch (error) {
    console.error("Error fetching labels:", error);
    return NextResponse.json({ error: "Failed to fetch labels" }, { status: 500 });
  }
}

// POST /api/labels - Create a new label
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createSizeLabelSchema.parse(body);

    // Check for duplicate key
    const existing = await db.sizeLabel.findUnique({
      where: { key: data.key },
    });

    if (existing) {
      return NextResponse.json({ error: "A label with this key already exists" }, { status: 400 });
    }

    const label = await db.sizeLabel.create({
      data: {
        key: data.key,
        displayValue: data.displayValue,
        labelType: data.labelType,
        sortOrder: data.sortOrder ?? 0,
        description: data.description ?? null,
      },
    });

    return NextResponse.json(label, { status: 201 });
  } catch (error) {
    console.error("Error creating label:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create label" }, { status: 500 });
  }
}
