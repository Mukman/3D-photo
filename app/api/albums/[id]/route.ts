export const runtime = "nodejs";

import { deleteAlbum, getAlbumById, updateAlbum } from "@/lib/album-store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const providedPin = url.searchParams.get("pin");
    const album = await getAlbumById(id);

    if (!album) {
      return Response.json({ error: "Album not found" }, { status: 404 });
    }

    if (album.pin && (!providedPin || providedPin !== album.pin)) {
      return Response.json(
        {
          error: "Album requires a PIN",
          requiresPin: true,
          title: album.title,
          pin: album.pin,
          photos: [],
        },
        { status: 401 },
      );
    }

    return Response.json({
      ...album,
      requiresPin: false,
      photos: album.photos,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load album";
    console.error("Load album error:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const title =
      typeof body?.title === "string" ? body.title.trim() : undefined;
    const pin = body?.pin === null ? null : body?.pin;

    if (!title && pin === undefined) {
      return Response.json(
        { error: "No album updates provided" },
        { status: 400 },
      );
    }

    const album = await updateAlbum(id, {
      title: title || undefined,
      pin: pin !== undefined ? (pin === "" ? null : String(pin)) : undefined,
    });

    if (!album) {
      return Response.json({ error: "Album not found" }, { status: 404 });
    }

    return Response.json({ album });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update album";
    console.error("Update album error:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const deleted = await deleteAlbum(id);

    if (!deleted) {
      return Response.json({ error: "Album not found" }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete album";
    console.error("Delete album error:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}
