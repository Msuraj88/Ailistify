import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tools = await prisma.tool.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: tools.length,
      data: tools,
    });
  } catch (error) {
    console.error("[GET /api/tools]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tools. Please try again later.",
      },
      { status: 500 },
    );
  }
}
