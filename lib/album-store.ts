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

export const albums = new Map<string, AlbumRecord>();

export function getAlbumById(albumId: string) {
  return albums.get(albumId) ?? null;
}

export function createAlbumRecord(title: string, pin: string | null) {
  const album: AlbumRecord = {
    id: crypto.randomUUID(),
    title,
    pin,
    createdAt: new Date().toISOString(),
    photos: [],
  };

  albums.set(album.id, album);
  return album;
}

export function addPhotoToAlbum(albumId: string, photo: PhotoRecord) {
  const album = getAlbumById(albumId);
  if (!album) return null;

  album.photos.push(photo);
  return photo;
}
