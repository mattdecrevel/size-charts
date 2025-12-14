import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTemplateById, CellValue, MeasurementRange, MeasurementValue } from "@/prisma/templates";
import { generateSlug } from "@/lib/utils";
import { z } from "zod";
import { ColumnType } from "@prisma/client";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// Validation schema for applying a template
const applyTemplateSchema = z.object({
  name: z.string().optional(), // Optional - will use template name if not provided
  slug: z.string().optional(),
  description: z.string().optional(),
  subcategoryIds: z.array(z.string()).default([]),
  variantKey: z.string().optional(), // For templates with variants (e.g., "mens", "womens", "youth")
  isPublished: z.boolean().default(false),
});

// Helper to convert inches to cm
function inToCm(inches: number): number {
  return Math.round(inches * 2.54 * 10) / 10;
}

// Map template column types to Prisma ColumnType enum
function mapColumnType(type: string): ColumnType {
  switch (type) {
    case "SIZE_LABEL":
      return ColumnType.SIZE_LABEL;
    case "SHOE_SIZE":
      return ColumnType.SHOE_SIZE;
    case "MEASUREMENT":
      return ColumnType.MEASUREMENT;
    case "BAND_SIZE":
      return ColumnType.BAND_SIZE;
    case "CUP_SIZE":
      return ColumnType.CUP_SIZE;
    case "TEXT":
    default:
      return ColumnType.TEXT;
  }
}

// Check if value is a measurement range
function isMeasurementRange(value: CellValue): value is MeasurementRange {
  return typeof value === "object" && "min" in value && "max" in value;
}

// Check if value is a single measurement value
function isMeasurementValue(value: CellValue): value is MeasurementValue {
  return typeof value === "object" && "value" in value;
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const template = getTemplateById(id);

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = applyTemplateSchema.parse(body);

    // Use template name if not provided, with variant suffix if applicable
    const chartName = data.name || (
      data.variantKey && template.variants?.[data.variantKey]
        ? `${template.name} (${template.variants[data.variantKey].name})`
        : template.name
    );

    // Generate slug if not provided
    const slug = data.slug || generateSlug(chartName);

    // Check if slug already exists
    const existingChart = await db.sizeChart.findUnique({
      where: { slug },
    });

    if (existingChart) {
      return NextResponse.json(
        { error: "A size chart with this slug already exists" },
        { status: 400 }
      );
    }

    // Determine which rows to use (default or variant)
    let templateRows = template.rows;
    if (data.variantKey && template.variants && template.variants[data.variantKey]) {
      templateRows = template.variants[data.variantKey].rows;
    }

    // Create the size chart in a transaction
    const sizeChart = await db.$transaction(async (tx) => {
      // Create the chart
      const chart = await tx.sizeChart.create({
        data: {
          name: chartName,
          slug,
          description: data.description || template.description,
          isPublished: data.isPublished,
        },
      });

      // Create subcategory relationships
      if (data.subcategoryIds.length > 0) {
        await Promise.all(
          data.subcategoryIds.map((subcategoryId, index) =>
            tx.sizeChartSubcategory.create({
              data: {
                sizeChartId: chart.id,
                subcategoryId,
                displayOrder: index,
              },
            })
          )
        );
      }

      // Create columns
      const columns = template.columns.map((col) => ({
        name: col.name,
        columnType: mapColumnType(col.type),
      }));

      const createdColumns = await Promise.all(
        columns.map((col, index) =>
          tx.sizeChartColumn.create({
            data: {
              name: col.name,
              columnType: col.columnType,
              displayOrder: index,
              sizeChartId: chart.id,
            },
          })
        )
      );

      // Create rows and cells
      for (let rowIndex = 0; rowIndex < templateRows.length; rowIndex++) {
        const rowData = templateRows[rowIndex];
        const row = await tx.sizeChartRow.create({
          data: {
            sizeChartId: chart.id,
            displayOrder: rowIndex,
          },
        });

        const cellData = columns.map((col, colIndex) => {
          const cellValue = rowData[col.name];

          let valueText: string | null = null;
          let valueInches: number | null = null;
          let valueCm: number | null = null;
          let valueMinInches: number | null = null;
          let valueMaxInches: number | null = null;
          let valueMinCm: number | null = null;
          let valueMaxCm: number | null = null;

          if (cellValue !== undefined) {
            if (typeof cellValue === "string") {
              valueText = cellValue;
            } else if (isMeasurementRange(cellValue)) {
              valueMinInches = cellValue.min;
              valueMaxInches = cellValue.max;
              valueMinCm = inToCm(cellValue.min);
              valueMaxCm = inToCm(cellValue.max);
            } else if (isMeasurementValue(cellValue)) {
              valueInches = cellValue.value;
              valueCm = inToCm(cellValue.value);
            }
          }

          return {
            rowId: row.id,
            columnId: createdColumns[colIndex].id,
            labelId: null,
            valueText,
            valueInches,
            valueCm,
            valueMinInches,
            valueMaxInches,
            valueMinCm,
            valueMaxCm,
          };
        });

        await tx.sizeChartCell.createMany({ data: cellData });
      }

      // Link measurement instructions
      if (template.measurementInstructions.length > 0) {
        const instructions = await tx.measurementInstruction.findMany({
          where: {
            key: { in: template.measurementInstructions },
          },
        });

        await Promise.all(
          instructions.map((inst, index) =>
            tx.sizeChartMeasurementInstruction.create({
              data: {
                sizeChartId: chart.id,
                instructionId: inst.id,
                displayOrder: index,
              },
            })
          )
        );
      }

      return chart;
    });

    // Fetch the complete chart with all relations
    const completeChart = await db.sizeChart.findUnique({
      where: { id: sizeChart.id },
      include: {
        columns: { orderBy: { displayOrder: "asc" } },
        rows: {
          orderBy: { displayOrder: "asc" },
          include: {
            cells: {
              include: {
                column: true,
                label: true,
              },
            },
          },
        },
        subcategories: {
          include: {
            subcategory: {
              include: { category: true },
            },
          },
        },
        measurementInstructions: {
          include: { instruction: true },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return NextResponse.json({ sizeChart: completeChart }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error applying template:", error);
    return NextResponse.json(
      { error: "Failed to apply template" },
      { status: 500 }
    );
  }
}
