export const runtime = "nodejs";

import { albums } from "@/lib/album-store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(request.url);
  const providedPin = url.searchParams.get("pin");
  const album = albums.get(id);

  if (!album) {
    return Response.json({ error: "Album not found" }, { status: 404 });
  }

  if (album.pin && (!providedPin || providedPin !== album.pin)) {
    return Response.json(
      {
        error: "Album requires a PIN",
        requiresPin: true,
        photos: [],
      },
      { status: 401 },
    );
  }

  return Response.json({
    ...album,
    requiresPin: Boolean(album.pin),
    photos: album.photos,
  });
}
