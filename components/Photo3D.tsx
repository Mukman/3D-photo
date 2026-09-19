"use client";
import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

interface PhotoProps {
  imageUrl: string;
  videoUrl?: string;
  alt: string;
}

export default function Photo3D({ imageUrl, videoUrl, alt }: PhotoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [18, -18]), {
    stiffness: 180,
    damping: 18,
    mass: 0.7,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-18, 18]), {
    stiffness: 180,
    damping: 18,
    mass: 0.7,
  });

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    x.set((clientX - rect.left) / rect.width - 0.5);
    y.set((clientY - rect.top) / rect.height - 0.5);
  };

  const handleEnd = () => {
    x.set(0);
    y.set(0);
    setTimeout(() => setIsPlaying(false), 400);
  };

  return (
    <motion.div
      ref={ref}
      className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        transformPerspective: 1200,
        transition: "transform 0.2s ease-out",
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleEnd}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onMouseEnter={() => videoUrl && setIsPlaying(true)}
      onTouchStart={() => videoUrl && setIsPlaying(true)}
      whileTap={{ scale: 0.98 }}
    >
      <img
        src={imageUrl}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {videoUrl && (
        <motion.video
          src={videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          loop
          playsInline
          autoPlay={isPlaying}
          initial={{ opacity: 0 }}
          animate={{ opacity: isPlaying ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {videoUrl && (
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <div
            className={`w-2 h-2 rounded-full ${isPlaying ? "bg-red-500 animate-pulse" : "bg-white"}`}
          ></div>
          LIVE
        </div>
      )}
    </motion.div>
  );
}
