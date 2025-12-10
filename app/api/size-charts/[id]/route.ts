import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateSizeChartSchema } from "@/lib/validations";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const sizeChart = await db.sizeChart.findUnique({
      where: { id },
      include: {
        subcategories: {
          include: {
            subcategory: { include: { category: true } },
          },
          orderBy: { displayOrder: "asc" },
        },
        columns: { orderBy: { displayOrder: "asc" } },
        rows: {
          orderBy: { displayOrder: "asc" },
          include: {
            cells: {
              include: { label: true },
            },
          },
        },
      },
    });

    if (!sizeChart) {
      return NextResponse.json({ error: "Size chart not found" }, { status: 404 });
    }

    return NextResponse.json(sizeChart);
  } catch (error) {
    console.error("Error fetching size chart:", error);
    return NextResponse.json({ error: "Failed to fetch size chart" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateSizeChartSchema.parse(body);

    // Check if size chart exists
    const existing = await db.sizeChart.findUnique({
      where: { id },
      include: {
        columns: true,
        rows: { include: { cells: true } },
        subcategories: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Size chart not found" }, { status: 404 });
    }

    // Update basic info
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    // Check for duplicate slug (now globally unique)
    if (data.slug !== undefined && data.slug !== existing.slug) {
      const duplicateSlug = await db.sizeChart.findFirst({
        where: {
          slug: data.slug,
          id: { not: id },
        },
      });
      if (duplicateSlug) {
        return NextResponse.json(
          { error: "A size chart with this ID already exists" },
          { status: 409 }
        );
      }
      updateData.slug = data.slug;
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

    // Update the size chart
    await db.sizeChart.update({
      where: { id },
      data: updateData,
    });

    // Handle subcategory updates (many-to-many)
    if (data.subcategoryIds !== undefined) {
      // Delete existing relationships
      await db.sizeChartSubcategory.deleteMany({
        where: { sizeChartId: id },
      });

      // Create new relationships
      if (data.subcategoryIds.length > 0) {
        await db.sizeChartSubcategory.createMany({
          data: data.subcategoryIds.map((subcategoryId, index) => ({
            sizeChartId: id,
            subcategoryId,
            displayOrder: index,
          })),
        });
      }
    }

    // Handle columns update
    if (data.columns) {
      const existingColumnIds = existing.columns.map((c) => c.id);
      const newColumnIds = data.columns.filter((c) => c.id).map((c) => c.id!);

      // Delete removed columns
      const columnsToDelete = existingColumnIds.filter((cid) => !newColumnIds.includes(cid));
      if (columnsToDelete.length > 0) {
        await db.sizeChartColumn.deleteMany({
          where: { id: { in: columnsToDelete } },
        });
      }

      // Update or create columns
      for (const col of data.columns) {
        if (col.id) {
          await db.sizeChartColumn.update({
            where: { id: col.id },
            data: {
              name: col.name,
              columnType: col.columnType,
              displayOrder: col.displayOrder,
            },
          });
        } else {
          await db.sizeChartColumn.create({
            data: {
              sizeChartId: id,
              name: col.name,
              columnType: col.columnType,
              displayOrder: col.displayOrder,
            },
          });
        }
      }
    }

    // Handle rows update
    if (data.rows) {
      const existingRowIds = existing.rows.map((r) => r.id);
      const newRowIds = data.rows.filter((r) => r.id).map((r) => r.id!);

      // Delete removed rows
      const rowsToDelete = existingRowIds.filter((rid) => !newRowIds.includes(rid));
      if (rowsToDelete.length > 0) {
        await db.sizeChartRow.deleteMany({
          where: { id: { in: rowsToDelete } },
        });
      }

      // Get current columns for cell creation
      const currentColumns = await db.sizeChartColumn.findMany({
        where: { sizeChartId: id },
        orderBy: { displayOrder: "asc" },
      });

      // Update or create rows and cells
      for (const rowData of data.rows) {
        if (rowData.id) {
          // Update existing row
          await db.sizeChartRow.update({
            where: { id: rowData.id },
            data: { displayOrder: rowData.displayOrder },
          });

          // Delete existing cells for this row
          await db.sizeChartCell.deleteMany({
            where: { rowId: rowData.id },
          });

          // Create new cells
          if (rowData.cells && rowData.cells.length > 0) {
            await db.sizeChartCell.createMany({
              data: rowData.cells.map((cell) => {
                const columnId = cell.columnId || currentColumns[cell.columnIndex || 0]?.id;
                return {
                  rowId: rowData.id!,
                  columnId: columnId!,
                  valueInches: cell.valueInches ?? null,
                  valueCm: cell.valueCm ?? null,
                  valueText: cell.valueText ?? null,
                  valueMinInches: cell.valueMinInches ?? null,
                  valueMaxInches: cell.valueMaxInches ?? null,
                  valueMinCm: cell.valueMinCm ?? null,
                  valueMaxCm: cell.valueMaxCm ?? null,
                  labelId: cell.labelId ?? null,
                };
              }),
            });
          }
        } else {
          // Create new row
          const newRow = await db.sizeChartRow.create({
            data: {
              sizeChartId: id,
              displayOrder: rowData.displayOrder,
            },
          });

          // Create cells for new row
          if (rowData.cells && rowData.cells.length > 0) {
            await db.sizeChartCell.createMany({
              data: rowData.cells.map((cell) => {
                const columnId = cell.columnId || currentColumns[cell.columnIndex || 0]?.id;
                return {
                  rowId: newRow.id,
                  columnId: columnId!,
                  valueInches: cell.valueInches ?? null,
                  valueCm: cell.valueCm ?? null,
                  valueText: cell.valueText ?? null,
                  valueMinInches: cell.valueMinInches ?? null,
                  valueMaxInches: cell.valueMaxInches ?? null,
                  valueMinCm: cell.valueMinCm ?? null,
                  valueMaxCm: cell.valueMaxCm ?? null,
                  labelId: cell.labelId ?? null,
                };
              }),
            });
          }
        }
      }
    }

    // Fetch and return updated size chart
    const updatedSizeChart = await db.sizeChart.findUnique({
      where: { id },
      include: {
        subcategories: {
          include: {
            subcategory: { include: { category: true } },
          },
          orderBy: { displayOrder: "asc" },
        },
        columns: { orderBy: { displayOrder: "asc" } },
        rows: {
          orderBy: { displayOrder: "asc" },
          include: {
            cells: {
              include: { label: true },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedSizeChart);
  } catch (error) {
    console.error("Error updating size chart:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update size chart" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await db.sizeChart.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Size chart not found" }, { status: 404 });
    }

    await db.sizeChart.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting size chart:", error);
    return NextResponse.json({ error: "Failed to delete size chart" }, { status: 500 });
  }
}
