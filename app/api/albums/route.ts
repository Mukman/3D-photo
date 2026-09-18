import QRCode from "qrcode";

const albums = new Map<string, AlbumRecord>();

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

    const id = crypto.randomUUID();
    const album: AlbumRecord = {
      id,
      title,
      pin,
      createdAt: new Date().toISOString(),
      photos: [],
    };

    albums.set(id, album);

    const albumUrl = `http://localhost:3000/view/${id}`;
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
