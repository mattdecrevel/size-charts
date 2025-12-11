import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

// Schema for import validation
const ImportChartSchema = z.object({
	name: z.string().min(1),
	slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
	description: z.string().nullable().optional(),
	isPublished: z.boolean().optional().default(false),
	categories: z
		.array(
			z.object({
				category: z.string(),
				subcategory: z.string(),
			})
		)
		.min(1),
	measurementInstructions: z.array(z.string()).optional().default([]),
	columns: z
		.array(
			z.object({
				name: z.string(),
				type: z.enum([
					"MEASUREMENT",
					"SIZE_LABEL",
					"REGIONAL_SIZE",
					"BAND_SIZE",
					"CUP_SIZE",
					"SHOE_SIZE",
					"TEXT",
				]),
			})
		)
		.min(1),
	rows: z.array(z.record(z.string(), z.unknown())).min(1),
});

const ImportSchema = z.object({
	version: z.string().optional(),
	charts: z.array(ImportChartSchema),
});

/**
 * POST /api/size-charts/import
 *
 * Import size charts from JSON format.
 * Can create new charts or update existing ones.
 *
 * Body: { charts: [...] }
 *
 * Query params:
 * - mode: "create" (default) - fail if chart exists
 *         "upsert" - update existing, create new
 *         "skip" - skip existing, create new only
 */
export async function POST(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const mode = searchParams.get("mode") || "create";

		const body = await request.json();
		const validation = ImportSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{
					error: "Invalid import format",
					details: validation.error.issues,
				},
				{ status: 400 }
			);
		}

		const { charts } = validation.data;
		const results: Array<{
			slug: string;
			status: "created" | "updated" | "skipped" | "error";
			error?: string;
		}> = [];

		for (const chartData of charts) {
			try {
				// Check if chart exists
				const existing = await db.sizeChart.findUnique({
					where: { slug: chartData.slug },
				});

				if (existing) {
					if (mode === "create") {
						results.push({
							slug: chartData.slug,
							status: "error",
							error: "Chart already exists",
						});
						continue;
					}
					if (mode === "skip") {
						results.push({ slug: chartData.slug, status: "skipped" });
						continue;
					}
					// mode === "upsert" - delete and recreate
					await db.sizeChart.delete({ where: { id: existing.id } });
				}

				// Find subcategories
				const subcategoryIds: string[] = [];
				for (const cat of chartData.categories) {
					const subcategory = await db.subcategory.findFirst({
						where: {
							slug: cat.subcategory,
							category: { slug: cat.category },
						},
					});
					if (subcategory) {
						subcategoryIds.push(subcategory.id);
					}
				}

				if (subcategoryIds.length === 0) {
					results.push({
						slug: chartData.slug,
						status: "error",
						error: "No valid categories found",
					});
					continue;
				}

				// Find measurement instructions
				const instructionIds: string[] = [];
				for (const key of chartData.measurementInstructions) {
					const instruction = await db.measurementInstruction.findUnique({
						where: { key },
					});
					if (instruction) {
						instructionIds.push(instruction.id);
					}
				}

				// Create the chart
				const chart = await db.sizeChart.create({
					data: {
						name: chartData.name,
						slug: chartData.slug,
						description: chartData.description || null,
						isPublished: chartData.isPublished,
						subcategories: {
							create: subcategoryIds.map((id, index) => ({
								subcategoryId: id,
								displayOrder: index,
							})),
						},
						measurementInstructions: {
							create: instructionIds.map((id, index) => ({
								instructionId: id,
								displayOrder: index,
							})),
						},
					},
				});

				// Create columns
				const columnMap = new Map<string, string>();
				for (let i = 0; i < chartData.columns.length; i++) {
					const colData = chartData.columns[i];
					const column = await db.sizeChartColumn.create({
						data: {
							sizeChartId: chart.id,
							name: colData.name,
							columnType: colData.type,
							displayOrder: i,
						},
					});
					columnMap.set(colData.name, column.id);
				}

				// Create rows and cells
				for (let rowIndex = 0; rowIndex < chartData.rows.length; rowIndex++) {
					const rowData = chartData.rows[rowIndex];

					const row = await db.sizeChartRow.create({
						data: {
							sizeChartId: chart.id,
							displayOrder: rowIndex,
						},
					});

					// Create cells for each column
					for (const [colName, colId] of columnMap) {
						const cellValue = rowData[colName];
						if (cellValue === null || cellValue === undefined) continue;

						const cellData: {
							rowId: string;
							columnId: string;
							valueInches?: number;
							valueCm?: number;
							valueText?: string;
							valueMinInches?: number;
							valueMaxInches?: number;
							valueMinCm?: number;
							valueMaxCm?: number;
							labelId?: string;
						} = {
							rowId: row.id,
							columnId: colId,
						};

						if (typeof cellValue === "number") {
							// Single measurement value
							cellData.valueInches = cellValue;
							cellData.valueCm = Math.round(cellValue * 2.54 * 10) / 10;
						} else if (typeof cellValue === "string") {
							// Text value
							cellData.valueText = cellValue;
						} else if (typeof cellValue === "object") {
							const obj = cellValue as Record<string, unknown>;
							if ("labelKey" in obj && typeof obj.labelKey === "string") {
								// Label reference
								const label = await db.sizeLabel.findUnique({
									where: { key: obj.labelKey },
								});
								if (label) {
									cellData.labelId = label.id;
								} else {
									cellData.valueText = obj.labelKey;
								}
							} else if ("min" in obj || "max" in obj) {
								// Range value
								const min = typeof obj.min === "number" ? obj.min : null;
								const max = typeof obj.max === "number" ? obj.max : null;
								if (min !== null) {
									cellData.valueMinInches = min;
									cellData.valueMinCm = Math.round(min * 2.54 * 10) / 10;
								}
								if (max !== null) {
									cellData.valueMaxInches = max;
									cellData.valueMaxCm = Math.round(max * 2.54 * 10) / 10;
								}
							}
						}

						await db.sizeChartCell.create({ data: cellData });
					}
				}

				results.push({
					slug: chartData.slug,
					status: existing ? "updated" : "created",
				});
			} catch (error) {
				results.push({
					slug: chartData.slug,
					status: "error",
					error: error instanceof Error ? error.message : "Unknown error",
				});
			}
		}

		const created = results.filter((r) => r.status === "created").length;
		const updated = results.filter((r) => r.status === "updated").length;
		const skipped = results.filter((r) => r.status === "skipped").length;
		const errors = results.filter((r) => r.status === "error").length;

		return NextResponse.json({
			success: errors === 0,
			summary: { created, updated, skipped, errors },
			results,
		});
	} catch (error) {
		console.error("Import error:", error);
		return NextResponse.json({ error: "Import failed" }, { status: 500 });
	}
}
