import type { ColumnType, LabelType } from "@prisma/client";

export interface EditorColumn {
  id?: string;
  name: string;
  columnType: ColumnType;
  labelType?: LabelType | null;
  displayOrder: number;
}

export interface EditorCell {
  id?: string;
  columnId?: string;
  columnIndex: number;
  valueInches: number | null;
  valueCm: number | null;
  valueText: string | null;
  valueMinInches: number | null;
  valueMaxInches: number | null;
  valueMinCm: number | null;
  valueMaxCm: number | null;
  labelId?: string | null;
}

export interface EditorRow {
  id?: string;
  displayOrder: number;
  cells: EditorCell[];
}

export interface EditorState {
  name: string;
  description: string;
  subcategoryIds: string[];
  isPublished: boolean;
  columns: EditorColumn[];
  rows: EditorRow[];
}

export interface CellPosition {
  rowIndex: number;
  colIndex: number;
}
