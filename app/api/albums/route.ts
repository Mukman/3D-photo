import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";

export async function POST(req: NextRequest) {
  const { title, pin } = await req.json();

  // Create album in database
  const album = await prisma.album.create({
    data: { title, pin: pin || null },
  });

  // Generate QR Code for the viewer page
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const albumUrl = `${baseUrl}/view/${album.id}`;
  const qrCode = await QRCode.toDataURL(albumUrl, { width: 500, margin: 2 });

  return NextResponse.json({ album, albumUrl, qrCode });
}
