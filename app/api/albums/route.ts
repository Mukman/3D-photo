export const runtime = "nodejs";

import QRCode from "qrcode";
import {
  createAlbumRecord,
  listAlbums,
  type AlbumRecord,
} from "@/lib/album-store";

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

    const album = await createAlbumRecord(title, pin);
    const requestUrl = new URL(request.url);
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      `${requestUrl.protocol}//${requestUrl.host}`;
    const albumUrl = `${baseUrl.replace(/\/$/, "")}/view/${album.id}`;
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
    const message =
      error instanceof Error ? error.message : "Failed to create album";
    console.error("Create album error:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const albums = await listAlbums();
    return Response.json({
      albums: albums.map(buildAlbumPayload),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load albums";
    console.error("List albums error:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}
