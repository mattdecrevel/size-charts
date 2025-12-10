"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { Cell } from "./cell";
import { ColumnConfig } from "./column-config";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { EditorState, EditorColumn, EditorRow, EditorCell, CellPosition } from "./types";
import type { ColumnType, MeasurementUnit } from "@prisma/client";

interface EditorProps {
  state: EditorState;
  onChange: (state: EditorState) => void;
}

export function SizeChartEditor({ state, onChange }: EditorProps) {
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);

  const updateColumn = useCallback(
    (index: number, column: EditorColumn) => {
      const newColumns = [...state.columns];
      newColumns[index] = column;
      onChange({ ...state, columns: newColumns });
    },
    [state, onChange]
  );

  const deleteColumn = useCallback(
    (index: number) => {
      const newColumns = state.columns.filter((_, i) => i !== index);
      const newRows = state.rows.map((row) => ({
        ...row,
        cells: row.cells.filter((cell) => cell.columnIndex !== index).map((cell) => ({
          ...cell,
          columnIndex: cell.columnIndex > index ? cell.columnIndex - 1 : cell.columnIndex,
        })),
      }));
      onChange({
        ...state,
        columns: newColumns.map((col, i) => ({ ...col, displayOrder: i })),
        rows: newRows,
      });
    },
    [state, onChange]
  );

  const addColumn = useCallback(() => {
    const newColumn: EditorColumn = {
      name: `Column ${state.columns.length + 1}`,
      columnType: "SIZE_LABEL",
      unit: "NONE",
      displayOrder: state.columns.length,
    };
    const newRows = state.rows.map((row) => ({
      ...row,
      cells: [
        ...row.cells,
        {
          columnIndex: state.columns.length,
          valueInches: null,
          valueText: null,
          valueMinInches: null,
          valueMaxInches: null,
        },
      ],
    }));
    onChange({
      ...state,
      columns: [...state.columns, newColumn],
      rows: newRows,
    });
  }, [state, onChange]);

  const addRow = useCallback(() => {
    const newRow: EditorRow = {
      displayOrder: state.rows.length,
      cells: state.columns.map((_, index) => ({
        columnIndex: index,
        valueInches: null,
        valueText: null,
        valueMinInches: null,
        valueMaxInches: null,
      })),
    };
    onChange({ ...state, rows: [...state.rows, newRow] });
  }, [state, onChange]);

  const deleteRow = useCallback(
    (index: number) => {
      const newRows = state.rows
        .filter((_, i) => i !== index)
        .map((row, i) => ({ ...row, displayOrder: i }));
      onChange({ ...state, rows: newRows });
    },
    [state, onChange]
  );

  const updateCell = useCallback(
    (rowIndex: number, cellIndex: number, cell: EditorCell) => {
      const newRows = [...state.rows];
      newRows[rowIndex] = {
        ...newRows[rowIndex],
        cells: newRows[rowIndex].cells.map((c, i) => (i === cellIndex ? cell : c)),
      };
      onChange({ ...state, rows: newRows });
    },
    [state, onChange]
  );

  const handleNavigate = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (!editingCell) return;

      let { rowIndex, colIndex } = editingCell;

      switch (direction) {
        case "up":
          rowIndex = Math.max(0, rowIndex - 1);
          break;
        case "down":
          rowIndex = Math.min(state.rows.length - 1, rowIndex + 1);
          break;
        case "left":
          colIndex = Math.max(0, colIndex - 1);
          break;
        case "right":
          colIndex = Math.min(state.columns.length - 1, colIndex + 1);
          break;
      }

      setEditingCell({ rowIndex, colIndex });
    },
    [editingCell, state.rows.length, state.columns.length]
  );

  if (state.columns.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
        <p className="mb-4 text-zinc-600 dark:text-zinc-400">
          No columns defined yet. Add your first column to start building the size chart.
        </p>
        <Button onClick={addColumn}>
          <Plus className="h-4 w-4" />
          Add Column
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-10 border-b border-r border-zinc-200 bg-zinc-50 p-0 dark:border-zinc-700 dark:bg-zinc-800/50" />
              {state.columns.map((column, index) => (
                <th
                  key={index}
                  className="min-w-[120px] border-b border-r border-zinc-200 p-0 dark:border-zinc-700"
                >
                  <ColumnConfig
                    column={column}
                    onUpdate={(col) => updateColumn(index, col)}
                    onDelete={() => deleteColumn(index)}
                    canDelete={state.columns.length > 1}
                  />
                </th>
              ))}
              <th className="w-24 border-b border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-800/50">
                <Button variant="ghost" size="sm" onClick={addColumn}>
                  <Plus className="h-4 w-4" />
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {state.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="group">
                <td className="border-b border-r border-zinc-200 bg-zinc-50 p-0 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
                  <div className="flex items-center justify-center gap-1 px-1">
                    <span className="text-xs text-zinc-400">{rowIndex + 1}</span>
                    <button
                      onClick={() => deleteRow(rowIndex)}
                      className="invisible rounded p-0.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 group-hover:visible dark:hover:bg-red-900/20"
                      title="Delete row"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </td>
                {row.cells.map((cell, colIndex) => {
                  const column = state.columns[colIndex];
                  if (!column) return null;

                  const isEditing =
                    editingCell?.rowIndex === rowIndex && editingCell?.colIndex === colIndex;

                  return (
                    <td
                      key={colIndex}
                      className={cn(
                        "border-b border-r border-zinc-200 p-0 dark:border-zinc-700",
                        isEditing && "ring-2 ring-inset ring-zinc-500"
                      )}
                    >
                      <Cell
                        cell={cell}
                        columnType={column.columnType}
                        unit={column.unit}
                        isEditing={isEditing}
                        onStartEdit={() => setEditingCell({ rowIndex, colIndex })}
                        onChange={(newCell) => updateCell(rowIndex, colIndex, newCell)}
                        onFinishEdit={() => setEditingCell(null)}
                        onNavigate={handleNavigate}
                      />
                    </td>
                  );
                })}
                <td className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button variant="outline" onClick={addRow}>
        <Plus className="h-4 w-4" />
        Add Row
      </Button>
    </div>
  );
}
