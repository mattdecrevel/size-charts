import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ColumnType, LabelType } from "@prisma/client";
import {
  getAllTemplates,
  Template,
  CellValue,
  MeasurementRange,
  MeasurementValue,
} from "@/prisma/templates";
import { isDemoModeEnabled } from "@/lib/admin-auth";

// Store last reset time in module scope (persists across warm function invocations)
let lastResetTime: string | null = null;

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

// Create a size chart from a template
async function createSizeChartFromTemplate(
  template: Template,
  name: string,
  slug: string,
  subcategoryIds: string[],
  instructionMap: Record<string, string>,
  rows?: Record<string, CellValue>[]
) {
  const chart = await db.sizeChart.create({
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
      db.sizeChartSubcategory.create({
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
      db.sizeChartColumn.create({
        data: {
          name: col.name,
          columnType: col.columnType,
          displayOrder: index,
          sizeChartId: chart.id,
        },
      })
    )
  );

  const templateRows = rows || template.rows;

  for (let rowIndex = 0; rowIndex < templateRows.length; rowIndex++) {
    const rowData = templateRows[rowIndex];
    const row = await db.sizeChartRow.create({
      data: {
        sizeChartId: chart.id,
        displayOrder: rowIndex,
      },
    });

    const cellData = columns.map((col, colIndex) => {
      const cellValue = rowData[col.name];

      let valueText: string | null = null;
      let valueInches: number | null = null;
      let valueCm: number | null = null;
      let valueMinInches: number | null = null;
      let valueMaxInches: number | null = null;
      let valueMinCm: number | null = null;
      let valueMaxCm: number | null = null;

      if (cellValue !== undefined) {
        if (typeof cellValue === "string") {
          valueText = cellValue;
        } else if (isMeasurementRange(cellValue)) {
          valueMinInches = cellValue.min;
          valueMaxInches = cellValue.max;
          valueMinCm = inToCm(cellValue.min);
          valueMaxCm = inToCm(cellValue.max);
        } else if (isMeasurementValue(cellValue)) {
          valueInches = cellValue.value;
          valueCm = inToCm(cellValue.value);
        }
      }

      return {
        rowId: row.id,
        columnId: createdColumns[colIndex].id,
        labelId: null,
        valueText,
        valueInches,
        valueCm,
        valueMinInches,
        valueMaxInches,
        valueMinCm,
        valueMaxCm,
      };
    });

    await db.sizeChartCell.createMany({ data: cellData });
  }

  // Create measurement instruction links
  const instructionIds = template.measurementInstructions
    .map((key) => instructionMap[key])
    .filter((id): id is string => id !== undefined);

  if (instructionIds.length > 0) {
    await Promise.all(
      instructionIds.map((instructionId, index) =>
        db.sizeChartMeasurementInstruction.create({
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

export async function POST(request: NextRequest) {
  // Check if demo mode is enabled via feature flag
  if (!(await isDemoModeEnabled())) {
    return NextResponse.json(
      { error: "Demo mode is not enabled" },
      { status: 403 }
    );
  }

  // Verify cron secret for scheduled resets
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    console.log("Starting demo database reset...");

    // Load all templates
    const templates = getAllTemplates();
    console.log(`Loaded ${templates.length} templates`);

    const templateMap = new Map<string, Template>();
    templates.forEach((t) => templateMap.set(t.id, t));

    function getTemplate(id: string): Template {
      const template = templateMap.get(id);
      if (!template) throw new Error(`Template not found: ${id}`);
      return template;
    }

    // Clear existing data
    console.log("Clearing existing data...");
    await db.sizeChartMeasurementInstruction.deleteMany();
    await db.sizeChartCell.deleteMany();
    await db.sizeChartRow.deleteMany();
    await db.sizeChartColumn.deleteMany();
    await db.sizeChartSubcategory.deleteMany();
    await db.sizeChart.deleteMany();
    await db.subcategory.deleteMany();
    await db.category.deleteMany();
    await db.sizeLabel.deleteMany();
    await db.measurementInstruction.deleteMany();

    // Create measurement instructions
    console.log("Creating measurement instructions...");
    const measurementInstructions = await Promise.all([
      db.measurementInstruction.create({
        data: {
          key: "chest",
          name: "Chest/Bust",
          instruction: "Measure around the fullest part of your chest, keeping the tape parallel to the floor.",
          sortOrder: 0,
        },
      }),
      db.measurementInstruction.create({
        data: {
          key: "waist",
          name: "Waist",
          instruction: "Measure around the narrowest part of your natural waistline, typically just above the belly button.",
          sortOrder: 1,
        },
      }),
      db.measurementInstruction.create({
        data: {
          key: "hip",
          name: "Hip",
          instruction: "Measure around the fullest part of your hips, about 8 inches below your waist.",
          sortOrder: 2,
        },
      }),
      db.measurementInstruction.create({
        data: {
          key: "inseam",
          name: "Inseam",
          instruction: "Measure from the crotch seam to the bottom of the leg along the inner leg.",
          sortOrder: 3,
        },
      }),
      db.measurementInstruction.create({
        data: {
          key: "height",
          name: "Height",
          instruction: "Measure from the top of your head to the floor while standing straight without shoes.",
          sortOrder: 4,
        },
      }),
      db.measurementInstruction.create({
        data: {
          key: "foot_length",
          name: "Foot Length",
          instruction: "Stand on a piece of paper and trace your foot. Measure from heel to longest toe.",
          sortOrder: 5,
        },
      }),
      db.measurementInstruction.create({
        data: {
          key: "hand_circumference",
          name: "Hand Circumference",
          instruction: "Measure around your palm at the widest point, excluding the thumb.",
          sortOrder: 6,
        },
      }),
      db.measurementInstruction.create({
        data: {
          key: "hand_length",
          name: "Hand Length",
          instruction: "Measure from the base of your palm to the tip of your middle finger.",
          sortOrder: 7,
        },
      }),
      db.measurementInstruction.create({
        data: {
          key: "head_circumference",
          name: "Head Circumference",
          instruction: "Measure around the largest part of your head, about 1 inch above your eyebrows.",
          sortOrder: 8,
        },
      }),
      db.measurementInstruction.create({
        data: {
          key: "band_size",
          name: "Band Size",
          instruction: "Measure snugly around your ribcage, directly under your bust. Round to nearest even number.",
          sortOrder: 9,
        },
      }),
      db.measurementInstruction.create({
        data: {
          key: "cup_size",
          name: "Cup Size",
          instruction: "Measure around the fullest part of your bust. Subtract band size to determine cup.",
          sortOrder: 10,
        },
      }),
    ]);

    const instructions: Record<string, string> = {};
    measurementInstructions.forEach((inst) => {
      instructions[inst.key] = inst.id;
    });

    // Create size labels
    console.log("Creating size labels...");
    await Promise.all([
      db.sizeLabel.create({ data: { key: "SIZE_XXS", displayValue: "XXS", labelType: LabelType.ALPHA_SIZE, sortOrder: 0 } }),
      db.sizeLabel.create({ data: { key: "SIZE_XS", displayValue: "XS", labelType: LabelType.ALPHA_SIZE, sortOrder: 1 } }),
      db.sizeLabel.create({ data: { key: "SIZE_SM", displayValue: "SM", labelType: LabelType.ALPHA_SIZE, sortOrder: 2 } }),
      db.sizeLabel.create({ data: { key: "SIZE_MD", displayValue: "MD", labelType: LabelType.ALPHA_SIZE, sortOrder: 3 } }),
      db.sizeLabel.create({ data: { key: "SIZE_LG", displayValue: "LG", labelType: LabelType.ALPHA_SIZE, sortOrder: 4 } }),
      db.sizeLabel.create({ data: { key: "SIZE_XL", displayValue: "XL", labelType: LabelType.ALPHA_SIZE, sortOrder: 5 } }),
      db.sizeLabel.create({ data: { key: "SIZE_XXL", displayValue: "XXL", labelType: LabelType.ALPHA_SIZE, sortOrder: 6 } }),
      db.sizeLabel.create({ data: { key: "SIZE_3XL", displayValue: "3XL", labelType: LabelType.ALPHA_SIZE, sortOrder: 7 } }),
      db.sizeLabel.create({ data: { key: "SIZE_4XL", displayValue: "4XL", labelType: LabelType.ALPHA_SIZE, sortOrder: 8 } }),
      db.sizeLabel.create({ data: { key: "SIZE_5XL", displayValue: "5XL", labelType: LabelType.ALPHA_SIZE, sortOrder: 9 } }),
      db.sizeLabel.create({ data: { key: "SIZE_1X", displayValue: "1X", labelType: LabelType.ALPHA_SIZE, sortOrder: 10 } }),
      db.sizeLabel.create({ data: { key: "SIZE_2X", displayValue: "2X", labelType: LabelType.ALPHA_SIZE, sortOrder: 11 } }),
      db.sizeLabel.create({ data: { key: "SIZE_3X", displayValue: "3X", labelType: LabelType.ALPHA_SIZE, sortOrder: 12 } }),
    ]);

    await Promise.all([
      db.sizeLabel.create({ data: { key: "SIZE_YXS", displayValue: "YXS", labelType: LabelType.YOUTH_SIZE, sortOrder: 0 } }),
      db.sizeLabel.create({ data: { key: "SIZE_YSM", displayValue: "YSM", labelType: LabelType.YOUTH_SIZE, sortOrder: 1 } }),
      db.sizeLabel.create({ data: { key: "SIZE_YMD", displayValue: "YMD", labelType: LabelType.YOUTH_SIZE, sortOrder: 2 } }),
      db.sizeLabel.create({ data: { key: "SIZE_YLG", displayValue: "YLG", labelType: LabelType.YOUTH_SIZE, sortOrder: 3 } }),
      db.sizeLabel.create({ data: { key: "SIZE_YXL", displayValue: "YXL", labelType: LabelType.YOUTH_SIZE, sortOrder: 4 } }),
    ]);

    await Promise.all([
      db.sizeLabel.create({ data: { key: "SIZE_2T", displayValue: "2T", labelType: LabelType.TODDLER_SIZE, sortOrder: 0 } }),
      db.sizeLabel.create({ data: { key: "SIZE_3T", displayValue: "3T", labelType: LabelType.TODDLER_SIZE, sortOrder: 1 } }),
      db.sizeLabel.create({ data: { key: "SIZE_4T", displayValue: "4T", labelType: LabelType.TODDLER_SIZE, sortOrder: 2 } }),
    ]);

    await Promise.all([
      db.sizeLabel.create({ data: { key: "SIZE_0_3M", displayValue: "0-3M", labelType: LabelType.INFANT_SIZE, sortOrder: 0 } }),
      db.sizeLabel.create({ data: { key: "SIZE_3_6M", displayValue: "3-6M", labelType: LabelType.INFANT_SIZE, sortOrder: 1 } }),
      db.sizeLabel.create({ data: { key: "SIZE_6_9M", displayValue: "6-9M", labelType: LabelType.INFANT_SIZE, sortOrder: 2 } }),
      db.sizeLabel.create({ data: { key: "SIZE_12M", displayValue: "12M", labelType: LabelType.INFANT_SIZE, sortOrder: 3 } }),
      db.sizeLabel.create({ data: { key: "SIZE_18M", displayValue: "18M", labelType: LabelType.INFANT_SIZE, sortOrder: 4 } }),
      db.sizeLabel.create({ data: { key: "SIZE_24M", displayValue: "24M", labelType: LabelType.INFANT_SIZE, sortOrder: 5 } }),
    ]);

    await Promise.all(
      [4, 5, 6, 7, 8, 10, 12, 14, 16, 18, 20].map((n, i) =>
        db.sizeLabel.create({ data: { key: `SIZE_${n}`, displayValue: `${n}`, labelType: LabelType.NUMERIC_SIZE, sortOrder: i } })
      )
    );

    await Promise.all([
      db.sizeLabel.create({ data: { key: "SIZE_OSFM", displayValue: "OSFM", labelType: LabelType.CUSTOM, sortOrder: 0, description: "One Size Fits Most" } }),
      db.sizeLabel.create({ data: { key: "SIZE_S_M", displayValue: "S/M", labelType: LabelType.CUSTOM, sortOrder: 1 } }),
      db.sizeLabel.create({ data: { key: "SIZE_M_L", displayValue: "M/L", labelType: LabelType.CUSTOM, sortOrder: 2 } }),
      db.sizeLabel.create({ data: { key: "SIZE_L_XL", displayValue: "L/XL", labelType: LabelType.CUSTOM, sortOrder: 3 } }),
      db.sizeLabel.create({ data: { key: "SIZE_XL_XXL", displayValue: "XL/XXL", labelType: LabelType.CUSTOM, sortOrder: 4 } }),
    ]);

    await Promise.all([
      db.sizeLabel.create({ data: { key: "CUP_A", displayValue: "A", labelType: LabelType.CUP_SIZE, sortOrder: 0 } }),
      db.sizeLabel.create({ data: { key: "CUP_B", displayValue: "B", labelType: LabelType.CUP_SIZE, sortOrder: 1 } }),
      db.sizeLabel.create({ data: { key: "CUP_C", displayValue: "C", labelType: LabelType.CUP_SIZE, sortOrder: 2 } }),
      db.sizeLabel.create({ data: { key: "CUP_D", displayValue: "D", labelType: LabelType.CUP_SIZE, sortOrder: 3 } }),
      db.sizeLabel.create({ data: { key: "CUP_DD", displayValue: "DD", labelType: LabelType.CUP_SIZE, sortOrder: 4 } }),
      db.sizeLabel.create({ data: { key: "CUP_DDD", displayValue: "DDD", labelType: LabelType.CUP_SIZE, sortOrder: 5 } }),
    ]);

    await Promise.all(
      [30, 32, 34, 36, 38, 40, 42, 44, 46].map((n, i) =>
        db.sizeLabel.create({ data: { key: `BAND_${n}`, displayValue: `${n}`, labelType: LabelType.BAND_SIZE, sortOrder: i } })
      )
    );

    // Create categories
    console.log("Creating categories...");
    const mens = await db.category.create({ data: { name: "Men's", slug: "mens", displayOrder: 0 } });
    const womens = await db.category.create({ data: { name: "Women's", slug: "womens", displayOrder: 1 } });
    const boys = await db.category.create({ data: { name: "Boys", slug: "boys", displayOrder: 2 } });
    const girls = await db.category.create({ data: { name: "Girls", slug: "girls", displayOrder: 3 } });

    // Create subcategories
    console.log("Creating subcategories...");
    const mensTops = await db.subcategory.create({ data: { name: "Tops", slug: "tops", displayOrder: 0, categoryId: mens.id } });
    const mensBottoms = await db.subcategory.create({ data: { name: "Bottoms", slug: "bottoms", displayOrder: 1, categoryId: mens.id } });
    const mensFootwear = await db.subcategory.create({ data: { name: "Footwear", slug: "footwear", displayOrder: 2, categoryId: mens.id } });
    const mensGloves = await db.subcategory.create({ data: { name: "Gloves", slug: "gloves", displayOrder: 3, categoryId: mens.id } });
    const mensHeadwear = await db.subcategory.create({ data: { name: "Headwear", slug: "headwear", displayOrder: 4, categoryId: mens.id } });
    const mensSocks = await db.subcategory.create({ data: { name: "Socks", slug: "socks", displayOrder: 5, categoryId: mens.id } });

    const womensTops = await db.subcategory.create({ data: { name: "Tops", slug: "tops", displayOrder: 0, categoryId: womens.id } });
    const womensBras = await db.subcategory.create({ data: { name: "Bras", slug: "bras", displayOrder: 1, categoryId: womens.id } });
    const womensBottoms = await db.subcategory.create({ data: { name: "Bottoms", slug: "bottoms", displayOrder: 2, categoryId: womens.id } });
    const womensFootwear = await db.subcategory.create({ data: { name: "Footwear", slug: "footwear", displayOrder: 3, categoryId: womens.id } });
    const womensGloves = await db.subcategory.create({ data: { name: "Gloves", slug: "gloves", displayOrder: 4, categoryId: womens.id } });
    const womensHeadwear = await db.subcategory.create({ data: { name: "Headwear", slug: "headwear", displayOrder: 5, categoryId: womens.id } });
    const womensSocks = await db.subcategory.create({ data: { name: "Socks", slug: "socks", displayOrder: 6, categoryId: womens.id } });
    const womensPlus = await db.subcategory.create({ data: { name: "Plus Sizes", slug: "plus-sizes", displayOrder: 7, categoryId: womens.id } });

    const boysTops = await db.subcategory.create({ data: { name: "Tops", slug: "tops", displayOrder: 0, categoryId: boys.id } });
    const boysBottoms = await db.subcategory.create({ data: { name: "Bottoms", slug: "bottoms", displayOrder: 1, categoryId: boys.id } });
    const boysFootwear = await db.subcategory.create({ data: { name: "Footwear", slug: "footwear", displayOrder: 2, categoryId: boys.id } });
    const boysGloves = await db.subcategory.create({ data: { name: "Gloves", slug: "gloves", displayOrder: 3, categoryId: boys.id } });
    const boysHeadwear = await db.subcategory.create({ data: { name: "Headwear", slug: "headwear", displayOrder: 4, categoryId: boys.id } });
    const boysSocks = await db.subcategory.create({ data: { name: "Socks", slug: "socks", displayOrder: 5, categoryId: boys.id } });

    const girlsTops = await db.subcategory.create({ data: { name: "Tops", slug: "tops", displayOrder: 0, categoryId: girls.id } });
    const girlsBottoms = await db.subcategory.create({ data: { name: "Bottoms", slug: "bottoms", displayOrder: 1, categoryId: girls.id } });
    const girlsFootwear = await db.subcategory.create({ data: { name: "Footwear", slug: "footwear", displayOrder: 2, categoryId: girls.id } });
    const girlsGloves = await db.subcategory.create({ data: { name: "Gloves", slug: "gloves", displayOrder: 3, categoryId: girls.id } });
    const girlsHeadwear = await db.subcategory.create({ data: { name: "Headwear", slug: "headwear", displayOrder: 4, categoryId: girls.id } });
    const girlsSocks = await db.subcategory.create({ data: { name: "Socks", slug: "socks", displayOrder: 5, categoryId: girls.id } });

    // Create size charts from templates
    console.log("Creating size charts from templates...");

    // Men's apparel
    await createSizeChartFromTemplate(getTemplate("apparel-mens-tops"), "Tops", "mens-tops", [mensTops.id], instructions);
    await createSizeChartFromTemplate(getTemplate("apparel-mens-bottoms"), "Bottoms", "mens-bottoms", [mensBottoms.id], instructions);
    await createSizeChartFromTemplate(getTemplate("footwear-mens"), "Footwear", "mens-footwear", [mensFootwear.id], instructions);

    const glovesTemplate = getTemplate("accessories-gloves");
    await createSizeChartFromTemplate(glovesTemplate, "Gloves", "mens-gloves", [mensGloves.id], instructions, glovesTemplate.variants?.mens?.rows);

    const headwearTemplate = getTemplate("accessories-headwear");
    await createSizeChartFromTemplate(headwearTemplate, "Headwear", "mens-headwear", [mensHeadwear.id], instructions, headwearTemplate.variants?.mens?.rows);

    const socksTemplate = getTemplate("accessories-socks");
    await createSizeChartFromTemplate(socksTemplate, "Socks", "mens-socks", [mensSocks.id], instructions, socksTemplate.variants?.mens?.rows);

    // Women's apparel
    await createSizeChartFromTemplate(getTemplate("apparel-womens-tops"), "Tops", "womens-tops", [womensTops.id], instructions);
    await createSizeChartFromTemplate(getTemplate("apparel-womens-sports-bras"), "Sports Bras", "womens-sports-bras", [womensBras.id], instructions);
    await createSizeChartFromTemplate(getTemplate("apparel-womens-bottoms"), "Bottoms", "womens-bottoms", [womensBottoms.id], instructions);
    await createSizeChartFromTemplate(getTemplate("apparel-womens-plus-sizes"), "Plus Sizes", "womens-plus-sizes", [womensPlus.id], instructions);
    await createSizeChartFromTemplate(getTemplate("footwear-womens"), "Footwear", "womens-footwear", [womensFootwear.id], instructions);
    await createSizeChartFromTemplate(glovesTemplate, "Gloves", "womens-gloves", [womensGloves.id], instructions, glovesTemplate.variants?.womens?.rows);
    await createSizeChartFromTemplate(headwearTemplate, "Headwear", "womens-headwear", [womensHeadwear.id], instructions, headwearTemplate.variants?.womens?.rows);
    await createSizeChartFromTemplate(socksTemplate, "Socks", "womens-socks", [womensSocks.id], instructions, socksTemplate.variants?.womens?.rows);

    // Youth
    await createSizeChartFromTemplate(getTemplate("youth-big-kids-tops"), "Big Kids (8-20)", "youth-big-kids-tops", [boysTops.id, girlsTops.id], instructions);
    await createSizeChartFromTemplate(getTemplate("youth-big-kids-bottoms"), "Big Kids (8-20)", "youth-big-kids-bottoms", [boysBottoms.id, girlsBottoms.id], instructions);
    await createSizeChartFromTemplate(getTemplate("youth-little-kids"), "Little Kids (4-7)", "youth-little-kids", [boysTops.id, girlsTops.id, boysBottoms.id, girlsBottoms.id], instructions);
    await createSizeChartFromTemplate(getTemplate("youth-toddler"), "Toddler (2T-4T)", "youth-toddler", [boysTops.id, girlsTops.id, boysBottoms.id, girlsBottoms.id], instructions);
    await createSizeChartFromTemplate(getTemplate("youth-infant"), "Infant (0-24M)", "youth-infant", [boysTops.id, girlsTops.id, boysBottoms.id, girlsBottoms.id], instructions);
    await createSizeChartFromTemplate(getTemplate("footwear-kids"), "Youth Footwear", "youth-footwear", [boysFootwear.id, girlsFootwear.id], instructions);
    await createSizeChartFromTemplate(glovesTemplate, "Youth Gloves", "youth-gloves", [boysGloves.id, girlsGloves.id], instructions, glovesTemplate.variants?.youth?.rows);
    await createSizeChartFromTemplate(headwearTemplate, "Youth Headwear", "youth-headwear", [boysHeadwear.id, girlsHeadwear.id], instructions, headwearTemplate.variants?.youth?.rows);
    await createSizeChartFromTemplate(socksTemplate, "Youth Socks", "youth-socks", [boysSocks.id, girlsSocks.id], instructions, socksTemplate.variants?.youth?.rows);

    console.log("Demo database reset completed successfully!");

    // Store the reset time
    lastResetTime = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: "Demo database reset completed",
      timestamp: lastResetTime,
      data: {
        categories: 4,
        subcategories: 24,
        sizeCharts: 22,
        templates: templates.length,
      },
    });
  } catch (error) {
    console.error("Error resetting demo database:", error);
    return NextResponse.json(
      { error: "Failed to reset demo database" },
      { status: 500 }
    );
  }
}

// Calculate next reset time based on 6-hour cron schedule (0 */6 * * *)
function getNextResetTime(): string {
  const now = new Date();
  const hours = now.getUTCHours();
  const nextResetHour = Math.ceil(hours / 6) * 6;

  const nextReset = new Date(now);
  nextReset.setUTCHours(nextResetHour, 0, 0, 0);

  // If we're past the calculated time, add 6 hours
  if (nextReset <= now) {
    nextReset.setUTCHours(nextReset.getUTCHours() + 6);
  }

  return nextReset.toISOString();
}

// Also support GET for health checks and demo status
export async function GET() {
  const demoEnabled = await isDemoModeEnabled();

  if (!demoEnabled) {
    return NextResponse.json({ demo_mode: false });
  }

  return NextResponse.json({
    demo_mode: true,
    last_reset: lastResetTime,
    next_reset: getNextResetTime(),
    reset_interval_hours: 6,
  });
}
