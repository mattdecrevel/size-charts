import { NextRequest, NextResponse } from "next/server";
import {
  getAllTemplates,
  getTemplatesByCategory,
  searchTemplates,
  getTemplateCategoryCounts,
  TemplateCategory,
} from "@/prisma/templates";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category") as TemplateCategory | null;
    const search = searchParams.get("search");
    const includeCounts = searchParams.get("includeCounts") === "true";

    let templates;

    if (search) {
      templates = searchTemplates(search);
    } else if (category) {
      templates = getTemplatesByCategory(category);
    } else {
      templates = getAllTemplates();
    }

    // Return response with optional category counts
    const response: {
      templates: typeof templates;
      categoryCounts?: Record<TemplateCategory, number>;
    } = { templates };

    if (includeCounts) {
      response.categoryCounts = getTemplateCategoryCounts();
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
