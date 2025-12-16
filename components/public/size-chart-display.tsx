"use client";

import { formatMeasurement, formatRange } from "@/lib/conversions";
import type { SizeChartFull, UnitPreference } from "@/types";

interface SizeChartDisplayProps {
	chart: SizeChartFull;
	unit: UnitPreference;
}

export function SizeChartDisplay({ chart, unit }: SizeChartDisplayProps) {
	const formatCellValue = (
		cell: {
			valueInches: number | null;
			valueText: string | null;
			valueMinInches: number | null;
			valueMaxInches: number | null;
		},
		columnType: string
	) => {
		if (columnType === "MEASUREMENT") {
			if (cell.valueMinInches !== null && cell.valueMaxInches !== null) {
				return formatRange(cell.valueMinInches, cell.valueMaxInches, unit);
			}
			return formatMeasurement(cell.valueInches, unit);
		}
		return cell.valueText || "-";
	};

	return (
		<div className="overflow-x-auto rounded-lg border border-border">
			<table className="w-full">
				<thead>
					<tr className="border-b border-border bg-muted">
						{chart.columns.map((column) => (
							<th
								key={column.id}
								className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-foreground"
							>
								{column.name}
								{column.columnType === "MEASUREMENT" && (
									<span className="ml-1 text-xs font-normal text-muted-foreground">
										({unit === "cm" ? "cm" : "in"})
									</span>
								)}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="divide-y divide-border bg-background">
					{chart.rows.map((row) => (
						<tr
							key={row.id}
							className="hover:bg-muted/50"
						>
							{chart.columns.map((column) => {
								const cell = row.cells.find((c) => c.columnId === column.id);
								return (
									<td
										key={column.id}
										className="whitespace-nowrap px-4 py-3 text-sm text-foreground"
									>
										{cell ? formatCellValue(cell, column.columnType) : "-"}
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
