import { NextRequest, NextResponse } from "next/server";
import { getTools } from "@/app/actions/toolActions";

/**
 * GET /api/tools
 * Fetches tools with support for search and filtering.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const query = searchParams.get("query") || undefined;
  const platform = searchParams.get("platform") || undefined;
  const toolType = searchParams.get("toolType") || undefined;
  // Listing kind — only the two known values are honoured, so a junk query
  // string can't silently return an empty directory.
  const rawSource = searchParams.get("sourceType")?.toUpperCase();
  const sourceType =
    rawSource === "OPEN_SOURCE" || rawSource === "PROPRIETARY" ? rawSource : undefined;

  try {
    const tools = await getTools(query, platform, toolType, sourceType);
    return NextResponse.json(tools);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch tools", message: error.message },
      { status: 500 }
    );
  }
}
