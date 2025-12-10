import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ColumnType, MeasurementUnit } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper to create a size chart with columns and rows
async function createSizeChart(
  name: string,
  slug: string,
  description: string,
  subcategoryId: string,
  columns: Array<{
    name: string;
    columnType: ColumnType;
    unit: MeasurementUnit;
  }>,
  rows: Array<Record<string, { text?: string; value?: number; min?: number; max?: number }>>
) {
  const chart = await prisma.sizeChart.create({
    data: {
      name,
      slug,
      description,
      subcategoryId,
      isPublished: true,
      displayOrder: 0,
    },
  });

  const createdColumns = await Promise.all(
    columns.map((col, index) =>
      prisma.sizeChartColumn.create({
        data: {
          name: col.name,
          columnType: col.columnType,
          unit: col.unit,
          displayOrder: index,
          sizeChartId: chart.id,
        },
      })
    )
  );

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const rowData = rows[rowIndex];
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
        valueText: cellValue?.text ?? null,
        valueInches: cellValue?.value ?? null,
        valueMinInches: cellValue?.min ?? null,
        valueMaxInches: cellValue?.max ?? null,
      };
    });

    await prisma.sizeChartCell.createMany({ data: cellData });
  }

  return chart;
}

async function main() {
  console.log("Seeding database with Under Armour size data...");

  // Clear existing data
  await prisma.sizeChartCell.deleteMany();
  await prisma.sizeChartRow.deleteMany();
  await prisma.sizeChartColumn.deleteMany();
  await prisma.sizeChart.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();

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
  // SUBCATEGORIES - MEN'S
  // ============================================
  const mensTops = await prisma.subcategory.create({
    data: { name: "Tops", slug: "tops", displayOrder: 0, categoryId: mens.id },
  });

  const mensBottoms = await prisma.subcategory.create({
    data: { name: "Bottoms", slug: "bottoms", displayOrder: 1, categoryId: mens.id },
  });

  const mensFootwear = await prisma.subcategory.create({
    data: { name: "Footwear", slug: "footwear", displayOrder: 2, categoryId: mens.id },
  });

  const mensGloves = await prisma.subcategory.create({
    data: { name: "Gloves", slug: "gloves", displayOrder: 3, categoryId: mens.id },
  });

  const mensHeadwear = await prisma.subcategory.create({
    data: { name: "Headwear", slug: "headwear", displayOrder: 4, categoryId: mens.id },
  });

  const mensSocks = await prisma.subcategory.create({
    data: { name: "Socks", slug: "socks", displayOrder: 5, categoryId: mens.id },
  });

  // ============================================
  // SUBCATEGORIES - WOMEN'S
  // ============================================
  const womensTops = await prisma.subcategory.create({
    data: { name: "Tops", slug: "tops", displayOrder: 0, categoryId: womens.id },
  });

  const womensBras = await prisma.subcategory.create({
    data: { name: "Bras", slug: "bras", displayOrder: 1, categoryId: womens.id },
  });

  const womensBottoms = await prisma.subcategory.create({
    data: { name: "Bottoms", slug: "bottoms", displayOrder: 2, categoryId: womens.id },
  });

  const womensFootwear = await prisma.subcategory.create({
    data: { name: "Footwear", slug: "footwear", displayOrder: 3, categoryId: womens.id },
  });

  const womensGloves = await prisma.subcategory.create({
    data: { name: "Gloves", slug: "gloves", displayOrder: 4, categoryId: womens.id },
  });

  const womensHeadwear = await prisma.subcategory.create({
    data: { name: "Headwear", slug: "headwear", displayOrder: 5, categoryId: womens.id },
  });

  const womensSocks = await prisma.subcategory.create({
    data: { name: "Socks", slug: "socks", displayOrder: 6, categoryId: womens.id },
  });

  const womensPlus = await prisma.subcategory.create({
    data: { name: "Plus Sizes", slug: "plus-sizes", displayOrder: 7, categoryId: womens.id },
  });

  // ============================================
  // SUBCATEGORIES - BOYS
  // ============================================
  const boysTops = await prisma.subcategory.create({
    data: { name: "Tops", slug: "tops", displayOrder: 0, categoryId: boys.id },
  });

  const boysBottoms = await prisma.subcategory.create({
    data: { name: "Bottoms", slug: "bottoms", displayOrder: 1, categoryId: boys.id },
  });

  const boysFootwear = await prisma.subcategory.create({
    data: { name: "Footwear", slug: "footwear", displayOrder: 2, categoryId: boys.id },
  });

  const boysGloves = await prisma.subcategory.create({
    data: { name: "Gloves", slug: "gloves", displayOrder: 3, categoryId: boys.id },
  });

  const boysHeadwear = await prisma.subcategory.create({
    data: { name: "Headwear", slug: "headwear", displayOrder: 4, categoryId: boys.id },
  });

  const boysSocks = await prisma.subcategory.create({
    data: { name: "Socks", slug: "socks", displayOrder: 5, categoryId: boys.id },
  });

  // ============================================
  // SUBCATEGORIES - GIRLS
  // ============================================
  const girlsTops = await prisma.subcategory.create({
    data: { name: "Tops", slug: "tops", displayOrder: 0, categoryId: girls.id },
  });

  const girlsBottoms = await prisma.subcategory.create({
    data: { name: "Bottoms", slug: "bottoms", displayOrder: 1, categoryId: girls.id },
  });

  const girlsFootwear = await prisma.subcategory.create({
    data: { name: "Footwear", slug: "footwear", displayOrder: 2, categoryId: girls.id },
  });

  const girlsGloves = await prisma.subcategory.create({
    data: { name: "Gloves", slug: "gloves", displayOrder: 3, categoryId: girls.id },
  });

  const girlsHeadwear = await prisma.subcategory.create({
    data: { name: "Headwear", slug: "headwear", displayOrder: 4, categoryId: girls.id },
  });

  const girlsSocks = await prisma.subcategory.create({
    data: { name: "Socks", slug: "socks", displayOrder: 5, categoryId: girls.id },
  });

  console.log("Created subcategories");

  // ============================================
  // MEN'S TOPS
  // ============================================
  await createSizeChart(
    "Tops",
    "tops",
    "Men's shirts, t-shirts, polos, and jackets",
    mensTops.id,
    [
      { name: "Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "Chest", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
      { name: "Waist", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
    ],
    [
      { Size: { text: "XS" }, Chest: { min: 31, max: 34 }, Waist: { min: 28, max: 29 } },
      { Size: { text: "SM" }, Chest: { min: 34, max: 37 }, Waist: { min: 29, max: 31 } },
      { Size: { text: "MD" }, Chest: { min: 37, max: 41 }, Waist: { min: 31, max: 34 } },
      { Size: { text: "LG" }, Chest: { min: 41, max: 44 }, Waist: { min: 34, max: 37 } },
      { Size: { text: "XL" }, Chest: { min: 44, max: 48 }, Waist: { min: 37, max: 41 } },
      { Size: { text: "XXL" }, Chest: { min: 48, max: 52 }, Waist: { min: 41, max: 45.5 } },
      { Size: { text: "3XL" }, Chest: { min: 52, max: 56 }, Waist: { min: 45.5, max: 50 } },
      { Size: { text: "4XL" }, Chest: { min: 56, max: 60 }, Waist: { min: 50, max: 54.5 } },
      { Size: { text: "5XL" }, Chest: { min: 60, max: 64 }, Waist: { min: 54.5, max: 59 } },
    ]
  );
  console.log("Created Men's Tops");

  // ============================================
  // MEN'S BOTTOMS
  // ============================================
  await createSizeChart(
    "Bottoms",
    "bottoms",
    "Men's pants, shorts, and joggers",
    mensBottoms.id,
    [
      { name: "Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "Waist", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
      { name: "Hip", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
    ],
    [
      { Size: { text: "XS" }, Waist: { value: 28 }, Hip: { min: 33, max: 34 } },
      { Size: { text: "SM" }, Waist: { value: 30 }, Hip: { min: 34, max: 36 } },
      { Size: { text: "MD" }, Waist: { min: 32, max: 33 }, Hip: { min: 36, max: 39 } },
      { Size: { text: "LG" }, Waist: { min: 34, max: 36 }, Hip: { min: 39, max: 42 } },
      { Size: { text: "XL" }, Waist: { min: 38, max: 40 }, Hip: { min: 42, max: 46 } },
      { Size: { text: "XXL" }, Waist: { min: 42, max: 44 }, Hip: { min: 46, max: 50 } },
      { Size: { text: "3XL" }, Waist: { min: 46, max: 48 }, Hip: { min: 50, max: 54 } },
      { Size: { text: "4XL" }, Waist: { min: 50, max: 52 }, Hip: { min: 54, max: 58 } },
      { Size: { text: "5XL" }, Waist: { min: 54, max: 56 }, Hip: { min: 58, max: 62 } },
    ]
  );
  console.log("Created Men's Bottoms");

  // ============================================
  // MEN'S FOOTWEAR
  // ============================================
  await createSizeChart(
    "Footwear",
    "footwear",
    "Men's athletic shoes and sneakers",
    mensFootwear.id,
    [
      { name: "US", columnType: ColumnType.REGIONAL_SIZE, unit: MeasurementUnit.NONE },
      { name: "UK", columnType: ColumnType.REGIONAL_SIZE, unit: MeasurementUnit.NONE },
      { name: "EU", columnType: ColumnType.REGIONAL_SIZE, unit: MeasurementUnit.NONE },
      { name: "CM", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.CM },
    ],
    [
      { US: { text: "7" }, UK: { text: "6" }, EU: { text: "40" }, CM: { value: 25 } },
      { US: { text: "7.5" }, UK: { text: "6.5" }, EU: { text: "40.5" }, CM: { value: 25.5 } },
      { US: { text: "8" }, UK: { text: "7" }, EU: { text: "41" }, CM: { value: 26 } },
      { US: { text: "8.5" }, UK: { text: "7.5" }, EU: { text: "42" }, CM: { value: 26.5 } },
      { US: { text: "9" }, UK: { text: "8" }, EU: { text: "42.5" }, CM: { value: 27 } },
      { US: { text: "9.5" }, UK: { text: "8.5" }, EU: { text: "43" }, CM: { value: 27.5 } },
      { US: { text: "10" }, UK: { text: "9" }, EU: { text: "44" }, CM: { value: 28 } },
      { US: { text: "10.5" }, UK: { text: "9.5" }, EU: { text: "44.5" }, CM: { value: 28.5 } },
      { US: { text: "11" }, UK: { text: "10" }, EU: { text: "45" }, CM: { value: 29 } },
      { US: { text: "11.5" }, UK: { text: "10.5" }, EU: { text: "45.5" }, CM: { value: 29.5 } },
      { US: { text: "12" }, UK: { text: "11" }, EU: { text: "46" }, CM: { value: 30 } },
      { US: { text: "12.5" }, UK: { text: "11.5" }, EU: { text: "47" }, CM: { value: 30.5 } },
      { US: { text: "13" }, UK: { text: "12" }, EU: { text: "47.5" }, CM: { value: 31 } },
      { US: { text: "14" }, UK: { text: "13" }, EU: { text: "48.5" }, CM: { value: 32 } },
      { US: { text: "15" }, UK: { text: "14" }, EU: { text: "49.5" }, CM: { value: 33 } },
    ]
  );
  console.log("Created Men's Footwear");

  // ============================================
  // MEN'S GLOVES
  // ============================================
  await createSizeChart(
    "Gloves",
    "gloves",
    "Men's training and running gloves",
    mensGloves.id,
    [
      { name: "Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "Hand Circumference", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
      { name: "Hand Length", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
    ],
    [
      { Size: { text: "SM" }, "Hand Circumference": { min: 7, max: 7.5 }, "Hand Length": { min: 6.875, max: 7.125 } },
      { Size: { text: "MD" }, "Hand Circumference": { min: 7.625, max: 8.125 }, "Hand Length": { min: 7.25, max: 7.5 } },
      { Size: { text: "LG" }, "Hand Circumference": { min: 8.25, max: 8.75 }, "Hand Length": { min: 7.625, max: 7.875 } },
      { Size: { text: "XL" }, "Hand Circumference": { min: 8.875, max: 9.375 }, "Hand Length": { min: 8, max: 8.25 } },
      { Size: { text: "XXL" }, "Hand Circumference": { min: 9.5, max: 10 }, "Hand Length": { min: 8.375, max: 8.625 } },
    ]
  );
  console.log("Created Men's Gloves");

  // ============================================
  // MEN'S HEADWEAR
  // ============================================
  await createSizeChart(
    "Headwear",
    "headwear",
    "Men's caps, beanies, and headbands",
    mensHeadwear.id,
    [
      { name: "Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "Head Circumference", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
    ],
    [
      { Size: { text: "OSFM" }, "Head Circumference": { min: 21.625, max: 23.875 } },
      { Size: { text: "S/M" }, "Head Circumference": { min: 21.25, max: 22.5 } },
      { Size: { text: "M/L" }, "Head Circumference": { min: 22, max: 23.25 } },
      { Size: { text: "L/XL" }, "Head Circumference": { min: 22.75, max: 24 } },
      { Size: { text: "XL/XXL" }, "Head Circumference": { min: 23.5, max: 25 } },
    ]
  );
  console.log("Created Men's Headwear");

  // ============================================
  // MEN'S SOCKS
  // ============================================
  await createSizeChart(
    "Socks",
    "socks",
    "Men's athletic and training socks",
    mensSocks.id,
    [
      { name: "Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "US Shoe Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
    ],
    [
      { Size: { text: "SM" }, "US Shoe Size": { text: "4-8.5" } },
      { Size: { text: "MD" }, "US Shoe Size": { text: "7-8.5" } },
      { Size: { text: "LG" }, "US Shoe Size": { text: "8.5-13" } },
      { Size: { text: "XL" }, "US Shoe Size": { text: "13-16" } },
      { Size: { text: "OSFM" }, "US Shoe Size": { text: "4-12" } },
    ]
  );
  console.log("Created Men's Socks");

  // ============================================
  // WOMEN'S TOPS
  // ============================================
  await createSizeChart(
    "Tops",
    "tops",
    "Women's shirts, tanks, and jackets",
    womensTops.id,
    [
      { name: "Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "Bust", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
      { name: "Waist", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
    ],
    [
      { Size: { text: "XXS" }, Bust: { min: 31, max: 32.5 }, Waist: { min: 24.5, max: 25.5 } },
      { Size: { text: "XS" }, Bust: { min: 32.5, max: 33.5 }, Waist: { min: 25.5, max: 27 } },
      { Size: { text: "SM" }, Bust: { min: 33.5, max: 36 }, Waist: { min: 27, max: 29 } },
      { Size: { text: "MD" }, Bust: { min: 36, max: 38 }, Waist: { min: 29, max: 31 } },
      { Size: { text: "LG" }, Bust: { min: 38, max: 41 }, Waist: { min: 31, max: 34 } },
      { Size: { text: "XL" }, Bust: { min: 41, max: 44 }, Waist: { min: 34, max: 37 } },
      { Size: { text: "XXL" }, Bust: { min: 44, max: 47 }, Waist: { min: 37, max: 40 } },
    ]
  );
  console.log("Created Women's Tops");

  // ============================================
  // WOMEN'S BRAS
  // ============================================
  await createSizeChart(
    "Sports Bras",
    "sports-bras",
    "Sports bras sized by band and cup",
    womensBras.id,
    [
      { name: "Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "Band Size", columnType: ColumnType.BAND_SIZE, unit: MeasurementUnit.NONE },
      { name: "Cup Size", columnType: ColumnType.CUP_SIZE, unit: MeasurementUnit.NONE },
    ],
    [
      { Size: { text: "XXS" }, "Band Size": { text: "30" }, "Cup Size": { text: "A" } },
      { Size: { text: "XS" }, "Band Size": { text: "30-32" }, "Cup Size": { text: "A-B" } },
      { Size: { text: "SM" }, "Band Size": { text: "32-34" }, "Cup Size": { text: "B-C" } },
      { Size: { text: "MD" }, "Band Size": { text: "34-36" }, "Cup Size": { text: "C-D" } },
      { Size: { text: "LG" }, "Band Size": { text: "36-38" }, "Cup Size": { text: "D-DD" } },
      { Size: { text: "XL" }, "Band Size": { text: "38-40" }, "Cup Size": { text: "DD-DDD" } },
      { Size: { text: "XXL" }, "Band Size": { text: "40-42" }, "Cup Size": { text: "DDD" } },
      { Size: { text: "1X" }, "Band Size": { text: "40-42" }, "Cup Size": { text: "DDD-G" } },
      { Size: { text: "2X" }, "Band Size": { text: "42-44" }, "Cup Size": { text: "G-H" } },
      { Size: { text: "3X" }, "Band Size": { text: "44-46" }, "Cup Size": { text: "H" } },
    ]
  );
  console.log("Created Women's Bras");

  // ============================================
  // WOMEN'S BOTTOMS
  // ============================================
  await createSizeChart(
    "Bottoms",
    "bottoms",
    "Women's pants, shorts, leggings, and skirts",
    womensBottoms.id,
    [
      { name: "Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "Waist", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
      { name: "Hip", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
    ],
    [
      { Size: { text: "XXS" }, Waist: { min: 24.5, max: 25.5 }, Hip: { min: 33, max: 34.5 } },
      { Size: { text: "XS" }, Waist: { min: 25.5, max: 27 }, Hip: { min: 34.5, max: 36 } },
      { Size: { text: "SM" }, Waist: { min: 27, max: 29 }, Hip: { min: 36, max: 38 } },
      { Size: { text: "MD" }, Waist: { min: 29, max: 31 }, Hip: { min: 38, max: 40 } },
      { Size: { text: "LG" }, Waist: { min: 31, max: 34 }, Hip: { min: 40, max: 43 } },
      { Size: { text: "XL" }, Waist: { min: 34, max: 37 }, Hip: { min: 43, max: 46 } },
      { Size: { text: "XXL" }, Waist: { min: 37, max: 40 }, Hip: { min: 46, max: 49 } },
    ]
  );
  console.log("Created Women's Bottoms");

  // ============================================
  // WOMEN'S PLUS SIZES
  // ============================================
  await createSizeChart(
    "Plus Sizes",
    "plus-sizes",
    "Women's plus size tops and bottoms",
    womensPlus.id,
    [
      { name: "Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "Bust", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
      { name: "Waist", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
      { name: "Hip", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
    ],
    [
      { Size: { text: "1X" }, Bust: { min: 44, max: 47.5 }, Waist: { min: 39, max: 43.5 }, Hip: { min: 47, max: 50.5 } },
      { Size: { text: "2X" }, Bust: { min: 47.5, max: 51.5 }, Waist: { min: 43.5, max: 48.5 }, Hip: { min: 50.5, max: 54.5 } },
      { Size: { text: "3X" }, Bust: { min: 51.5, max: 55 }, Waist: { min: 48.5, max: 53 }, Hip: { min: 54.5, max: 58 } },
    ]
  );
  console.log("Created Women's Plus Sizes");

  // ============================================
  // WOMEN'S FOOTWEAR
  // ============================================
  await createSizeChart(
    "Footwear",
    "footwear",
    "Women's athletic shoes and sneakers",
    womensFootwear.id,
    [
      { name: "US", columnType: ColumnType.REGIONAL_SIZE, unit: MeasurementUnit.NONE },
      { name: "UK", columnType: ColumnType.REGIONAL_SIZE, unit: MeasurementUnit.NONE },
      { name: "EU", columnType: ColumnType.REGIONAL_SIZE, unit: MeasurementUnit.NONE },
      { name: "CM", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.CM },
    ],
    [
      { US: { text: "5" }, UK: { text: "2.5" }, EU: { text: "35.5" }, CM: { value: 22 } },
      { US: { text: "5.5" }, UK: { text: "3" }, EU: { text: "36" }, CM: { value: 22.5 } },
      { US: { text: "6" }, UK: { text: "3.5" }, EU: { text: "36.5" }, CM: { value: 23 } },
      { US: { text: "6.5" }, UK: { text: "4" }, EU: { text: "37.5" }, CM: { value: 23.5 } },
      { US: { text: "7" }, UK: { text: "4.5" }, EU: { text: "38" }, CM: { value: 24 } },
      { US: { text: "7.5" }, UK: { text: "5" }, EU: { text: "38.5" }, CM: { value: 24.5 } },
      { US: { text: "8" }, UK: { text: "5.5" }, EU: { text: "39" }, CM: { value: 25 } },
      { US: { text: "8.5" }, UK: { text: "6" }, EU: { text: "40" }, CM: { value: 25.5 } },
      { US: { text: "9" }, UK: { text: "6.5" }, EU: { text: "40.5" }, CM: { value: 26 } },
      { US: { text: "9.5" }, UK: { text: "7" }, EU: { text: "41" }, CM: { value: 26.5 } },
      { US: { text: "10" }, UK: { text: "7.5" }, EU: { text: "42" }, CM: { value: 27 } },
      { US: { text: "10.5" }, UK: { text: "8" }, EU: { text: "42.5" }, CM: { value: 27.5 } },
      { US: { text: "11" }, UK: { text: "8.5" }, EU: { text: "43" }, CM: { value: 28 } },
      { US: { text: "12" }, UK: { text: "9.5" }, EU: { text: "44" }, CM: { value: 29 } },
    ]
  );
  console.log("Created Women's Footwear");

  // ============================================
  // WOMEN'S GLOVES
  // ============================================
  await createSizeChart(
    "Gloves",
    "gloves",
    "Women's training and running gloves",
    womensGloves.id,
    [
      { name: "Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "Hand Circumference", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
      { name: "Hand Length", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
    ],
    [
      { Size: { text: "XS" }, "Hand Circumference": { min: 5.75, max: 6.25 }, "Hand Length": { min: 6, max: 6.25 } },
      { Size: { text: "SM" }, "Hand Circumference": { min: 6.375, max: 6.875 }, "Hand Length": { min: 6.375, max: 6.625 } },
      { Size: { text: "MD" }, "Hand Circumference": { min: 7, max: 7.5 }, "Hand Length": { min: 6.75, max: 7 } },
      { Size: { text: "LG" }, "Hand Circumference": { min: 7.625, max: 8.125 }, "Hand Length": { min: 7.125, max: 7.375 } },
      { Size: { text: "XL" }, "Hand Circumference": { min: 8.25, max: 8.75 }, "Hand Length": { min: 7.5, max: 7.75 } },
    ]
  );
  console.log("Created Women's Gloves");

  // ============================================
  // WOMEN'S HEADWEAR
  // ============================================
  await createSizeChart(
    "Headwear",
    "headwear",
    "Women's caps, beanies, and headbands",
    womensHeadwear.id,
    [
      { name: "Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "Head Circumference", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
    ],
    [
      { Size: { text: "OSFM" }, "Head Circumference": { min: 20.875, max: 22.125 } },
      { Size: { text: "S/M" }, "Head Circumference": { min: 21.25, max: 22.5 } },
      { Size: { text: "M/L" }, "Head Circumference": { min: 22, max: 23.25 } },
      { Size: { text: "L/XL" }, "Head Circumference": { min: 22.75, max: 24 } },
    ]
  );
  console.log("Created Women's Headwear");

  // ============================================
  // WOMEN'S SOCKS
  // ============================================
  await createSizeChart(
    "Socks",
    "socks",
    "Women's athletic and training socks",
    womensSocks.id,
    [
      { name: "Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "US Shoe Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
    ],
    [
      { Size: { text: "SM" }, "US Shoe Size": { text: "4-6" } },
      { Size: { text: "MD" }, "US Shoe Size": { text: "6-10" } },
      { Size: { text: "LG" }, "US Shoe Size": { text: "10-14" } },
      { Size: { text: "OSFM" }, "US Shoe Size": { text: "5.5-12" } },
    ]
  );
  console.log("Created Women's Socks");

  // ============================================
  // BOYS TOPS
  // ============================================
  await createSizeChart(
    "Tops",
    "tops",
    "Boys shirts, t-shirts, and jackets",
    boysTops.id,
    [
      { name: "Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "Numeric", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "Chest", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
      { name: "Height", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
    ],
    [
      { Size: { text: "YXS" }, Numeric: { text: "7" }, Chest: { min: 25, max: 26 }, Height: { min: 47, max: 50.5 } },
      { Size: { text: "YSM" }, Numeric: { text: "8" }, Chest: { min: 26, max: 27 }, Height: { min: 50.5, max: 53 } },
      { Size: { text: "YMD" }, Numeric: { text: "10-12" }, Chest: { min: 27, max: 29 }, Height: { min: 53, max: 59 } },
      { Size: { text: "YLG" }, Numeric: { text: "14-16" }, Chest: { min: 29, max: 32.5 }, Height: { min: 59, max: 65 } },
      { Size: { text: "YXL" }, Numeric: { text: "18-20" }, Chest: { min: 32.5, max: 35.5 }, Height: { min: 65, max: 70 } },
    ]
  );
  console.log("Created Boys Tops");

  // ============================================
  // BOYS BOTTOMS
  // ============================================
  await createSizeChart(
    "Bottoms",
    "bottoms",
    "Boys pants, shorts, and joggers",
    boysBottoms.id,
    [
      { name: "Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "Numeric", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "Waist", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
      { name: "Hip", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
      { name: "Height", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
    ],
    [
      { Size: { text: "YXS" }, Numeric: { text: "7" }, Waist: { min: 23, max: 24 }, Hip: { min: 26, max: 27 }, Height: { min: 47, max: 50.5 } },
      { Size: { text: "YSM" }, Numeric: { text: "8" }, Waist: { min: 24, max: 25 }, Hip: { min: 27, max: 28 }, Height: { min: 50.5, max: 53 } },
      { Size: { text: "YMD" }, Numeric: { text: "10-12" }, Waist: { min: 25, max: 27 }, Hip: { min: 28, max: 31 }, Height: { min: 53, max: 59 } },
      { Size: { text: "YLG" }, Numeric: { text: "14-16" }, Waist: { min: 27, max: 30 }, Hip: { min: 31, max: 34 }, Height: { min: 59, max: 65 } },
      { Size: { text: "YXL" }, Numeric: { text: "18-20" }, Waist: { min: 30, max: 33 }, Hip: { min: 34, max: 37 }, Height: { min: 65, max: 70 } },
    ]
  );
  console.log("Created Boys Bottoms");

  // ============================================
  // BOYS FOOTWEAR
  // ============================================
  await createSizeChart(
    "Footwear",
    "footwear",
    "Boys athletic shoes and sneakers",
    boysFootwear.id,
    [
      { name: "US", columnType: ColumnType.REGIONAL_SIZE, unit: MeasurementUnit.NONE },
      { name: "UK", columnType: ColumnType.REGIONAL_SIZE, unit: MeasurementUnit.NONE },
      { name: "EU", columnType: ColumnType.REGIONAL_SIZE, unit: MeasurementUnit.NONE },
      { name: "CM", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.CM },
    ],
    [
      { US: { text: "3.5Y" }, UK: { text: "3" }, EU: { text: "35.5" }, CM: { value: 22.5 } },
      { US: { text: "4Y" }, UK: { text: "3.5" }, EU: { text: "36" }, CM: { value: 23 } },
      { US: { text: "4.5Y" }, UK: { text: "4" }, EU: { text: "36.5" }, CM: { value: 23.5 } },
      { US: { text: "5Y" }, UK: { text: "4.5" }, EU: { text: "37.5" }, CM: { value: 24 } },
      { US: { text: "5.5Y" }, UK: { text: "5" }, EU: { text: "38" }, CM: { value: 24.5 } },
      { US: { text: "6Y" }, UK: { text: "5.5" }, EU: { text: "38.5" }, CM: { value: 25 } },
      { US: { text: "6.5Y" }, UK: { text: "6" }, EU: { text: "39" }, CM: { value: 25.5 } },
      { US: { text: "7Y" }, UK: { text: "6.5" }, EU: { text: "40" }, CM: { value: 26 } },
    ]
  );
  console.log("Created Boys Footwear");

  // ============================================
  // BOYS GLOVES
  // ============================================
  await createSizeChart(
    "Gloves",
    "gloves",
    "Boys training and sport gloves",
    boysGloves.id,
    [
      { name: "Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "Hand Length", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
    ],
    [
      { Size: { text: "YSM" }, "Hand Length": { min: 6.25, max: 6.5 } },
      { Size: { text: "YMD" }, "Hand Length": { min: 6.5, max: 6.75 } },
      { Size: { text: "YLG" }, "Hand Length": { min: 6.75, max: 7 } },
    ]
  );
  console.log("Created Boys Gloves");

  // ============================================
  // BOYS HEADWEAR
  // ============================================
  await createSizeChart(
    "Headwear",
    "headwear",
    "Boys caps, beanies, and headbands",
    boysHeadwear.id,
    [
      { name: "Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "Head Circumference", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
    ],
    [
      { Size: { text: "OSFM" }, "Head Circumference": { min: 20, max: 21.5 } },
      { Size: { text: "S/M" }, "Head Circumference": { min: 19.5, max: 21 } },
      { Size: { text: "M/L" }, "Head Circumference": { min: 20.5, max: 22 } },
    ]
  );
  console.log("Created Boys Headwear");

  // ============================================
  // BOYS SOCKS
  // ============================================
  await createSizeChart(
    "Socks",
    "socks",
    "Boys athletic and training socks",
    boysSocks.id,
    [
      { name: "Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "US Shoe Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
    ],
    [
      { Size: { text: "YSM" }, "US Shoe Size": { text: "13.5K-4Y" } },
      { Size: { text: "YMD" }, "US Shoe Size": { text: "4Y-7Y" } },
      { Size: { text: "YLG" }, "US Shoe Size": { text: "1Y-4Y" } },
    ]
  );
  console.log("Created Boys Socks");

  // ============================================
  // GIRLS TOPS
  // ============================================
  await createSizeChart(
    "Tops",
    "tops",
    "Girls shirts, tanks, and jackets",
    girlsTops.id,
    [
      { name: "Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "Numeric", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "Chest", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
      { name: "Height", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
    ],
    [
      { Size: { text: "YXS" }, Numeric: { text: "7" }, Chest: { min: 25, max: 26.5 }, Height: { min: 47, max: 51 } },
      { Size: { text: "YSM" }, Numeric: { text: "8" }, Chest: { min: 26.5, max: 27.5 }, Height: { min: 51, max: 53 } },
      { Size: { text: "YMD" }, Numeric: { text: "10-12" }, Chest: { min: 27.5, max: 30.5 }, Height: { min: 53, max: 58.5 } },
      { Size: { text: "YLG" }, Numeric: { text: "14-16" }, Chest: { min: 30.5, max: 34 }, Height: { min: 58.5, max: 63 } },
      { Size: { text: "YXL" }, Numeric: { text: "18" }, Chest: { min: 34, max: 36 }, Height: { min: 58.5, max: 63 } },
    ]
  );
  console.log("Created Girls Tops");

  // ============================================
  // GIRLS BOTTOMS
  // ============================================
  await createSizeChart(
    "Bottoms",
    "bottoms",
    "Girls pants, shorts, leggings, and skirts",
    girlsBottoms.id,
    [
      { name: "Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "Numeric", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "Waist", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
      { name: "Hip", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
      { name: "Height", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
    ],
    [
      { Size: { text: "YXS" }, Numeric: { text: "7" }, Waist: { min: 23, max: 24 }, Hip: { min: 26, max: 28 }, Height: { min: 47, max: 51 } },
      { Size: { text: "YSM" }, Numeric: { text: "8" }, Waist: { min: 24, max: 24.5 }, Hip: { min: 28, max: 29 }, Height: { min: 51, max: 53 } },
      { Size: { text: "YMD" }, Numeric: { text: "10-12" }, Waist: { min: 24.5, max: 26.5 }, Hip: { min: 29, max: 32.5 }, Height: { min: 53, max: 58.5 } },
      { Size: { text: "YLG" }, Numeric: { text: "14-16" }, Waist: { min: 26.5, max: 30.5 }, Hip: { min: 32.5, max: 36.5 }, Height: { min: 58.5, max: 63 } },
      { Size: { text: "YXL" }, Numeric: { text: "18" }, Waist: { min: 30.5, max: 32.5 }, Hip: { min: 36.5, max: 38.5 }, Height: { min: 58.5, max: 63 } },
    ]
  );
  console.log("Created Girls Bottoms");

  // ============================================
  // GIRLS FOOTWEAR
  // ============================================
  await createSizeChart(
    "Footwear",
    "footwear",
    "Girls athletic shoes and sneakers",
    girlsFootwear.id,
    [
      { name: "US", columnType: ColumnType.REGIONAL_SIZE, unit: MeasurementUnit.NONE },
      { name: "UK", columnType: ColumnType.REGIONAL_SIZE, unit: MeasurementUnit.NONE },
      { name: "EU", columnType: ColumnType.REGIONAL_SIZE, unit: MeasurementUnit.NONE },
      { name: "CM", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.CM },
    ],
    [
      { US: { text: "3.5Y" }, UK: { text: "3" }, EU: { text: "35.5" }, CM: { value: 22.5 } },
      { US: { text: "4Y" }, UK: { text: "3.5" }, EU: { text: "36" }, CM: { value: 23 } },
      { US: { text: "4.5Y" }, UK: { text: "4" }, EU: { text: "36.5" }, CM: { value: 23.5 } },
      { US: { text: "5Y" }, UK: { text: "4.5" }, EU: { text: "37.5" }, CM: { value: 24 } },
      { US: { text: "5.5Y" }, UK: { text: "5" }, EU: { text: "38" }, CM: { value: 24.5 } },
      { US: { text: "6Y" }, UK: { text: "5.5" }, EU: { text: "38.5" }, CM: { value: 25 } },
      { US: { text: "6.5Y" }, UK: { text: "6" }, EU: { text: "39" }, CM: { value: 25.5 } },
      { US: { text: "7Y" }, UK: { text: "6.5" }, EU: { text: "40" }, CM: { value: 26 } },
    ]
  );
  console.log("Created Girls Footwear");

  // ============================================
  // GIRLS GLOVES
  // ============================================
  await createSizeChart(
    "Gloves",
    "gloves",
    "Girls training and sport gloves",
    girlsGloves.id,
    [
      { name: "Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "Hand Length", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
    ],
    [
      { Size: { text: "YSM" }, "Hand Length": { min: 6.25, max: 6.5 } },
      { Size: { text: "YMD" }, "Hand Length": { min: 6.5, max: 6.75 } },
      { Size: { text: "YLG" }, "Hand Length": { min: 6.75, max: 7 } },
    ]
  );
  console.log("Created Girls Gloves");

  // ============================================
  // GIRLS HEADWEAR
  // ============================================
  await createSizeChart(
    "Headwear",
    "headwear",
    "Girls caps, beanies, and headbands",
    girlsHeadwear.id,
    [
      { name: "Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "Head Circumference", columnType: ColumnType.MEASUREMENT, unit: MeasurementUnit.INCHES },
    ],
    [
      { Size: { text: "OSFM" }, "Head Circumference": { min: 19.5, max: 21 } },
      { Size: { text: "S/M" }, "Head Circumference": { min: 19, max: 20.5 } },
      { Size: { text: "M/L" }, "Head Circumference": { min: 20, max: 21.5 } },
    ]
  );
  console.log("Created Girls Headwear");

  // ============================================
  // GIRLS SOCKS
  // ============================================
  await createSizeChart(
    "Socks",
    "socks",
    "Girls athletic and training socks",
    girlsSocks.id,
    [
      { name: "Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
      { name: "US Shoe Size", columnType: ColumnType.SIZE_LABEL, unit: MeasurementUnit.NONE },
    ],
    [
      { Size: { text: "YSM" }, "US Shoe Size": { text: "13.5K-4Y" } },
      { Size: { text: "YMD" }, "US Shoe Size": { text: "4Y-7Y" } },
      { Size: { text: "YLG" }, "US Shoe Size": { text: "1Y-4Y" } },
    ]
  );
  console.log("Created Girls Socks");

  console.log("\n✅ Database seeding completed with Under Armour size data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
