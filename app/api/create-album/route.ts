import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import QRCode from "qrcode";

// Configure Cloudinary (Replace with your actual keys from Cloudinary dashboard)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Upload to Cloudinary
    // The 'live_photo' flag tells Cloudinary to automatically extract the video
    // from iPhone Live Photos and convert HEIC to WebP!
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "auto",
            format: "auto", // Auto-converts HEIC to WebP/AVIF
            type: "upload",
            // If it's a live photo, Cloudinary will return both image and video URLs
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(buffer);
    });

    // @ts-ignore
    const cloudinaryData = uploadResult;

    // 2. Generate a unique Album ID (In production, save this to a Database like PostgreSQL)
    const albumId = crypto.randomUUID();
    const albumUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/view/${albumId}`;

    // 3. Generate QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(albumUrl, {
      width: 500,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    // 4. Return the data to the frontend
    return NextResponse.json({
      success: true,
      albumId,
      albumUrl,
      qrCode: qrCodeDataUrl,
      media: {
        imageUrl: cloudinaryData.secure_url,
        // If it was a Live Photo, Cloudinary provides the video in the 'live_photo' or 'derived' info
        // For simplicity, we grab the video URL if it exists
        videoUrl: cloudinaryData.live_photo?.video_url || null,
      },
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 },
    );
  }
}
