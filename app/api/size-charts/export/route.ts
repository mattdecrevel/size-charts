import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/size-charts/export
 *
 * Export size charts to JSON format.
 * Optionally export a single chart or filter by category.
 *
 * Query params:
 * - id: Export a specific chart by ID
 * - category: Filter by category slug
 * - subcategory: Filter by subcategory slug (requires category)
 * - format: "json" (default) or "csv"
 */
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const id = searchParams.get("id");
		const category = searchParams.get("category");
		const subcategory = searchParams.get("subcategory");
		const format = searchParams.get("format") || "json";

		// Build where clause
		const where: Record<string, unknown> = {};

		if (id) {
			where.id = id;
		} else if (category || subcategory) {
			const subWhere: Record<string, unknown> = {};

			if (subcategory && category) {
				const sub = await db.subcategory.findFirst({
					where: {
						slug: subcategory,
						category: { slug: category },
					},
				});
				if (sub) {
					subWhere.subcategoryId = sub.id;
				} else {
					return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
				}
			} else if (category) {
				const cat = await db.category.findUnique({
					where: { slug: category },
					include: { subcategories: true },
				});
				if (cat) {
					subWhere.subcategoryId = { in: cat.subcategories.map((s) => s.id) };
				} else {
					return NextResponse.json({ error: "Category not found" }, { status: 404 });
				}
			}

			where.subcategories = { some: subWhere };
		}

		// Fetch charts with all related data
		const charts = await db.sizeChart.findMany({
			where,
			include: {
				subcategories: {
					include: {
						subcategory: {
							include: { category: true },
						},
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
				measurementInstructions: {
					include: { instruction: true },
					orderBy: { displayOrder: "asc" },
				},
			},
			orderBy: { name: "asc" },
		});

		if (format === "csv") {
			// CSV export
			const csv = chartsToCSV(charts);
			return new NextResponse(csv, {
				headers: {
					"Content-Type": "text/csv",
					"Content-Disposition": `attachment; filename="size-charts-${new Date().toISOString().split("T")[0]}.csv"`,
				},
			});
		}

		// JSON export
		const exportData = {
			exportedAt: new Date().toISOString(),
			version: "1.0",
			chartCount: charts.length,
			charts: charts.map(transformChartForExport),
		};

		return new NextResponse(JSON.stringify(exportData, null, 2), {
			headers: {
				"Content-Type": "application/json",
				"Content-Disposition": `attachment; filename="size-charts-${new Date().toISOString().split("T")[0]}.json"`,
			},
		});
	} catch (error) {
		console.error("Export error:", error);
		return NextResponse.json({ error: "Export failed" }, { status: 500 });
	}
}

// Transform a chart for JSON export
function transformChartForExport(chart: {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	isPublished: boolean;
	subcategories: Array<{
		subcategory: {
			slug: string;
			name: string;
			category: { slug: string; name: string };
		};
	}>;
	columns: Array<{
		id: string;
		name: string;
		columnType: string;
		displayOrder: number;
	}>;
	rows: Array<{
		id: string;
		displayOrder: number;
		cells: Array<{
			columnId: string;
			valueInches: number | null;
			valueCm: number | null;
			valueText: string | null;
			valueMinInches: number | null;
			valueMaxInches: number | null;
			valueMinCm: number | null;
			valueMaxCm: number | null;
			label: {
				key: string;
				displayValue: string;
				labelType: string;
			} | null;
		}>;
	}>;
	measurementInstructions: Array<{
		instruction: { key: string; name: string };
	}>;
}) {
	return {
		name: chart.name,
		slug: chart.slug,
		description: chart.description,
		isPublished: chart.isPublished,
		categories: chart.subcategories.map((sc) => ({
			category: sc.subcategory.category.slug,
			subcategory: sc.subcategory.slug,
		})),
		measurementInstructions: chart.measurementInstructions.map((mi) => mi.instruction.key),
		columns: chart.columns.map((col) => ({
			name: col.name,
			type: col.columnType,
		})),
		rows: chart.rows.map((row) =>
			chart.columns.reduce(
				(acc, col) => {
					const cell = row.cells.find((c) => c.columnId === col.id);
					if (!cell) {
						acc[col.name] = null;
					} else if (cell.label) {
						acc[col.name] = { labelKey: cell.label.key };
					} else if (cell.valueMinInches !== null || cell.valueMaxInches !== null) {
						acc[col.name] = {
							min: cell.valueMinInches,
							max: cell.valueMaxInches,
						};
					} else if (cell.valueInches !== null) {
						acc[col.name] = cell.valueInches;
					} else {
						acc[col.name] = cell.valueText;
					}
					return acc;
				},
				{} as Record<string, unknown>
			)
		),
	};
}

// Convert charts to CSV format
function chartsToCSV(
	charts: Array<{
		name: string;
		slug: string;
		columns: Array<{ id: string; name: string; columnType: string }>;
		rows: Array<{
			cells: Array<{
				columnId: string;
				valueInches: number | null;
				valueCm: number | null;
				valueText: string | null;
				valueMinInches: number | null;
				valueMaxInches: number | null;
				label: { displayValue: string } | null;
			}>;
		}>;
	}>
): string {
	const lines: string[] = [];

	for (const chart of charts) {
		// Chart header
		lines.push(`# ${chart.name} (${chart.slug})`);

		// Column headers
		const headers = chart.columns.map((c) => c.name);
		lines.push(headers.map(escapeCSV).join(","));

		// Rows
		for (const row of chart.rows) {
			const values = chart.columns.map((col) => {
				const cell = row.cells.find((c) => c.columnId === col.id);
				if (!cell) return "";
				if (cell.label) return cell.label.displayValue;
				if (cell.valueMinInches !== null || cell.valueMaxInches !== null) {
					return `${cell.valueMinInches ?? ""}-${cell.valueMaxInches ?? ""}`;
				}
				if (cell.valueInches !== null) return cell.valueInches.toString();
				return cell.valueText || "";
			});
			lines.push(values.map(escapeCSV).join(","));
		}

		lines.push(""); // Blank line between charts
	}

	return lines.join("\n");
}

function escapeCSV(value: string): string {
	if (value.includes(",") || value.includes('"') || value.includes("\n")) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}
