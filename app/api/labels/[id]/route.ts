import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateSizeLabelSchema } from "@/lib/validations";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/labels/[id] - Get a single label
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const label = await db.sizeLabel.findUnique({
      where: { id },
      include: {
        _count: {
          select: { cells: true },
        },
      },
    });

    if (!label) {
      return NextResponse.json({ error: "Label not found" }, { status: 404 });
    }

    return NextResponse.json(label);
  } catch (error) {
    console.error("Error fetching label:", error);
    return NextResponse.json({ error: "Failed to fetch label" }, { status: 500 });
  }
}

// PUT /api/labels/[id] - Update a label
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateSizeLabelSchema.parse(body);

    // Check if label exists
    const existing = await db.sizeLabel.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Label not found" }, { status: 404 });
    }

    // Check for duplicate key if key is being changed
    if (data.key && data.key !== existing.key) {
      const duplicate = await db.sizeLabel.findUnique({
        where: { key: data.key },
      });
      if (duplicate) {
        return NextResponse.json({ error: "A label with this key already exists" }, { status: 400 });
      }
    }

    const label = await db.sizeLabel.update({
      where: { id },
      data: {
        ...(data.key && { key: data.key }),
        ...(data.displayValue && { displayValue: data.displayValue }),
        ...(data.labelType && { labelType: data.labelType }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });

    return NextResponse.json(label);
  } catch (error) {
    console.error("Error updating label:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update label" }, { status: 500 });
  }
}

// DELETE /api/labels/[id] - Delete a label
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if label is in use
    const label = await db.sizeLabel.findUnique({
      where: { id },
      include: {
        _count: {
          select: { cells: true },
        },
      },
    });

    if (!label) {
      return NextResponse.json({ error: "Label not found" }, { status: 404 });
    }

    if (label._count.cells > 0) {
      return NextResponse.json(
        { error: `Cannot delete label: it's being used in ${label._count.cells} cell(s)` },
        { status: 400 }
      );
    }

    await db.sizeLabel.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting label:", error);
    return NextResponse.json({ error: "Failed to delete label" }, { status: 500 });
  }
}
