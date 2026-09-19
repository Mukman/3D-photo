import { promises as fs } from "fs";
import path from "path";

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

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "albums.json");

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({}), "utf8");
  }
}

async function readAlbumMap(): Promise<Map<string, AlbumRecord>> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw || "{}") as Record<string, AlbumRecord>;
  return new Map(Object.entries(parsed));
}

async function writeAlbumMap(map: Map<string, AlbumRecord>) {
  await ensureFile();
  const payload = Object.fromEntries(map.entries());
  await fs.writeFile(DATA_FILE, JSON.stringify(payload, null, 2), "utf8");
}

export async function listAlbums() {
  const map = await readAlbumMap();
  return [...map.values()];
}

export async function getAlbumById(albumId: string) {
  const map = await readAlbumMap();
  return map.get(albumId) ?? null;
}

export async function createAlbumRecord(title: string, pin: string | null) {
  const map = await readAlbumMap();
  const album: AlbumRecord = {
    id: crypto.randomUUID(),
    title,
    pin,
    createdAt: new Date().toISOString(),
    photos: [],
  };

  map.set(album.id, album);
  await writeAlbumMap(map);
  return album;
}

export async function addPhotoToAlbum(albumId: string, photo: PhotoRecord) {
  const map = await readAlbumMap();
  const album = map.get(albumId);
  if (!album) return null;

  album.photos.push(photo);
  await writeAlbumMap(map);
  return photo;
}

export async function updateAlbum(
  albumId: string,
  updates: Partial<Pick<AlbumRecord, "title" | "pin">>,
) {
  const map = await readAlbumMap();
  const album = map.get(albumId);
  if (!album) return null;

  if (updates.title !== undefined) album.title = updates.title;
  if (updates.pin !== undefined) album.pin = updates.pin;

  await writeAlbumMap(map);
  return album;
}

export async function deleteAlbum(albumId: string) {
  const map = await readAlbumMap();
  const existed = map.delete(albumId);
  await writeAlbumMap(map);
  return existed;
}
