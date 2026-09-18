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

function readAlbums() {
  return albums;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(request.url);
  const providedPin = url.searchParams.get("pin");
  const album = readAlbums().get(id);

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

export function registerAlbum(album: AlbumRecord) {
  readAlbums().set(album.id, album);
}
