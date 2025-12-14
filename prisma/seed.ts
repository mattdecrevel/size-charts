import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ColumnType, LabelType } from "@prisma/client";
import { getAllTemplates, Template, CellValue, MeasurementRange, MeasurementValue } from "./templates";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper to convert inches to cm
function inToCm(inches: number): number {
  return Math.round(inches * 2.54 * 10) / 10;
}

// Map template column types to Prisma ColumnType enum
function mapColumnType(type: string): ColumnType {
  switch (type) {
    case "SIZE_LABEL":
      return ColumnType.SIZE_LABEL;
    case "SHOE_SIZE":
      return ColumnType.SHOE_SIZE;
    case "MEASUREMENT":
      return ColumnType.MEASUREMENT;
    case "BAND_SIZE":
      return ColumnType.BAND_SIZE;
    case "CUP_SIZE":
      return ColumnType.CUP_SIZE;
    case "TEXT":
    default:
      return ColumnType.TEXT;
  }
}

// Check if value is a measurement range
function isMeasurementRange(value: CellValue): value is MeasurementRange {
  return typeof value === "object" && "min" in value && "max" in value;
}

// Check if value is a single measurement value
function isMeasurementValue(value: CellValue): value is MeasurementValue {
  return typeof value === "object" && "value" in value;
}

// Transform template row to seed format
function transformTemplateRow(
  row: Record<string, CellValue>,
  columns: Array<{ name: string; columnType: ColumnType }>
): Record<string, { text?: string; value?: number; min?: number; max?: number }> {
  const result: Record<string, { text?: string; value?: number; min?: number; max?: number }> = {};

  for (const col of columns) {
    const cellValue = row[col.name];
    if (cellValue === undefined) continue;

    if (typeof cellValue === "string") {
      result[col.name] = { text: cellValue };
    } else if (isMeasurementRange(cellValue)) {
      result[col.name] = { min: cellValue.min, max: cellValue.max };
    } else if (isMeasurementValue(cellValue)) {
      result[col.name] = { value: cellValue.value };
    }
  }

  return result;
}

// Create a size chart from a template
async function createSizeChartFromTemplate(
  template: Template,
  name: string,
  slug: string,
  subcategoryIds: string[],
  instructionMap: Record<string, string>,
  rows?: Record<string, CellValue>[] // Optional: use specific rows (for variants)
) {
  const chart = await prisma.sizeChart.create({
    data: {
      name,
      slug,
      description: template.description,
      isPublished: true,
    },
  });

  // Create many-to-many relationships with subcategories
  await Promise.all(
    subcategoryIds.map((subcategoryId, index) =>
      prisma.sizeChartSubcategory.create({
        data: {
          sizeChartId: chart.id,
          subcategoryId,
          displayOrder: index,
        },
      })
    )
  );

  const columns = template.columns.map((col) => ({
    name: col.name,
    columnType: mapColumnType(col.type),
  }));

  const createdColumns = await Promise.all(
    columns.map((col, index) =>
      prisma.sizeChartColumn.create({
        data: {
          name: col.name,
          columnType: col.columnType,
          displayOrder: index,
          sizeChartId: chart.id,
        },
      })
    )
  );

  // Use provided rows or template default rows
  const templateRows = rows || template.rows;

  for (let rowIndex = 0; rowIndex < templateRows.length; rowIndex++) {
    const rowData = transformTemplateRow(templateRows[rowIndex], columns);
    const row = await prisma.sizeChartRow.create({
      data: {
        sizeChartId: chart.id,
        displayOrder: rowIndex,
      },
    });

    const cellData = columns.map((col, colIndex) => {
      const cellValue = rowData[col.name];
      return {
        rowId: row.id,
        columnId: createdColumns[colIndex].id,
        labelId: null,
        valueText: cellValue?.text ?? null,
        valueInches: cellValue?.value ?? null,
        valueCm: cellValue?.value ? inToCm(cellValue.value) : null,
        valueMinInches: cellValue?.min ?? null,
        valueMaxInches: cellValue?.max ?? null,
        valueMinCm: cellValue?.min ? inToCm(cellValue.min) : null,
        valueMaxCm: cellValue?.max ? inToCm(cellValue.max) : null,
      };
    });

    await prisma.sizeChartCell.createMany({ data: cellData });
  }

  // Create measurement instruction links
  const instructionIds = template.measurementInstructions
    .map((key) => instructionMap[key])
    .filter((id): id is string => id !== undefined);

  if (instructionIds.length > 0) {
    await Promise.all(
      instructionIds.map((instructionId, index) =>
        prisma.sizeChartMeasurementInstruction.create({
          data: {
            sizeChartId: chart.id,
            instructionId,
            displayOrder: index,
          },
        })
      )
    );
  }

  return chart;
}

