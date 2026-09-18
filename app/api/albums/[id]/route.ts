import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 👇 Next.js 15/16 requires awaiting params
    const { id } = await params;

    const album = await prisma.album.findUnique({
      where: { id },
      include: { photos: { orderBy: { createdAt: "desc" } } },
    });

    if (!album)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const providedPin = req.nextUrl.searchParams.get("pin");

    if (album.pin && album.pin !== providedPin) {
      return NextResponse.json({
        id: album.id,
        title: album.title,
        requiresPin: true,
        photos: [],
      });
    }

    return NextResponse.json({ ...album, requiresPin: false });
  } catch (error) {
    console.error("GET Album Error:", error);
    return NextResponse.json(
      { error: "Server error fetching album" },
      { status: 500 },
    );
  }
}
