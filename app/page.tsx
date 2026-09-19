"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [step, setStep] = useState<"create" | "upload">("create");
  const [title, setTitle] = useState("");
  const [pin, setPin] = useState("");
  const [albumData, setAlbumData] = useState<any>(null);
  const [savedAlbums, setSavedAlbums] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<any[]>([]);

  useEffect(() => {
    const loadAlbums = async () => {
      try {
        const res = await fetch("/api/albums");
        const data = await res.json();
        if (data.albums) setSavedAlbums(data.albums);
      } catch {
        setSavedAlbums([]);
      }
    };

    loadAlbums();
  }, []);

  // 1. Create Album
  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/albums", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, pin: pin || null }),
    });
    const data = await res.json();
    if (data.album) {
      setAlbumData(data);
      setUploadedPhotos([]);
      setSavedAlbums((prev) => [
        { ...data.album, photos: [] },
        ...prev.filter((album) => album.id !== data.album.id),
      ]);
      setStep("upload");
    } else {
      alert("Failed to create album: " + (data.error || "Unknown error"));
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm("Delete this album?")) return;

    const res = await fetch(`/api/albums/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSavedAlbums((prev) => prev.filter((album) => album.id !== id));
      if (albumData?.album?.id === id) {
        setAlbumData(null);
        setUploadedPhotos([]);
        setStep("create");
      }
    }
  };

  const handleCreateAnotherAlbum = () => {
    setAlbumData(null);
    setUploadedPhotos([]);
    setTitle("");
    setPin("");
    setStep("create");
  };

  const handleRenameAlbum = async (id: string, currentTitle: string) => {
    const nextTitle = window.prompt("Edit album title", currentTitle);
    if (!nextTitle || !nextTitle.trim()) return;

    const res = await fetch(`/api/albums/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: nextTitle.trim() }),
    });
    if (!res.ok) return;

    const updated = await res.json();
    setSavedAlbums((prev) =>
      prev.map((album) =>
        album.id === id ? { ...album, title: updated.album.title } : album,
      ),
    );
    if (albumData?.album?.id === id) {
      setAlbumData((prev: any) => ({
        ...prev,
        album: { ...prev.album, title: updated.album.title },
      }));
    }
  };

  // 2. Upload MULTIPLE Photos (or entire folders)
  const handleUploadPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !albumData) return;

    setUploading(true);

    // Filter only images and videos
    const fileArray = Array.from(files).filter(
      (file) =>
        file.type.startsWith("image/") || file.type.startsWith("video/"),
    );

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setUploadProgress(
        `Uploading ${i + 1} of ${fileArray.length}: ${file.name}`,
      );

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(`/api/albums/${albumData.album.id}/photos`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.photo) {
          setUploadedPhotos((prev) => [...prev, data.photo]);
        } else {
          console.error("Failed to upload:", file.name, data.error);
        }
      } catch (err) {
        console.error("Upload error for", file.name, err);
      }
    }

    setUploading(false);
    setUploadProgress("");
    e.target.value = ""; // Reset input so you can select the same files again if needed
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
        3D Album Creator
      </h1>

      {step === "create" && (
        <>
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleCreateAlbum}
            className="w-full max-w-md bg-white/5 p-8 rounded-2xl backdrop-blur-md mt-10"
          >
            <h2 className="text-xl font-bold mb-4">Create New Album</h2>
            <input
              type="text"
              placeholder="Album Title (e.g., Sarah's Wedding)"
              required
              className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 mb-4 focus:outline-none focus:border-purple-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="password"
              placeholder="Optional 4-digit PIN"
              maxLength={4}
              className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 mb-6 focus:outline-none focus:border-purple-500"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold transition-colors"
            >
              Create Album & Get QR
            </button>
          </motion.form>

          {savedAlbums.length > 0 && (
            <div className="w-full max-w-3xl mt-8 bg-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Saved albums</h3>
              <div className="space-y-3">
                {savedAlbums.map((album) => (
                  <div
                    key={album.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-700 bg-black/20 p-3"
                  >
                    <div>
                      <p className="font-semibold">{album.title}</p>
                      <p className="text-xs text-gray-400">{album.id}</p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`/view/${album.id}`}
                        target="_blank"
                        className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm"
                      >
                        Open
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRenameAlbum(album.id, album.title)}
                        className="px-3 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAlbum(album.id)}
                        className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {step === "upload" && albumData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-4xl grid md:grid-cols-2 gap-10 mt-10"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Upload Photos</h2>
              <button
                type="button"
                onClick={handleCreateAnotherAlbum}
                className="text-sm text-gray-300 hover:text-white underline"
              >
                New album
              </button>
            </div>

            <label className="w-full p-8 border-2 border-dashed border-gray-600 rounded-2xl flex flex-col items-center cursor-pointer hover:border-purple-500 transition-colors mb-6">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleUploadPhotos}
              />
              {uploading ? (
                <p className="text-purple-400 animate-pulse text-center">
                  {uploadProgress || "Uploading..."}
                </p>
              ) : (
                <p className="text-gray-400 text-center">
                  Click to select multiple files
                  <br />
                  <span className="text-sm text-purple-400">
                    (or select an entire folder!)
                  </span>
                </p>
              )}
            </label>

            <div className="grid grid-cols-3 gap-3">
              {uploadedPhotos.map((p) => (
                <img
                  key={p.id}
                  src={p.imageUrl}
                  className="w-full aspect-square object-cover rounded-lg border border-gray-700"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center bg-white/5 p-8 rounded-2xl backdrop-blur-sm h-fit">
            <h2 className="text-xl font-bold mb-4">Album QR Code</h2>
            <img
              src={albumData.qrCode}
              alt="QR Code"
              className="w-64 h-64 rounded-lg bg-white p-2"
            />
            <p className="text-xs text-gray-400 mt-4 break-all text-center">
              {albumData.albumUrl}
            </p>
            <div className="flex flex-col gap-3 mt-6 w-full">
              <a
                href={albumData.qrCode}
                download={`${albumData.album.title}-QR.png`}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-full text-center font-semibold transition-colors"
              >
                Download QR
              </a>
              <a
                href={`/view/${albumData.album.id}`}
                target="_blank"
                className="px-6 py-2 border border-blue-500 text-blue-300 hover:bg-blue-500/10 rounded-full text-center font-semibold transition-colors"
              >
                Open gallery
              </a>
              <button
                type="button"
                onClick={handleCreateAnotherAlbum}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full font-semibold transition-colors"
              >
                Back to create album
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </main>
  );
}
