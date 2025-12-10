import type {
  Category,
  Subcategory,
  SizeChart,
  SizeChartColumn,
  SizeChartRow,
  SizeChartCell,
  ColumnType,
  MeasurementUnit,
} from "@prisma/client";

export type { Category, Subcategory, SizeChart, SizeChartColumn, SizeChartRow, SizeChartCell, ColumnType, MeasurementUnit };

export type UnitPreference = "inches" | "cm";

export interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[];
}

export interface SubcategoryWithCategory extends Subcategory {
  category: Category;
}

export interface SizeChartSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isPublished: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  subcategory: {
    id: string;
    name: string;
    slug: string;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  };
  _count: {
    rows: number;
    columns: number;
  };
}

export interface SizeChartFull extends SizeChart {
  subcategory: SubcategoryWithCategory;
  columns: SizeChartColumn[];
  rows: (SizeChartRow & {
    cells: SizeChartCell[];
  })[];
}

export interface ColumnWithCells extends SizeChartColumn {
  cells: SizeChartCell[];
}

export interface RowWithCells extends SizeChartRow {
  cells: SizeChartCell[];
}

export interface CellValue {
  id?: string;
  columnId?: string;
  columnIndex?: number;
  valueInches: number | null;
  valueText: string | null;
  valueMinInches: number | null;
  valueMaxInches: number | null;
}

export interface EditorColumn {
  id?: string;
  name: string;
  columnType: ColumnType;
  unit: MeasurementUnit;
  displayOrder: number;
}

export interface EditorRow {
  id?: string;
  displayOrder: number;
  cells: CellValue[];
}

export interface EditorState {
  name: string;
  description: string | null;
  subcategoryId: string;
  columns: EditorColumn[];
  rows: EditorRow[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  details?: unknown;
}

export interface CategoryTree {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  subcategories: {
    id: string;
    name: string;
    slug: string;
    displayOrder: number;
    _count: {
      sizeCharts: number;
    };
  }[];
}
