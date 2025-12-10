import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ColumnType, MeasurementUnit } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.sizeChartCell.deleteMany();
  await prisma.sizeChartRow.deleteMany();
  await prisma.sizeChartColumn.deleteMany();
  await prisma.sizeChart.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();

  // Create categories
  const womens = await prisma.category.create({
    data: {
      name: "Women's",
      slug: "womens",
      displayOrder: 0,
    },
  });

  const mens = await prisma.category.create({
    data: {
      name: "Men's",
      slug: "mens",
      displayOrder: 1,
    },
  });

  const accessories = await prisma.category.create({
    data: {
      name: "Accessories",
      slug: "accessories",
      displayOrder: 2,
    },
  });

  console.log("Created categories");

  // Create subcategories for Women's
  const womensBottoms = await prisma.subcategory.create({
    data: {
      name: "Bottoms",
      slug: "bottoms",
      displayOrder: 0,
      categoryId: womens.id,
    },
  });

  const womensTops = await prisma.subcategory.create({
    data: {
      name: "Tops",
      slug: "tops",
      displayOrder: 1,
      categoryId: womens.id,
    },
  });

  const womensBras = await prisma.subcategory.create({
    data: {
      name: "Bras",
      slug: "bras",
      displayOrder: 2,
      categoryId: womens.id,
    },
  });

  const womensLeggings = await prisma.subcategory.create({
    data: {
      name: "Leggings",
      slug: "leggings",
      displayOrder: 3,
      categoryId: womens.id,
    },
  });

  const womensShoes = await prisma.subcategory.create({
    data: {
      name: "Shoes",
      slug: "shoes",
      displayOrder: 4,
      categoryId: womens.id,
    },
  });

  // Create subcategories for Men's
  const mensBottoms = await prisma.subcategory.create({
    data: {
      name: "Bottoms",
      slug: "bottoms",
      displayOrder: 0,
      categoryId: mens.id,
    },
  });

  const mensTops = await prisma.subcategory.create({
    data: {
      name: "Tops",
      slug: "tops",
      displayOrder: 1,
      categoryId: mens.id,
    },
  });

  const mensShoes = await prisma.subcategory.create({
    data: {
      name: "Shoes",
      slug: "shoes",
      displayOrder: 2,
      categoryId: mens.id,
    },
  });

  // Create subcategories for Accessories
  const hats = await prisma.subcategory.create({
    data: {
      name: "Hats",
      slug: "hats",
      displayOrder: 0,
      categoryId: accessories.id,
    },
  });

  const bags = await prisma.subcategory.create({
    data: {
      name: "Bags",
      slug: "bags",
      displayOrder: 1,
      categoryId: accessories.id,
    },
  });

  console.log("Created subcategories");

  // Create a sample Women's Bottoms size chart
  const womensBottomsChart = await prisma.sizeChart.create({
    data: {
      name: "Regular Fit",
      slug: "regular-fit",
      description: "Standard fit bottoms including pants, shorts, and skirts",
      subcategoryId: womensBottoms.id,
      isPublished: true,
      displayOrder: 0,
    },
  });

  // Create columns for Women's Bottoms
  const sizeCol = await prisma.sizeChartColumn.create({
    data: {
      name: "Size",
      columnType: ColumnType.SIZE_LABEL,
      unit: MeasurementUnit.NONE,
      displayOrder: 0,
      sizeChartId: womensBottomsChart.id,
    },
  });

  const numericCol = await prisma.sizeChartColumn.create({
    data: {
      name: "Numeric",
      columnType: ColumnType.SIZE_LABEL,
      unit: MeasurementUnit.NONE,
      displayOrder: 1,
      sizeChartId: womensBottomsChart.id,
    },
  });

  const waistCol = await prisma.sizeChartColumn.create({
    data: {
      name: "Waist",
      columnType: ColumnType.MEASUREMENT,
      unit: MeasurementUnit.INCHES,
      displayOrder: 2,
      sizeChartId: womensBottomsChart.id,
    },
  });

  const hipCol = await prisma.sizeChartColumn.create({
    data: {
      name: "Hip",
      columnType: ColumnType.MEASUREMENT,
      unit: MeasurementUnit.INCHES,
      displayOrder: 3,
      sizeChartId: womensBottomsChart.id,
    },
  });

  const usCol = await prisma.sizeChartColumn.create({
    data: {
      name: "US",
      columnType: ColumnType.REGIONAL_SIZE,
      unit: MeasurementUnit.NONE,
      displayOrder: 4,
      sizeChartId: womensBottomsChart.id,
    },
  });

  const euCol = await prisma.sizeChartColumn.create({
    data: {
      name: "EU",
      columnType: ColumnType.REGIONAL_SIZE,
      unit: MeasurementUnit.NONE,
      displayOrder: 5,
      sizeChartId: womensBottomsChart.id,
    },
  });

  // Sample size data for Women's Bottoms
  const sizes = [
    { alpha: "XXS", numeric: "0", waist: 24, hip: 34, us: "0", eu: "32" },
    { alpha: "XS", numeric: "2", waist: 25, hip: 35, us: "2", eu: "34" },
    { alpha: "S", numeric: "4", waist: 26, hip: 36, us: "4", eu: "36" },
    { alpha: "S", numeric: "6", waist: 27, hip: 37, us: "6", eu: "38" },
    { alpha: "M", numeric: "8", waist: 28, hip: 38, us: "8", eu: "40" },
    { alpha: "M", numeric: "10", waist: 29, hip: 39, us: "10", eu: "42" },
    { alpha: "L", numeric: "12", waist: 30.5, hip: 40.5, us: "12", eu: "44" },
    { alpha: "L", numeric: "14", waist: 32, hip: 42, us: "14", eu: "46" },
    { alpha: "XL", numeric: "16", waist: 34, hip: 44, us: "16", eu: "48" },
    { alpha: "XL", numeric: "18", waist: 36, hip: 46, us: "18", eu: "50" },
    { alpha: "XXL", numeric: "20", waist: 38, hip: 48, us: "20", eu: "52" },
  ];

  for (let i = 0; i < sizes.length; i++) {
    const size = sizes[i];
    const row = await prisma.sizeChartRow.create({
      data: {
        sizeChartId: womensBottomsChart.id,
        displayOrder: i,
      },
    });

    await prisma.sizeChartCell.createMany({
      data: [
        { rowId: row.id, columnId: sizeCol.id, valueText: size.alpha },
        { rowId: row.id, columnId: numericCol.id, valueText: size.numeric },
        { rowId: row.id, columnId: waistCol.id, valueInches: size.waist },
        { rowId: row.id, columnId: hipCol.id, valueInches: size.hip },
        { rowId: row.id, columnId: usCol.id, valueText: size.us },
        { rowId: row.id, columnId: euCol.id, valueText: size.eu },
      ],
    });
  }

  console.log("Created Women's Bottoms size chart");

  // Create Women's Leggings size chart (with range values)
  const womensLeggingsChart = await prisma.sizeChart.create({
    data: {
      name: "Contour Fit",
      slug: "contour-fit",
      description: "Compression leggings with contouring seams",
      subcategoryId: womensLeggings.id,
      isPublished: true,
      displayOrder: 0,
    },
  });

  const legSizeCol = await prisma.sizeChartColumn.create({
    data: {
      name: "Size",
      columnType: ColumnType.SIZE_LABEL,
      unit: MeasurementUnit.NONE,
      displayOrder: 0,
      sizeChartId: womensLeggingsChart.id,
    },
  });

  const legWaistCol = await prisma.sizeChartColumn.create({
    data: {
      name: "Waist",
      columnType: ColumnType.MEASUREMENT,
      unit: MeasurementUnit.INCHES,
      displayOrder: 1,
      sizeChartId: womensLeggingsChart.id,
    },
  });

  const legHipCol = await prisma.sizeChartColumn.create({
    data: {
      name: "Hip",
      columnType: ColumnType.MEASUREMENT,
      unit: MeasurementUnit.INCHES,
      displayOrder: 2,
      sizeChartId: womensLeggingsChart.id,
    },
  });

  const legInseamCol = await prisma.sizeChartColumn.create({
    data: {
      name: "Inseam",
      columnType: ColumnType.MEASUREMENT,
      unit: MeasurementUnit.INCHES,
      displayOrder: 3,
      sizeChartId: womensLeggingsChart.id,
    },
  });

  const leggingSizes = [
    { size: "XS", waistMin: 24, waistMax: 26, hipMin: 34, hipMax: 36, inseam: 27 },
    { size: "S", waistMin: 26, waistMax: 28, hipMin: 36, hipMax: 38, inseam: 27.5 },
    { size: "M", waistMin: 28, waistMax: 30, hipMin: 38, hipMax: 40, inseam: 28 },
    { size: "L", waistMin: 30, waistMax: 33, hipMin: 40, hipMax: 43, inseam: 28.5 },
    { size: "XL", waistMin: 33, waistMax: 36, hipMin: 43, hipMax: 46, inseam: 29 },
  ];

  for (let i = 0; i < leggingSizes.length; i++) {
    const size = leggingSizes[i];
    const row = await prisma.sizeChartRow.create({
      data: {
        sizeChartId: womensLeggingsChart.id,
        displayOrder: i,
      },
    });

    await prisma.sizeChartCell.createMany({
      data: [
        { rowId: row.id, columnId: legSizeCol.id, valueText: size.size },
        { rowId: row.id, columnId: legWaistCol.id, valueMinInches: size.waistMin, valueMaxInches: size.waistMax },
        { rowId: row.id, columnId: legHipCol.id, valueMinInches: size.hipMin, valueMaxInches: size.hipMax },
        { rowId: row.id, columnId: legInseamCol.id, valueInches: size.inseam },
      ],
    });
  }

  console.log("Created Women's Leggings size chart");

  // Create Women's Bras size chart
  const womensBrasChart = await prisma.sizeChart.create({
    data: {
      name: "Sports Bra",
      slug: "sports-bra",
      description: "High-support sports bras",
      subcategoryId: womensBras.id,
      isPublished: true,
      displayOrder: 0,
    },
  });

  const braSizeCol = await prisma.sizeChartColumn.create({
    data: {
      name: "Size",
      columnType: ColumnType.SIZE_LABEL,
      unit: MeasurementUnit.NONE,
      displayOrder: 0,
      sizeChartId: womensBrasChart.id,
    },
  });

  const bandCol = await prisma.sizeChartColumn.create({
    data: {
      name: "Band",
      columnType: ColumnType.BAND_SIZE,
      unit: MeasurementUnit.NONE,
      displayOrder: 1,
      sizeChartId: womensBrasChart.id,
    },
  });

  const cupCol = await prisma.sizeChartColumn.create({
    data: {
      name: "Cup",
      columnType: ColumnType.CUP_SIZE,
      unit: MeasurementUnit.NONE,
      displayOrder: 2,
      sizeChartId: womensBrasChart.id,
    },
  });

  const underBustCol = await prisma.sizeChartColumn.create({
    data: {
      name: "Under Bust",
      columnType: ColumnType.MEASUREMENT,
      unit: MeasurementUnit.INCHES,
      displayOrder: 3,
      sizeChartId: womensBrasChart.id,
    },
  });

  const bustCol = await prisma.sizeChartColumn.create({
    data: {
      name: "Bust",
      columnType: ColumnType.MEASUREMENT,
      unit: MeasurementUnit.INCHES,
      displayOrder: 4,
      sizeChartId: womensBrasChart.id,
    },
  });

  const braSizes = [
    { size: "XS", band: "30-32", cup: "A-B", underBustMin: 26, underBustMax: 28, bustMin: 30, bustMax: 33 },
    { size: "S", band: "32-34", cup: "B-C", underBustMin: 28, underBustMax: 30, bustMin: 33, bustMax: 36 },
    { size: "M", band: "34-36", cup: "C-D", underBustMin: 30, underBustMax: 32, bustMin: 36, bustMax: 39 },
    { size: "L", band: "36-38", cup: "D-DD", underBustMin: 32, underBustMax: 35, bustMin: 39, bustMax: 42 },
    { size: "XL", band: "38-40", cup: "DD-DDD", underBustMin: 35, underBustMax: 38, bustMin: 42, bustMax: 46 },
  ];

  for (let i = 0; i < braSizes.length; i++) {
    const size = braSizes[i];
    const row = await prisma.sizeChartRow.create({
      data: {
        sizeChartId: womensBrasChart.id,
        displayOrder: i,
      },
    });

    await prisma.sizeChartCell.createMany({
      data: [
        { rowId: row.id, columnId: braSizeCol.id, valueText: size.size },
        { rowId: row.id, columnId: bandCol.id, valueText: size.band },
        { rowId: row.id, columnId: cupCol.id, valueText: size.cup },
        { rowId: row.id, columnId: underBustCol.id, valueMinInches: size.underBustMin, valueMaxInches: size.underBustMax },
        { rowId: row.id, columnId: bustCol.id, valueMinInches: size.bustMin, valueMaxInches: size.bustMax },
      ],
    });
  }

  console.log("Created Women's Bras size chart");

  // Create Men's Tops size chart
  const mensTopsChart = await prisma.sizeChart.create({
    data: {
      name: "T-Shirts",
      slug: "t-shirts",
      description: "Regular fit t-shirts and casual tops",
      subcategoryId: mensTops.id,
      isPublished: true,
      displayOrder: 0,
    },
  });

  const mensSizeCol = await prisma.sizeChartColumn.create({
    data: {
      name: "Size",
      columnType: ColumnType.SIZE_LABEL,
      unit: MeasurementUnit.NONE,
      displayOrder: 0,
      sizeChartId: mensTopsChart.id,
    },
  });

  const mensChestCol = await prisma.sizeChartColumn.create({
    data: {
      name: "Chest",
      columnType: ColumnType.MEASUREMENT,
      unit: MeasurementUnit.INCHES,
      displayOrder: 1,
      sizeChartId: mensTopsChart.id,
    },
  });

  const mensWaistCol = await prisma.sizeChartColumn.create({
    data: {
      name: "Waist",
      columnType: ColumnType.MEASUREMENT,
      unit: MeasurementUnit.INCHES,
      displayOrder: 2,
      sizeChartId: mensTopsChart.id,
    },
  });

  const mensLengthCol = await prisma.sizeChartColumn.create({
    data: {
      name: "Body Length",
      columnType: ColumnType.MEASUREMENT,
      unit: MeasurementUnit.INCHES,
      displayOrder: 3,
      sizeChartId: mensTopsChart.id,
    },
  });

  const mensTopsData = [
    { size: "S", chestMin: 34, chestMax: 37, waistMin: 28, waistMax: 31, length: 27 },
    { size: "M", chestMin: 38, chestMax: 41, waistMin: 32, waistMax: 35, length: 28 },
    { size: "L", chestMin: 42, chestMax: 45, waistMin: 36, waistMax: 39, length: 29 },
    { size: "XL", chestMin: 46, chestMax: 49, waistMin: 40, waistMax: 43, length: 30 },
    { size: "XXL", chestMin: 50, chestMax: 53, waistMin: 44, waistMax: 47, length: 31 },
  ];

  for (let i = 0; i < mensTopsData.length; i++) {
    const size = mensTopsData[i];
    const row = await prisma.sizeChartRow.create({
      data: {
        sizeChartId: mensTopsChart.id,
        displayOrder: i,
      },
    });

    await prisma.sizeChartCell.createMany({
      data: [
        { rowId: row.id, columnId: mensSizeCol.id, valueText: size.size },
        { rowId: row.id, columnId: mensChestCol.id, valueMinInches: size.chestMin, valueMaxInches: size.chestMax },
        { rowId: row.id, columnId: mensWaistCol.id, valueMinInches: size.waistMin, valueMaxInches: size.waistMax },
        { rowId: row.id, columnId: mensLengthCol.id, valueInches: size.length },
      ],
    });
  }

  console.log("Created Men's Tops size chart");

  // Create Women's Shoes size chart
  const womensShoesChart = await prisma.sizeChart.create({
    data: {
      name: "Running Shoes",
      slug: "running-shoes",
      description: "Athletic running shoes",
      subcategoryId: womensShoes.id,
      isPublished: true,
      displayOrder: 0,
    },
  });

  const usWomensSizeCol = await prisma.sizeChartColumn.create({
    data: {
      name: "US Women's",
      columnType: ColumnType.REGIONAL_SIZE,
      unit: MeasurementUnit.NONE,
      displayOrder: 0,
      sizeChartId: womensShoesChart.id,
    },
  });

  const ukWomensSizeCol = await prisma.sizeChartColumn.create({
    data: {
      name: "UK",
      columnType: ColumnType.REGIONAL_SIZE,
      unit: MeasurementUnit.NONE,
      displayOrder: 1,
      sizeChartId: womensShoesChart.id,
    },
  });

  const euWomensSizeCol = await prisma.sizeChartColumn.create({
    data: {
      name: "EU",
      columnType: ColumnType.REGIONAL_SIZE,
      unit: MeasurementUnit.NONE,
      displayOrder: 2,
      sizeChartId: womensShoesChart.id,
    },
  });

  const footLengthCol = await prisma.sizeChartColumn.create({
    data: {
      name: "Foot Length",
      columnType: ColumnType.MEASUREMENT,
      unit: MeasurementUnit.INCHES,
      displayOrder: 3,
      sizeChartId: womensShoesChart.id,
    },
  });

  const shoeSizes = [
    { us: "5", uk: "2.5", eu: "35", footLength: 8.5 },
    { us: "5.5", uk: "3", eu: "35.5", footLength: 8.625 },
    { us: "6", uk: "3.5", eu: "36", footLength: 8.75 },
    { us: "6.5", uk: "4", eu: "36.5", footLength: 8.875 },
    { us: "7", uk: "4.5", eu: "37.5", footLength: 9 },
    { us: "7.5", uk: "5", eu: "38", footLength: 9.125 },
    { us: "8", uk: "5.5", eu: "38.5", footLength: 9.25 },
    { us: "8.5", uk: "6", eu: "39", footLength: 9.375 },
    { us: "9", uk: "6.5", eu: "40", footLength: 9.5 },
    { us: "9.5", uk: "7", eu: "40.5", footLength: 9.625 },
    { us: "10", uk: "7.5", eu: "41", footLength: 9.75 },
    { us: "10.5", uk: "8", eu: "42", footLength: 9.875 },
    { us: "11", uk: "8.5", eu: "42.5", footLength: 10 },
  ];

  for (let i = 0; i < shoeSizes.length; i++) {
    const size = shoeSizes[i];
    const row = await prisma.sizeChartRow.create({
      data: {
        sizeChartId: womensShoesChart.id,
        displayOrder: i,
      },
    });

    await prisma.sizeChartCell.createMany({
      data: [
        { rowId: row.id, columnId: usWomensSizeCol.id, valueText: size.us },
        { rowId: row.id, columnId: ukWomensSizeCol.id, valueText: size.uk },
        { rowId: row.id, columnId: euWomensSizeCol.id, valueText: size.eu },
        { rowId: row.id, columnId: footLengthCol.id, valueInches: size.footLength },
      ],
    });
  }

  console.log("Created Women's Shoes size chart");

  console.log("Database seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
