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
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
            {chart.columns.map((column) => (
              <th
                key={column.id}
                className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              >
                {column.name}
                {column.columnType === "MEASUREMENT" && (
                  <span className="ml-1 text-xs font-normal text-zinc-500">
                    ({unit === "cm" ? "cm" : "in"})
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {chart.rows.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              {chart.columns.map((column) => {
                const cell = row.cells.find((c) => c.columnId === column.id);
                return (
                  <td
                    key={column.id}
                    className="whitespace-nowrap px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300"
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
