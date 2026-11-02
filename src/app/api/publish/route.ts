import { NextRequest, NextResponse } from "next/server";
import { createMediaContainer, publishMedia } from "@/lib/instagram";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, caption } = await req.json();

    if (!imageUrl || !caption) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create Media Container on Instagram
    const containerId = await createMediaContainer(imageUrl, caption);

    if (!containerId) {
       throw new Error("Failed to create media container.");
    }

    // 2. We should ideally poll for status before publishing for video.
    // For images, it's often instantaneous but Meta recommends checking status.
    // In this simplified flow for images, we immediately try to publish.

    // Slight artificial delay to allow Meta to process the image URL
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 3. Publish the container
    const result = await publishMedia(containerId);

    return NextResponse.json({ success: true, id: result.id });
  } catch (error: any) {
    console.error("Publish API Route Error:", error);
    return NextResponse.json({ error: error.message || "An error occurred during publishing" }, { status: 500 });
  }
}
