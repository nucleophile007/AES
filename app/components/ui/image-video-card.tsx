"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface ImageVideoCardProps {
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  badge?: string;
  className?: string;
}

export default function ImageVideoCard({
  title,
  description,
  imageUrl,
  videoUrl,
  badge,
  className
}: ImageVideoCardProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const handleCardClick = () => {
    setIsVideoPlaying(!isVideoPlaying);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  return (
    <div className={cn("max-w-xs w-full", className)}>
      <motion.div
        className={cn(
          "group w-full cursor-pointer overflow-hidden relative card h-96 rounded-md shadow-xl mx-auto flex flex-col justify-end p-4 border border-transparent dark:border-neutral-800",
          "bg-cover bg-center",
          "transition-all duration-500"
        )}
        style={{
          backgroundImage: isVideoPlaying ? 'none' : `url(${imageUrl})`
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCardClick}
      >
        {/* Video Player */}
        <AnimatePresence>
          {isVideoPlaying && (
            <motion.video
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              loop
              muted={isMuted}
              playsInline
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </motion.video>
          )}
        </AnimatePresence>

        {/* Overlay when video is playing */}
        {isVideoPlaying && (
          <div className="absolute inset-0 bg-black/30" />
        )}

        {/* Badge */}
        {badge && (
          <div className="absolute top-4 right-4 z-50">
            <span className="bg-yellow-400/90 text-[#1a2236] text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              {badge}
            </span>
          </div>
        )}

        {/* Play/Pause Icon */}
        <div className="absolute inset-0 flex items-center justify-center z-40">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: isVideoPlaying ? 0 : 1 }}
            className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30"
          >
            <Play className="w-8 h-8 text-white" />
          </motion.div>
        </div>

        {/* Mute/Unmute Button */}
        {isVideoPlaying && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 left-4 z-50 w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20"
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-white" />
            ) : (
              <Volume2 className="w-4 h-4 text-white" />
            )}
          </motion.button>
        )}

        {/* Content */}
        <div className="text relative z-50">
          <h3 className="font-bold text-xl md:text-2xl text-gray-50 relative mb-2">
            {title}
          </h3>
          <p className="font-normal text-sm text-gray-50 relative opacity-90">
            {description}
          </p>
        </div>

        {/* Click Instruction */}
        {!isVideoPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-4 left-4 text-xs text-white/70"
          >
            Click to play video
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}