async function main() {
  console.log("Seeding database with template-based size data...\n");

  // Load all templates
  const templates = getAllTemplates();
  console.log(`Loaded ${templates.length} templates`);

  // Create template lookup
  const templateMap = new Map<string, Template>();
  templates.forEach((t) => templateMap.set(t.id, t));

  // Clear existing data
  await prisma.sizeChartMeasurementInstruction.deleteMany();
  await prisma.sizeChartCell.deleteMany();
  await prisma.sizeChartRow.deleteMany();
  await prisma.sizeChartColumn.deleteMany();
  await prisma.sizeChartSubcategory.deleteMany();
  await prisma.sizeChart.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.sizeLabel.deleteMany();
  await prisma.measurementInstruction.deleteMany();

  // ============================================
  // MEASUREMENT INSTRUCTIONS - How to measure guides
  // ============================================
  console.log("Creating measurement instructions...");

  const measurementInstructions = await Promise.all([
    prisma.measurementInstruction.create({
      data: {
        key: "chest",
        name: "Chest/Bust",
        instruction: "Measure around the fullest part of your chest, keeping the tape parallel to the floor.",
        sortOrder: 0,
      },
    }),
    prisma.measurementInstruction.create({
      data: {
        key: "waist",
        name: "Waist",
        instruction: "Measure around the narrowest part of your natural waistline, typically just above the belly button.",
        sortOrder: 1,
      },
    }),
    prisma.measurementInstruction.create({
      data: {
        key: "hip",
        name: "Hip",
        instruction: "Measure around the fullest part of your hips, about 8 inches below your waist.",
        sortOrder: 2,
      },
    }),
    prisma.measurementInstruction.create({
      data: {
        key: "inseam",
        name: "Inseam",
        instruction: "Measure from the crotch seam to the bottom of the leg along the inner leg.",
        sortOrder: 3,
      },
    }),
    prisma.measurementInstruction.create({
      data: {
        key: "height",
        name: "Height",
        instruction: "Measure from the top of your head to the floor while standing straight without shoes.",
        sortOrder: 4,
      },
    }),
    prisma.measurementInstruction.create({
      data: {
        key: "foot_length",
        name: "Foot Length",
        instruction: "Stand on a piece of paper and trace your foot. Measure from heel to longest toe.",
        sortOrder: 5,
      },
    }),
    prisma.measurementInstruction.create({
      data: {
        key: "hand_circumference",
        name: "Hand Circumference",
        instruction: "Measure around your palm at the widest point, excluding the thumb.",
        sortOrder: 6,
      },
    }),
    prisma.measurementInstruction.create({
      data: {
        key: "hand_length",
        name: "Hand Length",
        instruction: "Measure from the base of your palm to the tip of your middle finger.",
        sortOrder: 7,
      },
    }),
    prisma.measurementInstruction.create({
      data: {
        key: "head_circumference",
        name: "Head Circumference",
        instruction: "Measure around the largest part of your head, about 1 inch above your eyebrows.",
        sortOrder: 8,
      },
    }),
    prisma.measurementInstruction.create({
      data: {
        key: "band_size",
        name: "Band Size",
        instruction: "Measure snugly around your ribcage, directly under your bust. Round to nearest even number.",
        sortOrder: 9,
      },
    }),
    prisma.measurementInstruction.create({
      data: {
        key: "cup_size",
        name: "Cup Size",
        instruction: "Measure around the fullest part of your bust. Subtract band size to determine cup.",
        sortOrder: 10,
      },
    }),
  ]);

  // Create a lookup object for measurement instructions
  const instructions: Record<string, string> = {};
  measurementInstructions.forEach((inst) => {
    instructions[inst.key] = inst.id;
  });

  // ============================================
  // SIZE LABELS - User-defined translation keys
  // ============================================
  console.log("Creating size labels...");

  // Alpha sizes
  await Promise.all([
    prisma.sizeLabel.create({ data: { key: "SIZE_XXS", displayValue: "XXS", labelType: LabelType.ALPHA_SIZE, sortOrder: 0 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_XS", displayValue: "XS", labelType: LabelType.ALPHA_SIZE, sortOrder: 1 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_SM", displayValue: "SM", labelType: LabelType.ALPHA_SIZE, sortOrder: 2 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_MD", displayValue: "MD", labelType: LabelType.ALPHA_SIZE, sortOrder: 3 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_LG", displayValue: "LG", labelType: LabelType.ALPHA_SIZE, sortOrder: 4 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_XL", displayValue: "XL", labelType: LabelType.ALPHA_SIZE, sortOrder: 5 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_XXL", displayValue: "XXL", labelType: LabelType.ALPHA_SIZE, sortOrder: 6 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_3XL", displayValue: "3XL", labelType: LabelType.ALPHA_SIZE, sortOrder: 7 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_4XL", displayValue: "4XL", labelType: LabelType.ALPHA_SIZE, sortOrder: 8 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_5XL", displayValue: "5XL", labelType: LabelType.ALPHA_SIZE, sortOrder: 9 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_1X", displayValue: "1X", labelType: LabelType.ALPHA_SIZE, sortOrder: 10 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_2X", displayValue: "2X", labelType: LabelType.ALPHA_SIZE, sortOrder: 11 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_3X", displayValue: "3X", labelType: LabelType.ALPHA_SIZE, sortOrder: 12 } }),
  ]);

  // Youth sizes
  await Promise.all([
    prisma.sizeLabel.create({ data: { key: "SIZE_YXS", displayValue: "YXS", labelType: LabelType.YOUTH_SIZE, sortOrder: 0 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_YSM", displayValue: "YSM", labelType: LabelType.YOUTH_SIZE, sortOrder: 1 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_YMD", displayValue: "YMD", labelType: LabelType.YOUTH_SIZE, sortOrder: 2 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_YLG", displayValue: "YLG", labelType: LabelType.YOUTH_SIZE, sortOrder: 3 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_YXL", displayValue: "YXL", labelType: LabelType.YOUTH_SIZE, sortOrder: 4 } }),
  ]);

  // Toddler sizes
  await Promise.all([
    prisma.sizeLabel.create({ data: { key: "SIZE_2T", displayValue: "2T", labelType: LabelType.TODDLER_SIZE, sortOrder: 0 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_3T", displayValue: "3T", labelType: LabelType.TODDLER_SIZE, sortOrder: 1 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_4T", displayValue: "4T", labelType: LabelType.TODDLER_SIZE, sortOrder: 2 } }),
  ]);

  // Infant sizes
  await Promise.all([
    prisma.sizeLabel.create({ data: { key: "SIZE_0_3M", displayValue: "0-3M", labelType: LabelType.INFANT_SIZE, sortOrder: 0 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_3_6M", displayValue: "3-6M", labelType: LabelType.INFANT_SIZE, sortOrder: 1 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_6_9M", displayValue: "6-9M", labelType: LabelType.INFANT_SIZE, sortOrder: 2 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_12M", displayValue: "12M", labelType: LabelType.INFANT_SIZE, sortOrder: 3 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_18M", displayValue: "18M", labelType: LabelType.INFANT_SIZE, sortOrder: 4 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_24M", displayValue: "24M", labelType: LabelType.INFANT_SIZE, sortOrder: 5 } }),
  ]);

  // Numeric sizes (4-20)
  await Promise.all(
    [4, 5, 6, 7, 8, 10, 12, 14, 16, 18, 20].map((n, i) =>
      prisma.sizeLabel.create({ data: { key: `SIZE_${n}`, displayValue: `${n}`, labelType: LabelType.NUMERIC_SIZE, sortOrder: i } })
    )
  );

  // Headwear sizes
  await Promise.all([
    prisma.sizeLabel.create({ data: { key: "SIZE_OSFM", displayValue: "OSFM", labelType: LabelType.CUSTOM, sortOrder: 0, description: "One Size Fits Most" } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_S_M", displayValue: "S/M", labelType: LabelType.CUSTOM, sortOrder: 1 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_M_L", displayValue: "M/L", labelType: LabelType.CUSTOM, sortOrder: 2 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_L_XL", displayValue: "L/XL", labelType: LabelType.CUSTOM, sortOrder: 3 } }),
    prisma.sizeLabel.create({ data: { key: "SIZE_XL_XXL", displayValue: "XL/XXL", labelType: LabelType.CUSTOM, sortOrder: 4 } }),
  ]);

  // Cup sizes
  await Promise.all([
    prisma.sizeLabel.create({ data: { key: "CUP_A", displayValue: "A", labelType: LabelType.CUP_SIZE, sortOrder: 0 } }),
    prisma.sizeLabel.create({ data: { key: "CUP_B", displayValue: "B", labelType: LabelType.CUP_SIZE, sortOrder: 1 } }),
    prisma.sizeLabel.create({ data: { key: "CUP_C", displayValue: "C", labelType: LabelType.CUP_SIZE, sortOrder: 2 } }),
    prisma.sizeLabel.create({ data: { key: "CUP_D", displayValue: "D", labelType: LabelType.CUP_SIZE, sortOrder: 3 } }),
    prisma.sizeLabel.create({ data: { key: "CUP_DD", displayValue: "DD", labelType: LabelType.CUP_SIZE, sortOrder: 4 } }),
    prisma.sizeLabel.create({ data: { key: "CUP_DDD", displayValue: "DDD", labelType: LabelType.CUP_SIZE, sortOrder: 5 } }),
  ]);

  // Band sizes
  await Promise.all(
    [30, 32, 34, 36, 38, 40, 42, 44, 46].map((n, i) =>
      prisma.sizeLabel.create({ data: { key: `BAND_${n}`, displayValue: `${n}`, labelType: LabelType.BAND_SIZE, sortOrder: i } })
    )
  );

  console.log("Created size labels");

  // ============================================
  // CATEGORIES
  // ============================================
  const mens = await prisma.category.create({
    data: { name: "Men's", slug: "mens", displayOrder: 0 },
  });

  const womens = await prisma.category.create({
    data: { name: "Women's", slug: "womens", displayOrder: 1 },
  });

  const boys = await prisma.category.create({
    data: { name: "Boys", slug: "boys", displayOrder: 2 },
  });

  const girls = await prisma.category.create({
    data: { name: "Girls", slug: "girls", displayOrder: 3 },
  });

  console.log("Created categories");

  // ============================================
  // SUBCATEGORIES
  // ============================================
  // Men's
  const mensTops = await prisma.subcategory.create({ data: { name: "Tops", slug: "tops", displayOrder: 0, categoryId: mens.id } });
  const mensBottoms = await prisma.subcategory.create({ data: { name: "Bottoms", slug: "bottoms", displayOrder: 1, categoryId: mens.id } });
  const mensFootwear = await prisma.subcategory.create({ data: { name: "Footwear", slug: "footwear", displayOrder: 2, categoryId: mens.id } });
  const mensGloves = await prisma.subcategory.create({ data: { name: "Gloves", slug: "gloves", displayOrder: 3, categoryId: mens.id } });
  const mensHeadwear = await prisma.subcategory.create({ data: { name: "Headwear", slug: "headwear", displayOrder: 4, categoryId: mens.id } });
  const mensSocks = await prisma.subcategory.create({ data: { name: "Socks", slug: "socks", displayOrder: 5, categoryId: mens.id } });

  // Women's
  const womensTops = await prisma.subcategory.create({ data: { name: "Tops", slug: "tops", displayOrder: 0, categoryId: womens.id } });
  const womensBras = await prisma.subcategory.create({ data: { name: "Bras", slug: "bras", displayOrder: 1, categoryId: womens.id } });
  const womensBottoms = await prisma.subcategory.create({ data: { name: "Bottoms", slug: "bottoms", displayOrder: 2, categoryId: womens.id } });
  const womensFootwear = await prisma.subcategory.create({ data: { name: "Footwear", slug: "footwear", displayOrder: 3, categoryId: womens.id } });
  const womensGloves = await prisma.subcategory.create({ data: { name: "Gloves", slug: "gloves", displayOrder: 4, categoryId: womens.id } });
  const womensHeadwear = await prisma.subcategory.create({ data: { name: "Headwear", slug: "headwear", displayOrder: 5, categoryId: womens.id } });
  const womensSocks = await prisma.subcategory.create({ data: { name: "Socks", slug: "socks", displayOrder: 6, categoryId: womens.id } });
  const womensPlus = await prisma.subcategory.create({ data: { name: "Plus Sizes", slug: "plus-sizes", displayOrder: 7, categoryId: womens.id } });

  // Boys
  const boysTops = await prisma.subcategory.create({ data: { name: "Tops", slug: "tops", displayOrder: 0, categoryId: boys.id } });
  const boysBottoms = await prisma.subcategory.create({ data: { name: "Bottoms", slug: "bottoms", displayOrder: 1, categoryId: boys.id } });
  const boysFootwear = await prisma.subcategory.create({ data: { name: "Footwear", slug: "footwear", displayOrder: 2, categoryId: boys.id } });
  const boysGloves = await prisma.subcategory.create({ data: { name: "Gloves", slug: "gloves", displayOrder: 3, categoryId: boys.id } });
  const boysHeadwear = await prisma.subcategory.create({ data: { name: "Headwear", slug: "headwear", displayOrder: 4, categoryId: boys.id } });
  const boysSocks = await prisma.subcategory.create({ data: { name: "Socks", slug: "socks", displayOrder: 5, categoryId: boys.id } });

  // Girls
  const girlsTops = await prisma.subcategory.create({ data: { name: "Tops", slug: "tops", displayOrder: 0, categoryId: girls.id } });
  const girlsBottoms = await prisma.subcategory.create({ data: { name: "Bottoms", slug: "bottoms", displayOrder: 1, categoryId: girls.id } });
  const girlsFootwear = await prisma.subcategory.create({ data: { name: "Footwear", slug: "footwear", displayOrder: 2, categoryId: girls.id } });
  const girlsGloves = await prisma.subcategory.create({ data: { name: "Gloves", slug: "gloves", displayOrder: 3, categoryId: girls.id } });
  const girlsHeadwear = await prisma.subcategory.create({ data: { name: "Headwear", slug: "headwear", displayOrder: 4, categoryId: girls.id } });
  const girlsSocks = await prisma.subcategory.create({ data: { name: "Socks", slug: "socks", displayOrder: 5, categoryId: girls.id } });

  console.log("Created subcategories");

  // ============================================
  // SIZE CHARTS - Created from templates
  // ============================================
  console.log("\nCreating size charts from templates...");

  // Helper to get template or throw
  function getTemplate(id: string): Template {
    const template = templateMap.get(id);
    if (!template) throw new Error(`Template not found: ${id}`);
    return template;
  }

  // MEN'S APPAREL
  await createSizeChartFromTemplate(
    getTemplate("apparel-mens-tops"),
    "Tops",
    "mens-tops",
    [mensTops.id],
    instructions
  );
  console.log("Created Men's Tops");

  await createSizeChartFromTemplate(
    getTemplate("apparel-mens-bottoms"),
    "Bottoms",
    "mens-bottoms",
    [mensBottoms.id],
    instructions
  );
  console.log("Created Men's Bottoms");

  // MEN'S FOOTWEAR
  await createSizeChartFromTemplate(
    getTemplate("footwear-mens"),
    "Footwear",
    "mens-footwear",
    [mensFootwear.id],
    instructions
  );
  console.log("Created Men's Footwear");

  // MEN'S ACCESSORIES (using variants from template)
  const glovesTemplate = getTemplate("accessories-gloves");
  await createSizeChartFromTemplate(
    glovesTemplate,
    "Gloves",
    "mens-gloves",
    [mensGloves.id],
    instructions,
    glovesTemplate.variants?.mens?.rows
  );
  console.log("Created Men's Gloves");

  const headwearTemplate = getTemplate("accessories-headwear");
  await createSizeChartFromTemplate(
    headwearTemplate,
    "Headwear",
    "mens-headwear",
    [mensHeadwear.id],
    instructions,
    headwearTemplate.variants?.mens?.rows
  );
  console.log("Created Men's Headwear");

  const socksTemplate = getTemplate("accessories-socks");
  await createSizeChartFromTemplate(
    socksTemplate,
    "Socks",
    "mens-socks",
    [mensSocks.id],
    instructions,
    socksTemplate.variants?.mens?.rows
  );
  console.log("Created Men's Socks");

  // WOMEN'S APPAREL
  await createSizeChartFromTemplate(
    getTemplate("apparel-womens-tops"),
    "Tops",
    "womens-tops",
    [womensTops.id],
    instructions
  );
  console.log("Created Women's Tops");

  await createSizeChartFromTemplate(
    getTemplate("apparel-womens-sports-bras"),
    "Sports Bras",
    "womens-sports-bras",
    [womensBras.id],
    instructions
  );
  console.log("Created Women's Bras");

  await createSizeChartFromTemplate(
    getTemplate("apparel-womens-bottoms"),
    "Bottoms",
    "womens-bottoms",
    [womensBottoms.id],
    instructions
  );
  console.log("Created Women's Bottoms");

  await createSizeChartFromTemplate(
    getTemplate("apparel-womens-plus-sizes"),
    "Plus Sizes",
    "womens-plus-sizes",
    [womensPlus.id],
    instructions
  );
  console.log("Created Women's Plus Sizes");

  // WOMEN'S FOOTWEAR
  await createSizeChartFromTemplate(
    getTemplate("footwear-womens"),
    "Footwear",
    "womens-footwear",
    [womensFootwear.id],
    instructions
  );
  console.log("Created Women's Footwear");

  // WOMEN'S ACCESSORIES
  await createSizeChartFromTemplate(
    glovesTemplate,
    "Gloves",
    "womens-gloves",
    [womensGloves.id],
    instructions,
    glovesTemplate.variants?.womens?.rows
  );
  console.log("Created Women's Gloves");

  await createSizeChartFromTemplate(
    headwearTemplate,
    "Headwear",
    "womens-headwear",
    [womensHeadwear.id],
    instructions,
    headwearTemplate.variants?.womens?.rows
  );
  console.log("Created Women's Headwear");

  await createSizeChartFromTemplate(
    socksTemplate,
    "Socks",
    "womens-socks",
    [womensSocks.id],
    instructions,
    socksTemplate.variants?.womens?.rows
  );
  console.log("Created Women's Socks");

  // YOUTH - Shared between Boys and Girls
  await createSizeChartFromTemplate(
    getTemplate("youth-big-kids-tops"),
    "Big Kids (8-20)",
    "youth-big-kids-tops",
    [boysTops.id, girlsTops.id],
    instructions
  );
  console.log("Created Youth Big Kids Tops (Boys & Girls)");

  await createSizeChartFromTemplate(
    getTemplate("youth-big-kids-bottoms"),
    "Big Kids (8-20)",
    "youth-big-kids-bottoms",
    [boysBottoms.id, girlsBottoms.id],
    instructions
  );
  console.log("Created Youth Big Kids Bottoms (Boys & Girls)");

  await createSizeChartFromTemplate(
    getTemplate("youth-little-kids"),
    "Little Kids (4-7)",
    "youth-little-kids",
    [boysTops.id, girlsTops.id, boysBottoms.id, girlsBottoms.id],
    instructions
  );
  console.log("Created Youth Little Kids (shared)");

  await createSizeChartFromTemplate(
    getTemplate("youth-toddler"),
    "Toddler (2T-4T)",
    "youth-toddler",
    [boysTops.id, girlsTops.id, boysBottoms.id, girlsBottoms.id],
    instructions
  );
  console.log("Created Youth Toddler (shared)");

  await createSizeChartFromTemplate(
    getTemplate("youth-infant"),
    "Infant (0-24M)",
    "youth-infant",
    [boysTops.id, girlsTops.id, boysBottoms.id, girlsBottoms.id],
    instructions
  );
  console.log("Created Youth Infant (shared)");

  // YOUTH FOOTWEAR
  await createSizeChartFromTemplate(
    getTemplate("footwear-kids"),
    "Youth Footwear",
    "youth-footwear",
    [boysFootwear.id, girlsFootwear.id],
    instructions
  );
  console.log("Created Youth Footwear (shared)");

  // YOUTH ACCESSORIES
  await createSizeChartFromTemplate(
    glovesTemplate,
    "Youth Gloves",
    "youth-gloves",
    [boysGloves.id, girlsGloves.id],
    instructions,
    glovesTemplate.variants?.youth?.rows
  );
  console.log("Created Youth Gloves (shared)");

  await createSizeChartFromTemplate(
    headwearTemplate,
    "Youth Headwear",
    "youth-headwear",
    [boysHeadwear.id, girlsHeadwear.id],
    instructions,
    headwearTemplate.variants?.youth?.rows
  );
  console.log("Created Youth Headwear (shared)");

  await createSizeChartFromTemplate(
    socksTemplate,
    "Youth Socks",
    "youth-socks",
    [boysSocks.id, girlsSocks.id],
    instructions,
    socksTemplate.variants?.youth?.rows
  );
  console.log("Created Youth Socks (shared)");

  console.log("\n✅ Database seeding completed!");
  console.log("\nSummary:");
  console.log("- 4 Categories (Men's, Women's, Boys, Girls)");
  console.log("- 24 Subcategories");
  console.log("- 22 Size Charts (created from templates)");
  console.log("- 70+ Size Labels (for translation keys)");
  console.log(`- ${templates.length} Templates loaded`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
