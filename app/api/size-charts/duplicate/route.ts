import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/utils";
import { duplicateSizeChartSchema } from "@/lib/validations";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = duplicateSizeChartSchema.parse(body);

    // Get the original size chart
    const original = await db.sizeChart.findUnique({
      where: { id: data.id },
      include: {
        columns: { orderBy: { displayOrder: "asc" } },
        rows: {
          orderBy: { displayOrder: "asc" },
          include: { cells: true },
        },
      },
    });

    if (!original) {
      return NextResponse.json({ error: "Size chart not found" }, { status: 404 });
    }

    // Generate new name and slug
    const newName = data.name || `${original.name} (Copy)`;
    let slug = generateSlug(newName);
    let counter = 1;

    // Ensure unique slug
    while (await db.sizeChart.findUnique({
      where: {
        subcategoryId_slug: {
          subcategoryId: original.subcategoryId,
          slug,
        },
      },
    })) {
      slug = `${generateSlug(newName)}-${counter}`;
      counter++;
    }

    // Create the duplicate
    const duplicate = await db.sizeChart.create({
      data: {
        name: newName,
        slug,
        description: original.description,
        subcategoryId: original.subcategoryId,
        isPublished: false, // Always start as draft
        displayOrder: original.displayOrder + 1,
        columns: {
          create: original.columns.map((col) => ({
            name: col.name,
            columnType: col.columnType,
            unit: col.unit,
            displayOrder: col.displayOrder,
          })),
        },
      },
      include: {
        columns: { orderBy: { displayOrder: "asc" } },
      },
    });

    // Create rows and cells
    for (const row of original.rows) {
      const newRow = await db.sizeChartRow.create({
        data: {
          sizeChartId: duplicate.id,
          displayOrder: row.displayOrder,
        },
      });

      // Map old column IDs to new column IDs
      const columnMap = new Map<string, string>();
      original.columns.forEach((oldCol, index) => {
        columnMap.set(oldCol.id, duplicate.columns[index].id);
      });

      await db.sizeChartCell.createMany({
        data: row.cells.map((cell) => ({
          rowId: newRow.id,
          columnId: columnMap.get(cell.columnId)!,
          valueInches: cell.valueInches,
          valueText: cell.valueText,
          valueMinInches: cell.valueMinInches,
          valueMaxInches: cell.valueMaxInches,
        })),
      });
    }

    // Fetch complete duplicate
    const completeDuplicate = await db.sizeChart.findUnique({
      where: { id: duplicate.id },
      include: {
        subcategory: { include: { category: true } },
        columns: { orderBy: { displayOrder: "asc" } },
        rows: {
          orderBy: { displayOrder: "asc" },
          include: { cells: true },
        },
      },
    });

    return NextResponse.json(completeDuplicate, { status: 201 });
  } catch (error) {
    console.error("Error duplicating size chart:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to duplicate size chart" }, { status: 500 });
  }
}
