import type { ColumnType, MeasurementUnit } from "@prisma/client";

export interface EditorColumn {
  id?: string;
  name: string;
  columnType: ColumnType;
  unit: MeasurementUnit;
  displayOrder: number;
}

export interface EditorCell {
  id?: string;
  columnId?: string;
  columnIndex: number;
  valueInches: number | null;
  valueText: string | null;
  valueMinInches: number | null;
  valueMaxInches: number | null;
}

export interface EditorRow {
  id?: string;
  displayOrder: number;
  cells: EditorCell[];
}

export interface EditorState {
  name: string;
  description: string;
  subcategoryId: string;
  isPublished: boolean;
  columns: EditorColumn[];
  rows: EditorRow[];
}

export interface CellPosition {
  rowIndex: number;
  colIndex: number;
}
