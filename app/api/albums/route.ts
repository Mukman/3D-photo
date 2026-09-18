export const runtime = "nodejs";

import QRCode from "qrcode";
import { albums, createAlbumRecord, type AlbumRecord } from "@/lib/album-store";

function buildAlbumPayload(album: AlbumRecord) {
  return {
    ...album,
    requiresPin: Boolean(album.pin),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = String(body?.title || "").trim();
    const pin = body?.pin ? String(body.pin) : null;

    if (!title) {
      return Response.json(
        { error: "Album title is required" },
        { status: 400 },
      );
    }

    const album = createAlbumRecord(title, pin);

    const albumUrl = `http://localhost:3000/view/${album.id}`;
    const qrCode = await QRCode.toDataURL(albumUrl);

    return Response.json({
      album: {
        id: album.id,
        title: album.title,
        pin: album.pin,
        createdAt: album.createdAt,
      },
      qrCode,
      albumUrl,
    });
  } catch (error) {
    console.error("Create album error:", error);
    return Response.json({ error: "Failed to create album" }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({
    albums: [...albums.values()].map(buildAlbumPayload),
  });
}
