export const runtime = "nodejs";

import { addPhotoToAlbum, albums, type PhotoRecord } from "@/lib/album-store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const album = albums.get(id);

  if (!album) {
    return Response.json({ error: "Album not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const uploadedFile = formData.get("file");

  if (!(uploadedFile instanceof File)) {
    return Response.json({ error: "No file uploaded" }, { status: 400 });
  }

  const arrayBuffer = await uploadedFile.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = uploadedFile.type || "application/octet-stream";
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const photo: PhotoRecord = {
    id: crypto.randomUUID(),
    imageUrl: mimeType.startsWith("image/") ? dataUrl : "",
    videoUrl: mimeType.startsWith("video/") ? dataUrl : null,
    albumId: id,
    createdAt: new Date().toISOString(),
  };

  const saved = addPhotoToAlbum(id, photo);

  if (!saved) {
    return Response.json({ error: "Album not found" }, { status: 404 });
  }

  return Response.json({
    photo: saved,
  });
}
