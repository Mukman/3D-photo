"use client";
import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

interface PhotoProps {
  imageUrl: string;
  videoUrl?: string;
  alt: string;
}

export default function Photo3D({ imageUrl, videoUrl, alt }: PhotoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), {
    stiffness: 150,
    damping: 15,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), {
    stiffness: 150,
    damping: 15,
  });

  // 1. Gyroscope Support for Mobile
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma !== null && event.beta !== null) {
        // gamma is left/right tilt, beta is front/back tilt
        x.set(event.gamma / 90);
        y.set((event.beta - 45) / 90); // 45 is a natural phone holding angle
      }
    };

    if (gyroEnabled) {
      window.addEventListener("deviceorientation", handleOrientation);
    }
    return () =>
      window.removeEventListener("deviceorientation", handleOrientation);
  }, [gyroEnabled, x, y]);

  // iOS 13+ requires explicit permission to use the gyroscope
  const enableGyro = async () => {
    if (
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      const permission = await (
        DeviceOrientationEvent as any
      ).requestPermission();
      if (permission === "granted") setGyroEnabled(true);
    } else {
      setGyroEnabled(true);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (gyroEnabled) return; // Disable mouse/touch if gyro is active
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    x.set((clientX - rect.left) / rect.width - 0.5);
    y.set((clientY - rect.top) / rect.height - 0.5);
  };

  const handleEnd = () => {
    if (gyroEnabled) return;
    x.set(0);
    y.set(0);
    setTimeout(() => setIsPlaying(false), 500);
  };

  return (
    <motion.div
      ref={ref}
      className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
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

      {/* Gyroscope Enable Button (Shows on mobile if not enabled) */}
      {!gyroEnabled && (
        <button
          onClick={enableGyro}
          className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-black/80 transition-colors"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
          </svg>
          Enable 3D Tilt
        </button>
      )}
    </motion.div>
  );
}
