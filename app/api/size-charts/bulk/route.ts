import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bulkOperationSchema } from "@/lib/validations";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = bulkOperationSchema.parse(body);

    let result: { count: number };

    switch (data.operation) {
      case "delete":
        result = await db.sizeChart.deleteMany({
          where: { id: { in: data.ids } },
        });
        break;

      case "publish":
        result = await db.sizeChart.updateMany({
          where: { id: { in: data.ids } },
          data: { isPublished: true },
        });
        break;

      case "unpublish":
        result = await db.sizeChart.updateMany({
          where: { id: { in: data.ids } },
          data: { isPublished: false },
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid operation" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      operation: data.operation,
      affected: result.count,
    });
  } catch (error) {
    console.error("Error performing bulk operation:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to perform bulk operation" }, { status: 500 });
  }
}
