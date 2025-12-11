import { z } from "zod";

export const columnTypeEnum = z.enum([
  "MEASUREMENT",
  "SIZE_LABEL",
  "REGIONAL_SIZE",
  "BAND_SIZE",
  "CUP_SIZE",
  "SHOE_SIZE",
  "TEXT",
]);

export const labelTypeEnum = z.enum([
  "ALPHA_SIZE",
  "NUMERIC_SIZE",
  "YOUTH_SIZE",
  "TODDLER_SIZE",
  "INFANT_SIZE",
  "BAND_SIZE",
  "CUP_SIZE",
  "SHOE_SIZE_US",
  "SHOE_SIZE_EU",
  "SHOE_SIZE_UK",
  "REGIONAL",
  "CUSTOM",
]);

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  slug: z.string().min(1).max(50).optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createSubcategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1).max(100).optional(),
  categoryId: z.string().cuid("Invalid category"),
  displayOrder: z.number().int().min(0).optional(),
});

export const updateSubcategorySchema = createSubcategorySchema.partial();

// Size Label schemas
export const createSizeLabelSchema = z.object({
  key: z.string().min(1, "Key is required").max(50).regex(/^[A-Z0-9_]+$/, "Key must be uppercase with underscores"),
  displayValue: z.string().min(1, "Display value is required").max(50),
  labelType: labelTypeEnum,
  sortOrder: z.number().int().min(0).optional(),
  description: z.string().max(200).nullable().optional(),
});

export const updateSizeLabelSchema = createSizeLabelSchema.partial();

export const columnSchema = z.object({
  name: z.string().min(1, "Column name is required").max(100),
  columnType: columnTypeEnum,
  labelType: labelTypeEnum.nullable().optional(),
  displayOrder: z.number().int().min(0),
});

export const cellSchema = z.object({
  columnIndex: z.number().int().min(0),
  valueInches: z.number().nullable().optional(),
  valueCm: z.number().nullable().optional(),
  valueText: z.string().nullable().optional(),
  valueMinInches: z.number().nullable().optional(),
  valueMaxInches: z.number().nullable().optional(),
  valueMinCm: z.number().nullable().optional(),
  valueMaxCm: z.number().nullable().optional(),
  labelId: z.string().cuid().nullable().optional(),
});

export const rowSchema = z.object({
  displayOrder: z.number().int().min(0),
  cells: z.array(cellSchema),
});

export const slugSchema = z
  .string()
  .min(1, "Chart ID is required")
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Chart ID must be lowercase, with hyphens only (e.g., 'regular-fit')");

export const createSizeChartSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: slugSchema.optional(),
  subcategoryIds: z.array(z.string().cuid()).optional(), // Many-to-many
  description: z.string().max(500).optional(),
  columns: z.array(columnSchema).min(1, "At least one column is required"),
  rows: z.array(rowSchema).optional().default([]),
});

export const updateSizeChartSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: slugSchema.optional(),
  description: z.string().max(500).nullable().optional(),
  isPublished: z.boolean().optional(),
  subcategoryIds: z.array(z.string().cuid()).optional(), // Update many-to-many
  columns: z.array(
    z.object({
      id: z.string().cuid().optional(),
      name: z.string().min(1).max(100),
      columnType: columnTypeEnum,
      labelType: labelTypeEnum.nullable().optional(),
      displayOrder: z.number().int().min(0),
    })
  ).optional(),
  rows: z.array(
    z.object({
      id: z.string().cuid().optional(),
      displayOrder: z.number().int().min(0),
      cells: z.array(
        z.object({
          id: z.string().cuid().optional(),
          columnId: z.string().cuid().optional(),
          columnIndex: z.number().int().min(0).optional(),
          valueInches: z.number().nullable().optional(),
          valueCm: z.number().nullable().optional(),
          valueText: z.string().nullable().optional(),
          valueMinInches: z.number().nullable().optional(),
          valueMaxInches: z.number().nullable().optional(),
          valueMinCm: z.number().nullable().optional(),
          valueMaxCm: z.number().nullable().optional(),
          labelId: z.string().cuid().nullable().optional(),
        })
      ),
    })
  ).optional(),
});

export const bulkOperationSchema = z.object({
  operation: z.enum(["delete", "publish", "unpublish"]),
  ids: z.array(z.string().cuid()).min(1, "At least one ID is required"),
});

export const duplicateSizeChartSchema = z.object({
  id: z.string().cuid("Invalid size chart ID"),
  name: z.string().min(1).max(100).optional(),
});

export const sizeChartFiltersSchema = z.object({
  categoryId: z.string().cuid().optional(),
  subcategoryId: z.string().cuid().optional(),
  search: z.string().optional(),
  isPublished: z.boolean().optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateSubcategoryInput = z.infer<typeof createSubcategorySchema>;
export type UpdateSubcategoryInput = z.infer<typeof updateSubcategorySchema>;
export type CreateSizeLabelInput = z.infer<typeof createSizeLabelSchema>;
export type UpdateSizeLabelInput = z.infer<typeof updateSizeLabelSchema>;
export type CreateSizeChartInput = z.infer<typeof createSizeChartSchema>;
export type UpdateSizeChartInput = z.infer<typeof updateSizeChartSchema>;
export type BulkOperationInput = z.infer<typeof bulkOperationSchema>;
export type DuplicateSizeChartInput = z.infer<typeof duplicateSizeChartSchema>;
export type SizeChartFilters = z.infer<typeof sizeChartFiltersSchema>;
