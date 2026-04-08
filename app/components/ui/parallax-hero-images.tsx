"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const DEFAULT_POSITIONS = [
  { top: "13%", left: "4%", width: 400, height: 290 },
  { top: "13%", left: "70%", width: 400, height: 290 },
  { top: "58%", left: "10%", width: 400, height: 290 },
  { top: "58%", left: "64%", width: 400, height: 290 },
];

const COMPACT_POSITIONS = [
  { top: "6%", left: "6%", width: 240, height: 160 },
  { top: "6%", left: "56%", width: 240, height: 160 },
  { top: "62%", left: "6%", width: 230, height: 150 },
  { top: "62%", left: "56%", width: 230, height: 150 },
];

const DEFAULT_DEPTHS = [0.07, 0.09, 0.11, 0.13];

type ParallaxImage = {
  src: string;
  href?: string;
  alt?: string;
  label?: string;
};

type ParallaxHeroImagesProps = {
  images: Array<string | ParallaxImage>;
  className?: string;
};

export function ParallaxHeroImages({ images, className }: ParallaxHeroImagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const handleMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      targetRef.current = { x, y };
    };

    const handleLeave = () => {
      targetRef.current = { x: 0, y: 0 };
    };

    node.addEventListener("pointermove", handleMove);
    node.addEventListener("pointerleave", handleLeave);

    return () => {
      node.removeEventListener("pointermove", handleMove);
      node.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    const handleChange = () => setIsCompact(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    let frameId: number;
    const tick = () => {
      const dx = targetRef.current.x - currentRef.current.x;
      const dy = targetRef.current.y - currentRef.current.y;
      currentRef.current.x += dx * 0.08;
      currentRef.current.y += dy * 0.08;
      setOffset({ x: currentRef.current.x, y: currentRef.current.y });
      frameId = window.requestAnimationFrame(tick);
    };
    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const positions = isCompact ? COMPACT_POSITIONS : DEFAULT_POSITIONS;
  const layerImages = images.slice(0, positions.length).map((image) =>
    typeof image === "string" ? { src: image } : image
  );

  return (
    <div ref={containerRef} className={cn("absolute inset-0 z-10", className)}>
      {layerImages.map((image, index) => {
        const position = positions[index];
        const depth = DEFAULT_DEPTHS[index] || 0.06;
        const travel = isCompact ? 55 : 90;
        const translateX = offset.x * depth * travel;
        const translateY = offset.y * depth * travel;
        const content = (
          <div
            className="group relative"
            style={{ width: position.width, height: position.height }}
          >
            <Image
              src={image.src}
              alt={image.alt || "Parallax layer"}
              fill
              className="object-cover rounded-2xl bg-slate-900/40 shadow-[0_20px_40px_rgba(0,0,0,0.35)] transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 260px, 360px"
              priority={index < 2}
            />
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
            {image.label ? (
              <div className="pointer-events-none absolute bottom-3 left-3 z-40 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                {image.label}
              </div>
            ) : null}
          </div>
        );
        return (
          <div
            key={`${image.src}-${index}`}
            className="absolute"
            style={{
              top: position.top,
              left: position.left,
              transform: `translate3d(${translateX}px, ${translateY}px, 0)`,
            }}
          >
            {image.href ? (
              <Link href={image.href} className="pointer-events-auto">
                {content}
              </Link>
            ) : (
              <div className="pointer-events-auto cursor-pointer">{content}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ParallaxHeroImages;
