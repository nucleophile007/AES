"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { SparklesCore } from "@/components/ui/sparkles";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { IconDotsVertical } from "@tabler/icons-react";
import Image from "next/image";

interface CompareProps {
  firstImage?: string;
  secondImage?: string;
  firstContent?: React.ReactNode;
  secondContent?: React.ReactNode;
  className?: string;
  firstImageClassName?: string;
  secondImageClassname?: string;
  firstContentClassName?: string;
  secondContentClassName?: string;
  initialSliderPercentage?: number;
  slideMode?: "hover" | "drag";
  showHandlebar?: boolean;
  mobileTapToggle?: boolean;
  centerSafeZonePx?: number;
  onProgressChange?: (progress: number) => void;
  autoplay?: boolean;
  autoplayDuration?: number;
}
export const Compare = ({
  firstImage = "",
  secondImage = "",
  firstContent,
  secondContent,
  className,
  firstImageClassName,
  secondImageClassname,
  firstContentClassName,
  secondContentClassName,
  initialSliderPercentage = 50,
  slideMode = "hover",
  showHandlebar = true,
  mobileTapToggle = false,
  centerSafeZonePx = 24,
  onProgressChange,
  autoplay = false,
  autoplayDuration = 5000,
}: CompareProps) => {
  const [sliderXPercent, setSliderXPercent] = useState(initialSliderPercentage);
  const [isDragging, setIsDragging] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);

  const [isMouseOver, setIsMouseOver] = useState(false);
  const [isTapToggleViewport, setIsTapToggleViewport] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const lastReportedProgressRef = useRef<number | null>(null);
  const isTapToggleMode = mobileTapToggle && isTapToggleViewport;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(max-width: 768px), (pointer: coarse)");
    const update = () => setIsTapToggleViewport(mediaQuery.matches);
    update();

    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!showHint) return;
    const id = setTimeout(() => setShowHint(false), 2800);
    return () => clearTimeout(id);
  }, [showHint]);

  const startAutoplay = useCallback(() => {
    if (!autoplay || isTapToggleMode) return;

    const startTime = Date.now();
    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const progress =
        (elapsedTime % (autoplayDuration * 2)) / autoplayDuration;
      const percentage = progress <= 1 ? progress * 100 : (2 - progress) * 100;

      setSliderXPercent(percentage);
      autoplayRef.current = setTimeout(animate, 16); // ~60fps
    };

    animate();
  }, [autoplay, autoplayDuration, isTapToggleMode]);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearTimeout(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  useEffect(() => {
    if (!onProgressChange) return;
    const roundedProgress = Math.round(sliderXPercent);
    if (lastReportedProgressRef.current === roundedProgress) return;
    lastReportedProgressRef.current = roundedProgress;
    onProgressChange(roundedProgress);
  }, [onProgressChange, sliderXPercent]);

  function mouseEnterHandler() {
    setIsMouseOver(true);
    stopAutoplay();
  }

  function mouseLeaveHandler() {
    setIsMouseOver(false);
    if (slideMode === "hover") {
      setSliderXPercent(initialSliderPercentage);
    }
    if (slideMode === "drag") {
      setIsDragging(false);
    }
    startAutoplay();
  }

  const dismissHint = useCallback(() => {
    setShowHint(false);
  }, []);

  const handleStart = useCallback(
    (clientX: number) => {
      if (isTapToggleMode) return;
      if (slideMode === "drag") {
        dismissHint();
        setIsDragging(true);
      }
    },
    [slideMode, dismissHint, isTapToggleMode]
  );

  const handleEnd = useCallback(() => {
    if (isTapToggleMode) return;
    if (slideMode === "drag") {
      setIsDragging(false);
    }
  }, [slideMode, isTapToggleMode]);

  const handleMove = useCallback(
    (clientX: number) => {
      if (isTapToggleMode) return;
      if (!sliderRef.current) return;
      if (slideMode === "hover" || (slideMode === "drag" && isDragging)) {
        const rect = sliderRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = (x / rect.width) * 100;
        requestAnimationFrame(() => {
          setSliderXPercent(Math.max(0, Math.min(100, percent)));
        });
      }
    },
    [slideMode, isDragging, isTapToggleMode]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => handleStart(e.clientX),
    [handleStart]
  );
  const handleMouseUp = useCallback(() => handleEnd(), [handleEnd]);
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => handleMove(e.clientX),
    [handleMove]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isTapToggleMode) {
        dismissHint();
        return;
      }
      if (!autoplay) {
        handleStart(e.touches[0].clientX);
      }
    },
    [handleStart, autoplay, dismissHint, isTapToggleMode]
  );

  const handleTapToggle = useCallback(() => {
    if (!isTapToggleMode) return;
    dismissHint();
    setSliderXPercent((current) => (current > 50 ? 0 : 100));
  }, [dismissHint, isTapToggleMode]);

  const handleTouchEnd = useCallback(() => {
    if (isTapToggleMode) {
      handleTapToggle();
      return;
    }
    if (!autoplay) {
      handleEnd();
    }
  }, [handleEnd, autoplay, handleTapToggle, isTapToggleMode]);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isTapToggleMode) return;
      if (!autoplay) {
        handleMove(e.touches[0].clientX);
      }
    },
    [handleMove, autoplay, isTapToggleMode]
  );

  return (
    <div
      ref={sliderRef}
      className={cn("w-[400px] h-[400px] overflow-hidden", className)}
      style={{
        position: "relative",
        cursor: isTapToggleMode ? "pointer" : slideMode === "drag" ? "grab" : "col-resize",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={mouseLeaveHandler}
      onMouseEnter={mouseEnterHandler}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleTapToggle}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <AnimatePresence initial={false}>
        <motion.div
          className="h-full w-[2px] absolute top-0 m-auto z-30 bg-gradient-to-b from-transparent from-[8%] to-[92%] via-indigo-400 to-transparent"
          style={{
            left: `${sliderXPercent}%`,
            top: "0",
            zIndex: 35,
          }}
          transition={{ duration: 0 }}
        >
          <div
            className="pointer-events-none absolute inset-y-0"
            style={{
              width: `${centerSafeZonePx}px`,
              left: `${-centerSafeZonePx / 2}px`,
              background:
                "linear-gradient(to right, rgba(2,6,23,0.58), rgba(2,6,23,0.3), rgba(2,6,23,0.58))",
              backdropFilter: "blur(1px)",
            }}
          />
          <div className="w-28 h-full [mask-image:radial-gradient(72px_at_left,white,transparent)] absolute top-1/2 -translate-y-1/2 left-0 bg-gradient-to-r from-indigo-400 via-transparent to-transparent z-20 opacity-48" />
          <div className="w-10 h-2/5 [mask-image:radial-gradient(32px_at_left,white,transparent)] absolute top-1/2 -translate-y-1/2 left-0 bg-gradient-to-r from-cyan-300 via-transparent to-transparent z-10 opacity-90" />
          <div className="w-8 h-3/5 top-1/2 -translate-y-1/2 absolute -right-8 [mask-image:radial-gradient(72px_at_left,white,transparent)]">
            <MemoizedSparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={900}
              className="w-full h-full"
              particleColor="#FFFFFF"
            />
          </div>
          {showHint && showHandlebar ? (
            <div className="pointer-events-none absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-indigo-300/60 bg-slate-900/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-100 shadow-lg animate-pulse">
              {isTapToggleMode ? "Tap to Compare" : "Drag"}
            </div>
          ) : null}
          {showHandlebar && (
            <div className="h-11 w-11 rounded-full top-1/2 -translate-y-1/2 bg-gradient-to-b from-white to-slate-200 z-40 -right-[22px] absolute flex items-center justify-center shadow-[0_0_0_3px_rgba(129,140,248,0.35),0_12px_25px_rgba(15,23,42,0.55)] touch-manipulation">
              <span className="absolute -left-3 text-[10px] text-indigo-200/90 select-none">‹</span>
              <IconDotsVertical className="h-4 w-4 text-slate-800" />
              <span className="absolute -right-3 text-[10px] text-indigo-200/90 select-none">›</span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="overflow-hidden w-full h-full relative z-20 pointer-events-none">
        <AnimatePresence initial={false}>
          {firstContent ? (
            <motion.div
              className={cn(
                "absolute inset-0 z-20 rounded-2xl shrink-0 w-full h-full select-none overflow-hidden",
                firstContentClassName
              )}
              style={{
                clipPath: `inset(0 ${100 - sliderXPercent}% 0 0)`,
              }}
              transition={{ duration: 0 }}
            >
              {firstContent}
            </motion.div>
          ) : firstImage ? (
            <motion.div
              className={cn(
                "absolute inset-0 z-20 rounded-2xl shrink-0 w-full h-full select-none overflow-hidden",
                firstImageClassName
              )}
              style={{
                clipPath: `inset(0 ${100 - sliderXPercent}% 0 0)`,
              }}
              transition={{ duration: 0 }}
            >
              <Image
                alt="first image"
                src={firstImage}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 400px"
                className={cn(
                  "absolute inset-0  z-20 rounded-2xl shrink-0 w-full h-full select-none",
                  firstImageClassName
                )}
                draggable={false}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence initial={false}>
        {secondContent ? (
          <motion.div
            className={cn(
              "absolute top-0 left-0 z-[19] rounded-2xl w-full h-full select-none",
              secondContentClassName
            )}
            transition={{ duration: 0 }}
          >
            {secondContent}
          </motion.div>
        ) : secondImage ? (
          <motion.div
            className={cn(
              "absolute top-0 left-0 z-[19]  rounded-2xl w-full h-full select-none",
              secondImageClassname
            )}
            transition={{ duration: 0 }}
          >
            <Image
              alt="second image"
              src={secondImage}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 400px"
              className={cn(
                "absolute top-0 left-0 z-[19] rounded-2xl w-full h-full select-none",
                secondImageClassname
              )}
              draggable={false}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const MemoizedSparklesCore = React.memo(SparklesCore);
