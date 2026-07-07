import { NextResponse } from "next/server";
import { incrementBlogViews } from "@/services/blog/posts";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    await incrementBlogViews(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
