import { readdirSync, readFileSync } from "fs";
import { join } from "path";

// Column types matching the database schema
export type ColumnType = "SIZE_LABEL" | "SHOE_SIZE" | "MEASUREMENT" | "TEXT";

// Template column definition
export interface TemplateColumn {
  name: string;
  type: ColumnType;
}

// Measurement value types
export interface MeasurementRange {
  min: number;
  max: number;
}

export interface MeasurementValue {
  value: number;
}

// Row cell value can be a string, measurement range, or single value
export type CellValue = string | MeasurementRange | MeasurementValue;

// Template row is a record of column name to cell value
export type TemplateRow = Record<string, CellValue>;

// Variant for templates with gender/age-specific variations
export interface TemplateVariant {
  name: string;
  description: string;
  rows: TemplateRow[];
}

// Main template interface
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  suggestedCategories: string[];
  measurementInstructions: string[];
  columns: TemplateColumn[];
  rows: TemplateRow[];
  variants?: Record<string, TemplateVariant>;
}

// Template categories
export type TemplateCategory = "apparel" | "youth" | "footwear" | "accessories";

// Cache for loaded templates
let templateCache: Template[] | null = null;

/**
 * Get the templates directory path
 */
function getTemplatesDir(): string {
  return join(process.cwd(), "prisma", "templates");
}

/**
 * Load a single template from a JSON file
 */
function loadTemplate(filePath: string): Template {
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content) as Template;
}

/**
 * Load all templates from a category directory
 */
function loadCategoryTemplates(category: string): Template[] {
  const categoryDir = join(getTemplatesDir(), category);
  const templates: Template[] = [];

  try {
    const files = readdirSync(categoryDir);
    for (const file of files) {
      if (file.endsWith(".json")) {
        const template = loadTemplate(join(categoryDir, file));
        templates.push(template);
      }
    }
  } catch {
    // Category directory doesn't exist, return empty array
  }

  return templates;
}

/**
 * Load all templates from all categories
 */
function loadAllTemplates(): Template[] {
  const categories: TemplateCategory[] = [
    "apparel",
    "youth",
    "footwear",
    "accessories",
  ];
  const templates: Template[] = [];

  for (const category of categories) {
    templates.push(...loadCategoryTemplates(category));
  }

  return templates;
}

/**
 * Get all available templates
 * Templates are cached after first load
 */
export function getAllTemplates(): Template[] {
  if (!templateCache) {
    templateCache = loadAllTemplates();
  }
  return templateCache;
}

/**
 * Get a template by its ID
 */
export function getTemplateById(id: string): Template | null {
  const templates = getAllTemplates();
  return templates.find((t) => t.id === id) || null;
}

/**
 * Get all templates for a specific category
 */
export function getTemplatesByCategory(category: TemplateCategory): Template[] {
  const templates = getAllTemplates();
  return templates.filter((t) => t.category === category);
}

/**
 * Get all templates matching any of the given tags
 */
export function getTemplatesByTags(tags: string[]): Template[] {
  const templates = getAllTemplates();
  return templates.filter((t) => t.tags.some((tag) => tags.includes(tag)));
}

/**
 * Search templates by name or description
 */
export function searchTemplates(query: string): Template[] {
  const templates = getAllTemplates();
  const lowerQuery = query.toLowerCase();
  return templates.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get template categories with counts
 */
export function getTemplateCategoryCounts(): Record<TemplateCategory, number> {
  const templates = getAllTemplates();
  const counts: Record<TemplateCategory, number> = {
    apparel: 0,
    youth: 0,
    footwear: 0,
    accessories: 0,
  };

  for (const template of templates) {
    const category = template.category as TemplateCategory;
    if (category in counts) {
      counts[category]++;
    }
  }

  return counts;
}

/**
 * Clear the template cache (useful for testing or hot-reloading)
 */
export function clearTemplateCache(): void {
  templateCache = null;
}

/**
 * Get all unique tags across all templates
 */
export function getAllTemplateTags(): string[] {
  const templates = getAllTemplates();
  const tagSet = new Set<string>();

  for (const template of templates) {
    for (const tag of template.tags) {
      tagSet.add(tag);
    }
  }

  return Array.from(tagSet).sort();
}
