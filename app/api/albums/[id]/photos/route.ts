type AlbumRecord = {
  id: string;
  title: string;
  pin: string | null;
  createdAt: string;
  photos: PhotoRecord[];
};

type PhotoRecord = {
  id: string;
  imageUrl: string;
  videoUrl: string | null;
  albumId: string;
  createdAt: string;
};

const albums = new Map<string, AlbumRecord>();

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

  album.photos.push(photo);

  return Response.json({
    photo,
  });
}

export function registerAlbum(album: AlbumRecord) {
  albums.set(album.id, album);
}
