import type {
  Category,
  Subcategory,
  SizeChart,
  SizeChartColumn,
  SizeChartRow,
  SizeChartCell,
  SizeChartSubcategory,
  SizeLabel,
  ColumnType,
  LabelType,
} from "@prisma/client";

export type {
  Category,
  Subcategory,
  SizeChart,
  SizeChartColumn,
  SizeChartRow,
  SizeChartCell,
  SizeChartSubcategory,
  SizeLabel,
  ColumnType,
  LabelType,
};

export type UnitPreference = "inches" | "cm";

export interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[];
}

export interface SubcategoryWithCategory extends Subcategory {
  category: Category;
}

export interface SizeChartSubcategoryWithDetails extends SizeChartSubcategory {
  subcategory: SubcategoryWithCategory;
}

export interface SizeChartSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  subcategories: SizeChartSubcategoryWithDetails[];
  _count: {
    rows: number;
    columns: number;
  };
}

export interface SizeChartFull extends SizeChart {
  subcategories: SizeChartSubcategoryWithDetails[];
  // For backward compatibility with public pages
  subcategory?: SubcategoryWithCategory;
  columns: SizeChartColumn[];
  rows: (SizeChartRow & {
    cells: (SizeChartCell & { label?: SizeLabel | null })[];
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
  valueCm: number | null;
  valueText: string | null;
  valueMinInches: number | null;
  valueMaxInches: number | null;
  valueMinCm: number | null;
  valueMaxCm: number | null;
  labelId?: string | null;
}

export interface EditorColumn {
  id?: string;
  name: string;
  columnType: ColumnType;
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
  subcategoryIds: string[];
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
