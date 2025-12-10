-- CreateEnum
CREATE TYPE "ColumnType" AS ENUM ('MEASUREMENT', 'SIZE_LABEL', 'REGIONAL_SIZE', 'BAND_SIZE', 'CUP_SIZE');

-- CreateEnum
CREATE TYPE "MeasurementUnit" AS ENUM ('INCHES', 'CM', 'NONE');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subcategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SizeChart" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "subcategoryId" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SizeChart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SizeChartColumn" (
    "id" TEXT NOT NULL,
    "sizeChartId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "columnType" "ColumnType" NOT NULL,
    "unit" "MeasurementUnit" NOT NULL DEFAULT 'NONE',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SizeChartColumn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SizeChartRow" (
    "id" TEXT NOT NULL,
    "sizeChartId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SizeChartRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SizeChartCell" (
    "id" TEXT NOT NULL,
    "rowId" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "valueInches" DOUBLE PRECISION,
    "valueText" TEXT,
    "valueMinInches" DOUBLE PRECISION,
    "valueMaxInches" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SizeChartCell_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Subcategory_categoryId_idx" ON "Subcategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Subcategory_categoryId_slug_key" ON "Subcategory"("categoryId", "slug");

-- CreateIndex
CREATE INDEX "SizeChart_subcategoryId_idx" ON "SizeChart"("subcategoryId");

-- CreateIndex
CREATE INDEX "SizeChart_isPublished_idx" ON "SizeChart"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "SizeChart_subcategoryId_slug_key" ON "SizeChart"("subcategoryId", "slug");

-- CreateIndex
CREATE INDEX "SizeChartColumn_sizeChartId_idx" ON "SizeChartColumn"("sizeChartId");

-- CreateIndex
CREATE INDEX "SizeChartRow_sizeChartId_idx" ON "SizeChartRow"("sizeChartId");

-- CreateIndex
CREATE INDEX "SizeChartCell_rowId_idx" ON "SizeChartCell"("rowId");

-- CreateIndex
CREATE INDEX "SizeChartCell_columnId_idx" ON "SizeChartCell"("columnId");

-- CreateIndex
CREATE UNIQUE INDEX "SizeChartCell_rowId_columnId_key" ON "SizeChartCell"("rowId", "columnId");

-- AddForeignKey
ALTER TABLE "Subcategory" ADD CONSTRAINT "Subcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SizeChart" ADD CONSTRAINT "SizeChart_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SizeChartColumn" ADD CONSTRAINT "SizeChartColumn_sizeChartId_fkey" FOREIGN KEY ("sizeChartId") REFERENCES "SizeChart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SizeChartRow" ADD CONSTRAINT "SizeChartRow_sizeChartId_fkey" FOREIGN KEY ("sizeChartId") REFERENCES "SizeChart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SizeChartCell" ADD CONSTRAINT "SizeChartCell_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "SizeChartRow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SizeChartCell" ADD CONSTRAINT "SizeChartCell_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "SizeChartColumn"("id") ON DELETE CASCADE ON UPDATE CASCADE;
