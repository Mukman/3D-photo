import { prisma } from "@/lib/prisma";

export type AlbumRecord = {
  id: string;
  title: string;
  pin: string | null;
  createdAt: string;
  photos: PhotoRecord[];
};

export type PhotoRecord = {
  id: string;
  imageUrl: string;
  videoUrl: string | null;
  albumId: string;
  createdAt: string;
};

function serializePhoto(photo: {
  id: string;
  imageUrl: string;
  videoUrl: string | null;
  albumId: string;
  createdAt: Date;
}): PhotoRecord {
  return {
    id: photo.id,
    imageUrl: photo.imageUrl,
    videoUrl: photo.videoUrl,
    albumId: photo.albumId,
    createdAt: photo.createdAt.toISOString(),
  };
}

function serializeAlbum(album: {
  id: string;
  title: string;
  pin: string | null;
  createdAt: Date;
  photos: Array<{
    id: string;
    imageUrl: string;
    videoUrl: string | null;
    albumId: string;
    createdAt: Date;
  }>;
}): AlbumRecord {
  return {
    id: album.id,
    title: album.title,
    pin: album.pin,
    createdAt: album.createdAt.toISOString(),
    photos: album.photos.map(serializePhoto),
  };
}

export async function listAlbums() {
  const albums = await prisma.album.findMany({
    include: { photos: true },
    orderBy: { createdAt: "desc" },
  });

  return albums.map(serializeAlbum);
}

export async function getAlbumById(albumId: string) {
  const album = await prisma.album.findUnique({
    where: { id: albumId },
    include: { photos: { orderBy: { createdAt: "asc" } } },
  });

  if (!album) return null;
  return serializeAlbum(album);
}

export async function createAlbumRecord(title: string, pin: string | null) {
  const album = await prisma.album.create({
    data: {
      title,
      pin,
    },
    include: { photos: true },
  });

  return serializeAlbum(album);
}

export async function addPhotoToAlbum(albumId: string, photo: PhotoRecord) {
  const existingAlbum = await prisma.album.findUnique({
    where: { id: albumId },
  });
  if (!existingAlbum) return null;

  const saved = await prisma.photo.create({
    data: {
      albumId,
      imageUrl: photo.imageUrl,
      videoUrl: photo.videoUrl,
    },
  });

  return serializePhoto(saved);
}

export async function updateAlbum(
  albumId: string,
  updates: Partial<Pick<AlbumRecord, "title" | "pin">>,
) {
  const album = await prisma.album.findUnique({ where: { id: albumId } });
  if (!album) return null;

  const updated = await prisma.album.update({
    where: { id: albumId },
    data: {
      title: updates.title ?? undefined,
      pin: updates.pin ?? undefined,
    },
    include: { photos: true },
  });

  return serializeAlbum(updated);
}

export async function deleteAlbum(albumId: string) {
  const album = await prisma.album.findUnique({ where: { id: albumId } });
  if (!album) return false;

  await prisma.album.delete({ where: { id: albumId } });
  return true;
}
