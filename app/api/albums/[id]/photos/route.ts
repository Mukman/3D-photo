import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/prisma";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    // FIX: Removed 'format: "auto"'. 'resource_type: "auto"' is enough for Cloudinary
    // to automatically detect HEIC, MOV, JPEG, etc., and optimize them.
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: "auto" }, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        })
        .end(buffer);
    });

    // Save to Database
    const photo = await prisma.photo.create({
      data: {
        imageUrl: uploadResult.secure_url,
        // If Cloudinary detected it as a video (like a Live Photo video), save it
        videoUrl:
          uploadResult.resource_type === "video"
            ? uploadResult.secure_url
            : null,
        albumId: id,
      },
    });

    return NextResponse.json({ photo });
  } catch (error: any) {
    console.error("Upload Photo Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload photo" },
      { status: 500 },
    );
  }
}
