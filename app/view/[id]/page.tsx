"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Photo3D from "@/components/Photo3D";
import { useParams } from "next/navigation";

export default function ViewAlbum() {
  const params = useParams();
  const [album, setAlbum] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const fetchAlbum = async () => {
    setLoading(true);
    setError("");

    const res = await fetch(`/api/albums/${params.id}`);
    const data = await res.json();

    if (!res.ok) {
      setAlbum(null);
      setError(data?.error || "Album not found");
      setLoading(false);
      return;
    }

    setAlbum(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAlbum();
  }, [params.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (activePhotoIndex === null) return;
      if (event.key === "Escape") setActivePhotoIndex(null);
      if (event.key === "ArrowRight")
        setActivePhotoIndex((prev) =>
          prev === null ? 0 : (prev + 1) % (album?.photos.length ?? 1),
        );
      if (event.key === "ArrowLeft")
        setActivePhotoIndex((prev) =>
          prev === null
            ? 0
            : (prev - 1 + (album?.photos.length ?? 1)) %
              (album?.photos.length ?? 1),
        );
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activePhotoIndex, album?.photos]);

  const activePhoto =
    activePhotoIndex !== null && album ? album.photos[activePhotoIndex] : null;

  const showNextPhoto = () => {
    if (!album || album.photos.length === 0) return;
    setActivePhotoIndex((prev) =>
      prev === null ? 0 : (prev + 1) % album.photos.length,
    );
  };

  const showPrevPhoto = () => {
    if (!album || album.photos.length === 0) return;
    setActivePhotoIndex((prev) =>
      prev === null
        ? album.photos.length - 1
        : (prev - 1 + album.photos.length) % album.photos.length,
    );
  };

  const handleShare = async () => {
    if (!album) return;

    const shareData = {
      title: album.title,
      text: `Check out ${album.title}!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Share cancelled or failed", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading album...
      </div>
    );
  if (!album)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
        {album.title}
      </h1>

      <div className="flex justify-center mb-8">
        <button
          onClick={handleShare}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold flex items-center gap-2 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            ></path>
          </svg>
          Share Album
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="gallery"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto perspective-1000"
        >
          {album.photos.map((photo: any, index: number) => (
            <Photo3D
              key={photo.id}
              imageUrl={photo.imageUrl}
              videoUrl={photo.videoUrl}
              alt="Album photo"
              onOpen={() => setActivePhotoIndex(index)}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setActivePhotoIndex(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.92, x: -40 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActivePhotoIndex(null)}
                className="absolute right-3 top-3 z-10 rounded-full bg-black/60 px-3 py-1 text-sm text-white backdrop-blur-md"
              >
                Close
              </button>

              <div className="relative overflow-hidden rounded-2xl bg-black/30">
                <motion.div
                  key={activePhoto.id}
                  initial={{ opacity: 0, x: 70, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -70, scale: 0.96 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="flex items-center justify-center"
                >
                  {activePhoto.videoUrl ? (
                    <video
                      src={activePhoto.videoUrl}
                      controls
                      autoPlay
                      className="max-h-[80vh] w-full object-contain"
                    />
                  ) : (
                    <img
                      src={activePhoto.imageUrl}
                      alt="Full size album photo"
                      className="max-h-[80vh] w-full object-contain"
                    />
                  )}
                </motion.div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={showPrevPhoto}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-300">
                  {activePhotoIndex! + 1} / {album.photos.length}
                </span>
                <button
                  type="button"
                  onClick={showNextPhoto}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
                >
                  Next
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
