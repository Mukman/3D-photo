"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Photo3D from "@/components/Photo3D";
import { useParams } from "next/navigation";

export default function ViewAlbum() {
  const params = useParams();
  const [album, setAlbum] = useState<any>(null);
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch album data
  const fetchAlbum = async (pin?: string) => {
    setLoading(true);
    const url = pin
      ? `/api/albums/${params.id}?pin=${pin}`
      : `/api/albums/${params.id}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      setError("Album not found");
    } else {
      setAlbum(data);
      if (data.requiresPin && !pin) {
        // Needs PIN, stop loading and show PIN screen
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchAlbum();
  }, [params.id]);

  const handleUnlock = () => {
    if (!album) return;
    if (pinInput === album.pin) {
      fetchAlbum(pinInput);
      setError("");
    } else {
      setError("Incorrect PIN");
    }
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
        {/* PIN LOCK SCREEN */}
        {album.requiresPin && album.photos.length === 0 ? (
          <motion.div
            key="lock"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-sm mx-auto mt-20 bg-white/5 p-8 rounded-2xl backdrop-blur-md text-center"
          >
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-bold mb-2">This album is private</h2>
            <p className="text-gray-400 text-sm mb-6">
              Enter the 4-digit PIN to view the photos.
            </p>
            <input
              type="password"
              maxLength={4}
              className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-center text-2xl tracking-widest focus:outline-none focus:border-purple-500"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
            />
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            <button
              onClick={handleUnlock}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold transition-colors"
            >
              Unlock Album
            </button>
          </motion.div>
        ) : (
          /* 3D PHOTO GALLERY */
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto perspective-1000"
          >
            {album.photos.map((photo: any) => (
              <Photo3D
                key={photo.id}
                imageUrl={photo.imageUrl}
                videoUrl={photo.videoUrl}
                alt="Album photo"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
