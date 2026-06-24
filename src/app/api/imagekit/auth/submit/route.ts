import { NextResponse } from "next/server";
import { isImageKitConfigured } from "@/lib/imagekit/config";
import { getImageKitAuthParameters } from "@/lib/imagekit/server";

export async function GET() {
  if (!isImageKitConfigured()) {
    return NextResponse.json(
      { error: "ImageKit is not configured on the server." },
      { status: 503 },
    );
  }

  try {
    const authParams = getImageKitAuthParameters();
    return NextResponse.json(authParams);
  } catch {
    return NextResponse.json(
      { error: "Failed to generate ImageKit credentials." },
      { status: 500 },
    );
  }
}
