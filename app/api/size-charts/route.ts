import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/utils";
import { createSizeChartSchema, sizeChartFiltersSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters = sizeChartFiltersSchema.parse({
      categoryId: searchParams.get("categoryId") || undefined,
      subcategoryId: searchParams.get("subcategoryId") || undefined,
      search: searchParams.get("search") || undefined,
      isPublished: searchParams.get("isPublished") === "true" ? true :
                   searchParams.get("isPublished") === "false" ? false : undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20,
    });

    // Build where clause for many-to-many relationship
    const where = {
      ...(filters.subcategoryId && {
        subcategories: {
          some: { subcategoryId: filters.subcategoryId }
        }
      }),
      ...(filters.categoryId && {
        subcategories: {
          some: {
            subcategory: { categoryId: filters.categoryId }
          }
        }
      }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: "insensitive" as const } },
          { description: { contains: filters.search, mode: "insensitive" as const } },
          { slug: { contains: filters.search, mode: "insensitive" as const } },
        ]
      }),
      ...(filters.isPublished !== undefined && { isPublished: filters.isPublished }),
    };

    const [sizeCharts, total] = await Promise.all([
      db.sizeChart.findMany({
        where,
        include: {
          subcategories: {
            include: {
              subcategory: {
                include: { category: true },
              },
            },
            orderBy: { displayOrder: "asc" },
          },
          _count: { select: { rows: true, columns: true } },
        },
        orderBy: [
          { name: "asc" },
        ],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      db.sizeChart.count({ where }),
    ]);

    return NextResponse.json({
      data: sizeCharts,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    });
  } catch (error) {
    console.error("Error fetching size charts:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid query parameters", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to fetch size charts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createSizeChartSchema.parse(body);

    // Use user-provided slug or auto-generate from name
    const slug = data.slug || generateSlug(data.name);

    // Check for duplicate slug (now globally unique)
    const existing = await db.sizeChart.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A size chart with this ID/slug already exists" },
        { status: 409 }
      );
    }

    // Create the size chart with columns
    const sizeChart = await db.sizeChart.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        columns: {
          create: data.columns.map((col, index) => ({
            name: col.name,
            columnType: col.columnType,
            displayOrder: col.displayOrder ?? index,
          })),
        },
        // Create many-to-many relationships
        subcategories: data.subcategoryIds ? {
          create: data.subcategoryIds.map((subcategoryId, index) => ({
            subcategoryId,
            displayOrder: index,
          })),
        } : undefined,
      },
      include: {
        columns: { orderBy: { displayOrder: "asc" } },
        subcategories: {
          include: {
            subcategory: { include: { category: true } },
          },
        },
      },
    });

    // Create rows and cells if provided
    if (data.rows && data.rows.length > 0) {
      for (const rowData of data.rows) {
        const row = await db.sizeChartRow.create({
          data: {
            sizeChartId: sizeChart.id,
            displayOrder: rowData.displayOrder,
          },
        });

        if (rowData.cells && rowData.cells.length > 0) {
          await db.sizeChartCell.createMany({
            data: rowData.cells.map((cell) => ({
              rowId: row.id,
              columnId: sizeChart.columns[cell.columnIndex].id,
              valueInches: cell.valueInches ?? null,
              valueCm: cell.valueCm ?? null,
              valueText: cell.valueText ?? null,
              valueMinInches: cell.valueMinInches ?? null,
              valueMaxInches: cell.valueMaxInches ?? null,
              valueMinCm: cell.valueMinCm ?? null,
              valueMaxCm: cell.valueMaxCm ?? null,
              labelId: cell.labelId ?? null,
            })),
          });
        }
      }
    }

    // Fetch the complete size chart
    const completeSizeChart = await db.sizeChart.findUnique({
      where: { id: sizeChart.id },
      include: {
        subcategories: {
          include: {
            subcategory: { include: { category: true } },
          },
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

    return NextResponse.json(completeSizeChart, { status: 201 });
  } catch (error) {
    console.error("Error creating size chart:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create size chart" }, { status: 500 });
  }
}
