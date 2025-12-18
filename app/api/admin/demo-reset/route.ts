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
import { DEMO_SIZE_CHART_SLUGS } from "@/lib/demo-slugs";
import * as Sentry from "@sentry/nextjs";

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

// Upsert a category by slug
async function upsertCategory(name: string, slug: string, displayOrder: number) {
	return db.category.upsert({
		where: { slug },
		update: { name, displayOrder },
		create: { name, slug, displayOrder },
	});
}

// Upsert a subcategory by categoryId + slug
async function upsertSubcategory(
	name: string,
	slug: string,
	categoryId: string,
	displayOrder: number
) {
	const existing = await db.subcategory.findFirst({
		where: { categoryId, slug },
	});

	if (existing) {
		return db.subcategory.update({
			where: { id: existing.id },
			data: { name, displayOrder },
		});
	}

	return db.subcategory.create({
		data: { name, slug, categoryId, displayOrder },
	});
}

// Upsert or create a size chart from a template
// If exists: delete related data, update basic info, recreate structure
// If not: create new chart with structure
async function upsertSizeChartFromTemplate(
	template: Template,
	name: string,
	slug: string,
	subcategoryIds: string[],
	instructionMap: Record<string, string>,
	rows?: Record<string, CellValue>[]
) {
	const existing = await db.sizeChart.findUnique({ where: { slug } });

	let chart;
	if (existing) {
		// Delete related data for this chart only
		await db.sizeChartMeasurementInstruction.deleteMany({ where: { sizeChartId: existing.id } });
		await db.sizeChartCell.deleteMany({ where: { row: { sizeChartId: existing.id } } });
		await db.sizeChartRow.deleteMany({ where: { sizeChartId: existing.id } });
		await db.sizeChartColumn.deleteMany({ where: { sizeChartId: existing.id } });
		await db.sizeChartSubcategory.deleteMany({ where: { sizeChartId: existing.id } });

		// Update basic info
		chart = await db.sizeChart.update({
			where: { id: existing.id },
			data: {
				name,
				description: template.description,
				isPublished: true,
			},
		});
	} else {
		// Create new chart
		chart = await db.sizeChart.create({
			data: {
				name,
				slug,
				description: template.description,
				isPublished: true,
			},
		});
	}

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

// Upsert measurement instruction by key
async function upsertMeasurementInstruction(
	key: string,
	name: string,
	instruction: string,
	sortOrder: number
) {
	return db.measurementInstruction.upsert({
		where: { key },
		update: { name, instruction, sortOrder },
		create: { key, name, instruction, sortOrder },
	});
}

// Upsert size label by key
async function upsertSizeLabel(
	key: string,
	displayValue: string,
	labelType: LabelType,
	sortOrder: number,
	description?: string
) {
	return db.sizeLabel.upsert({
		where: { key },
		update: { displayValue, labelType, sortOrder, description },
		create: { key, displayValue, labelType, sortOrder, description },
	});
}

export async function POST(request: NextRequest) {
	// Check if demo mode is enabled via feature flag
	if (!(await isDemoModeEnabled())) {
		console.log("Demo reset attempted but demo mode is not enabled");
		return NextResponse.json(
			{ error: "Demo mode is not enabled" },
			{ status: 403 }
		);
	}

	// Verify cron secret for scheduled resets
	const authHeader = request.headers.get("authorization");
	const cronSecret = process.env.CRON_SECRET;

	if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
		console.log("Demo reset unauthorized - invalid cron secret");
		return NextResponse.json(
			{ error: "Unauthorized" },
			{ status: 401 }
		);
	}

	const startTime = Date.now();

	try {
		console.log("Starting demo database reset (upsert mode)...");

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

		// Upsert measurement instructions
		console.log("Upserting measurement instructions...");
		const measurementInstructions = await Promise.all([
			upsertMeasurementInstruction("chest", "Chest/Bust", "Measure around the fullest part of your chest, keeping the tape parallel to the floor.", 0),
			upsertMeasurementInstruction("waist", "Waist", "Measure around the narrowest part of your natural waistline, typically just above the belly button.", 1),
			upsertMeasurementInstruction("hip", "Hip", "Measure around the fullest part of your hips, about 8 inches below your waist.", 2),
			upsertMeasurementInstruction("inseam", "Inseam", "Measure from the crotch seam to the bottom of the leg along the inner leg.", 3),
			upsertMeasurementInstruction("height", "Height", "Measure from the top of your head to the floor while standing straight without shoes.", 4),
			upsertMeasurementInstruction("foot_length", "Foot Length", "Stand on a piece of paper and trace your foot. Measure from heel to longest toe.", 5),
			upsertMeasurementInstruction("hand_circumference", "Hand Circumference", "Measure around your palm at the widest point, excluding the thumb.", 6),
			upsertMeasurementInstruction("hand_length", "Hand Length", "Measure from the base of your palm to the tip of your middle finger.", 7),
			upsertMeasurementInstruction("head_circumference", "Head Circumference", "Measure around the largest part of your head, about 1 inch above your eyebrows.", 8),
			upsertMeasurementInstruction("band_size", "Band Size", "Measure snugly around your ribcage, directly under your bust. Round to nearest even number.", 9),
			upsertMeasurementInstruction("cup_size", "Cup Size", "Measure around the fullest part of your bust. Subtract band size to determine cup.", 10),
		]);

		const instructions: Record<string, string> = {};
		measurementInstructions.forEach((inst) => {
			instructions[inst.key] = inst.id;
		});

		// Upsert size labels
		console.log("Upserting size labels...");
		await Promise.all([
			upsertSizeLabel("SIZE_XXS", "XXS", LabelType.ALPHA_SIZE, 0),
			upsertSizeLabel("SIZE_XS", "XS", LabelType.ALPHA_SIZE, 1),
			upsertSizeLabel("SIZE_SM", "SM", LabelType.ALPHA_SIZE, 2),
			upsertSizeLabel("SIZE_MD", "MD", LabelType.ALPHA_SIZE, 3),
			upsertSizeLabel("SIZE_LG", "LG", LabelType.ALPHA_SIZE, 4),
			upsertSizeLabel("SIZE_XL", "XL", LabelType.ALPHA_SIZE, 5),
			upsertSizeLabel("SIZE_XXL", "XXL", LabelType.ALPHA_SIZE, 6),
			upsertSizeLabel("SIZE_3XL", "3XL", LabelType.ALPHA_SIZE, 7),
			upsertSizeLabel("SIZE_4XL", "4XL", LabelType.ALPHA_SIZE, 8),
			upsertSizeLabel("SIZE_5XL", "5XL", LabelType.ALPHA_SIZE, 9),
			upsertSizeLabel("SIZE_1X", "1X", LabelType.ALPHA_SIZE, 10),
			upsertSizeLabel("SIZE_2X", "2X", LabelType.ALPHA_SIZE, 11),
			upsertSizeLabel("SIZE_3X", "3X", LabelType.ALPHA_SIZE, 12),
		]);

		await Promise.all([
			upsertSizeLabel("SIZE_YXS", "YXS", LabelType.YOUTH_SIZE, 0),
			upsertSizeLabel("SIZE_YSM", "YSM", LabelType.YOUTH_SIZE, 1),
			upsertSizeLabel("SIZE_YMD", "YMD", LabelType.YOUTH_SIZE, 2),
			upsertSizeLabel("SIZE_YLG", "YLG", LabelType.YOUTH_SIZE, 3),
			upsertSizeLabel("SIZE_YXL", "YXL", LabelType.YOUTH_SIZE, 4),
		]);

		await Promise.all([
			upsertSizeLabel("SIZE_2T", "2T", LabelType.TODDLER_SIZE, 0),
			upsertSizeLabel("SIZE_3T", "3T", LabelType.TODDLER_SIZE, 1),
			upsertSizeLabel("SIZE_4T", "4T", LabelType.TODDLER_SIZE, 2),
		]);

		await Promise.all([
			upsertSizeLabel("SIZE_0_3M", "0-3M", LabelType.INFANT_SIZE, 0),
			upsertSizeLabel("SIZE_3_6M", "3-6M", LabelType.INFANT_SIZE, 1),
			upsertSizeLabel("SIZE_6_9M", "6-9M", LabelType.INFANT_SIZE, 2),
			upsertSizeLabel("SIZE_12M", "12M", LabelType.INFANT_SIZE, 3),
			upsertSizeLabel("SIZE_18M", "18M", LabelType.INFANT_SIZE, 4),
			upsertSizeLabel("SIZE_24M", "24M", LabelType.INFANT_SIZE, 5),
		]);

		await Promise.all(
			[4, 5, 6, 7, 8, 10, 12, 14, 16, 18, 20].map((n, i) =>
				upsertSizeLabel(`SIZE_${n}`, `${n}`, LabelType.NUMERIC_SIZE, i)
			)
		);

		await Promise.all([
			upsertSizeLabel("SIZE_OSFM", "OSFM", LabelType.CUSTOM, 0, "One Size Fits Most"),
			upsertSizeLabel("SIZE_S_M", "S/M", LabelType.CUSTOM, 1),
			upsertSizeLabel("SIZE_M_L", "M/L", LabelType.CUSTOM, 2),
			upsertSizeLabel("SIZE_L_XL", "L/XL", LabelType.CUSTOM, 3),
			upsertSizeLabel("SIZE_XL_XXL", "XL/XXL", LabelType.CUSTOM, 4),
		]);

		await Promise.all([
			upsertSizeLabel("CUP_A", "A", LabelType.CUP_SIZE, 0),
			upsertSizeLabel("CUP_B", "B", LabelType.CUP_SIZE, 1),
			upsertSizeLabel("CUP_C", "C", LabelType.CUP_SIZE, 2),
			upsertSizeLabel("CUP_D", "D", LabelType.CUP_SIZE, 3),
			upsertSizeLabel("CUP_DD", "DD", LabelType.CUP_SIZE, 4),
			upsertSizeLabel("CUP_DDD", "DDD", LabelType.CUP_SIZE, 5),
		]);

		await Promise.all(
			[30, 32, 34, 36, 38, 40, 42, 44, 46].map((n, i) =>
				upsertSizeLabel(`BAND_${n}`, `${n}`, LabelType.BAND_SIZE, i)
			)
		);

		// Upsert categories
		console.log("Upserting categories...");
		const mens = await upsertCategory("Men's", "mens", 0);
		const womens = await upsertCategory("Women's", "womens", 1);
		const boys = await upsertCategory("Boys", "boys", 2);
		const girls = await upsertCategory("Girls", "girls", 3);

		// Upsert subcategories
		console.log("Upserting subcategories...");
		const mensTops = await upsertSubcategory("Tops", "tops", mens.id, 0);
		const mensBottoms = await upsertSubcategory("Bottoms", "bottoms", mens.id, 1);
		const mensFootwear = await upsertSubcategory("Footwear", "footwear", mens.id, 2);
		const mensGloves = await upsertSubcategory("Gloves", "gloves", mens.id, 3);
		const mensHeadwear = await upsertSubcategory("Headwear", "headwear", mens.id, 4);
		const mensSocks = await upsertSubcategory("Socks", "socks", mens.id, 5);

		const womensTops = await upsertSubcategory("Tops", "tops", womens.id, 0);
		const womensBras = await upsertSubcategory("Bras", "bras", womens.id, 1);
		const womensBottoms = await upsertSubcategory("Bottoms", "bottoms", womens.id, 2);
		const womensFootwear = await upsertSubcategory("Footwear", "footwear", womens.id, 3);
		const womensGloves = await upsertSubcategory("Gloves", "gloves", womens.id, 4);
		const womensHeadwear = await upsertSubcategory("Headwear", "headwear", womens.id, 5);
		const womensSocks = await upsertSubcategory("Socks", "socks", womens.id, 6);
		const womensPlus = await upsertSubcategory("Plus Sizes", "plus-sizes", womens.id, 7);

		const boysTops = await upsertSubcategory("Tops", "tops", boys.id, 0);
		const boysBottoms = await upsertSubcategory("Bottoms", "bottoms", boys.id, 1);
		const boysFootwear = await upsertSubcategory("Footwear", "footwear", boys.id, 2);
		const boysGloves = await upsertSubcategory("Gloves", "gloves", boys.id, 3);
		const boysHeadwear = await upsertSubcategory("Headwear", "headwear", boys.id, 4);
		const boysSocks = await upsertSubcategory("Socks", "socks", boys.id, 5);

		const girlsTops = await upsertSubcategory("Tops", "tops", girls.id, 0);
		const girlsBottoms = await upsertSubcategory("Bottoms", "bottoms", girls.id, 1);
		const girlsFootwear = await upsertSubcategory("Footwear", "footwear", girls.id, 2);
		const girlsGloves = await upsertSubcategory("Gloves", "gloves", girls.id, 3);
		const girlsHeadwear = await upsertSubcategory("Headwear", "headwear", girls.id, 4);
		const girlsSocks = await upsertSubcategory("Socks", "socks", girls.id, 5);

		// Upsert size charts from templates
		console.log("Upserting size charts from templates...");

		// Men's apparel
		await upsertSizeChartFromTemplate(getTemplate("apparel-mens-tops"), "Tops", "mens-tops", [mensTops.id], instructions);
		await upsertSizeChartFromTemplate(getTemplate("apparel-mens-bottoms"), "Bottoms", "mens-bottoms", [mensBottoms.id], instructions);
		await upsertSizeChartFromTemplate(getTemplate("footwear-mens"), "Footwear", "mens-footwear", [mensFootwear.id], instructions);

		const glovesTemplate = getTemplate("accessories-gloves");
		await upsertSizeChartFromTemplate(glovesTemplate, "Gloves", "mens-gloves", [mensGloves.id], instructions, glovesTemplate.variants?.mens?.rows);

		const headwearTemplate = getTemplate("accessories-headwear");
		await upsertSizeChartFromTemplate(headwearTemplate, "Headwear", "mens-headwear", [mensHeadwear.id], instructions, headwearTemplate.variants?.mens?.rows);

		const socksTemplate = getTemplate("accessories-socks");
		await upsertSizeChartFromTemplate(socksTemplate, "Socks", "mens-socks", [mensSocks.id], instructions, socksTemplate.variants?.mens?.rows);

		// Women's apparel
		await upsertSizeChartFromTemplate(getTemplate("apparel-womens-tops"), "Tops", "womens-tops", [womensTops.id], instructions);
		await upsertSizeChartFromTemplate(getTemplate("apparel-womens-sports-bras"), "Sports Bras", "womens-sports-bras", [womensBras.id], instructions);
		await upsertSizeChartFromTemplate(getTemplate("apparel-womens-bottoms"), "Bottoms", "womens-bottoms", [womensBottoms.id], instructions);
		await upsertSizeChartFromTemplate(getTemplate("apparel-womens-plus-sizes"), "Plus Sizes", "womens-plus-sizes", [womensPlus.id], instructions);
		await upsertSizeChartFromTemplate(getTemplate("footwear-womens"), "Footwear", "womens-footwear", [womensFootwear.id], instructions);
		await upsertSizeChartFromTemplate(glovesTemplate, "Gloves", "womens-gloves", [womensGloves.id], instructions, glovesTemplate.variants?.womens?.rows);
		await upsertSizeChartFromTemplate(headwearTemplate, "Headwear", "womens-headwear", [womensHeadwear.id], instructions, headwearTemplate.variants?.womens?.rows);
		await upsertSizeChartFromTemplate(socksTemplate, "Socks", "womens-socks", [womensSocks.id], instructions, socksTemplate.variants?.womens?.rows);

		// Youth
		await upsertSizeChartFromTemplate(getTemplate("youth-big-kids-tops"), "Big Kids (8-20)", "youth-big-kids-tops", [boysTops.id, girlsTops.id], instructions);
		await upsertSizeChartFromTemplate(getTemplate("youth-big-kids-bottoms"), "Big Kids (8-20)", "youth-big-kids-bottoms", [boysBottoms.id, girlsBottoms.id], instructions);
		await upsertSizeChartFromTemplate(getTemplate("youth-little-kids"), "Little Kids (4-7)", "youth-little-kids", [boysTops.id, girlsTops.id, boysBottoms.id, girlsBottoms.id], instructions);
		await upsertSizeChartFromTemplate(getTemplate("youth-toddler"), "Toddler (2T-4T)", "youth-toddler", [boysTops.id, girlsTops.id, boysBottoms.id, girlsBottoms.id], instructions);
		await upsertSizeChartFromTemplate(getTemplate("youth-infant"), "Infant (0-24M)", "youth-infant", [boysTops.id, girlsTops.id, boysBottoms.id, girlsBottoms.id], instructions);
		await upsertSizeChartFromTemplate(getTemplate("footwear-kids"), "Youth Footwear", "youth-footwear", [boysFootwear.id, girlsFootwear.id], instructions);
		await upsertSizeChartFromTemplate(glovesTemplate, "Youth Gloves", "youth-gloves", [boysGloves.id, girlsGloves.id], instructions, glovesTemplate.variants?.youth?.rows);
		await upsertSizeChartFromTemplate(headwearTemplate, "Youth Headwear", "youth-headwear", [boysHeadwear.id, girlsHeadwear.id], instructions, headwearTemplate.variants?.youth?.rows);
		await upsertSizeChartFromTemplate(socksTemplate, "Youth Socks", "youth-socks", [boysSocks.id, girlsSocks.id], instructions, socksTemplate.variants?.youth?.rows);

		const duration = Date.now() - startTime;
		console.log(`Demo database reset completed successfully in ${duration}ms!`);

		// Store the reset time
		lastResetTime = new Date().toISOString();

		// Log success to Sentry
		Sentry.captureMessage("Demo reset completed successfully", {
			level: "info",
			extra: {
				duration,
				categories: 4,
				subcategories: 24,
				sizeCharts: DEMO_SIZE_CHART_SLUGS.length,
				templates: templates.length,
			},
		});

		return NextResponse.json({
			success: true,
			message: "Demo database reset completed",
			timestamp: lastResetTime,
			duration,
			data: {
				categories: 4,
				subcategories: 24,
				sizeCharts: DEMO_SIZE_CHART_SLUGS.length,
				templates: templates.length,
			},
		});
	} catch (error) {
		const duration = Date.now() - startTime;
		console.error("Error resetting demo database:", error);

		// Log error to Sentry
		Sentry.captureException(error, {
			extra: {
				operation: "demo-reset",
				duration,
			},
		});

		return NextResponse.json(
			{ error: "Failed to reset demo database" },
			{ status: 500 }
		);
	}
}

// Calculate next reset time based on 12-hour cron schedule (0 0,12 * * *)
function getNextResetTime(): string {
	const now = new Date();
	const hours = now.getUTCHours();
	const nextResetHour = hours < 12 ? 12 : 24;

	const nextReset = new Date(now);
	if (nextResetHour === 24) {
		nextReset.setUTCDate(nextReset.getUTCDate() + 1);
		nextReset.setUTCHours(0, 0, 0, 0);
	} else {
		nextReset.setUTCHours(nextResetHour, 0, 0, 0);
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
		reset_interval_hours: 12,
	});
}
