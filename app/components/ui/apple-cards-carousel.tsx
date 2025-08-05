"use client";
import React, { useEffect, useRef, useState, createContext, useContext, useCallback, memo, useMemo } from "react";
import { IconArrowRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image, { type ImageProps } from "next/image";
import type { JSX } from "react/jsx-runtime";
import { useRouter } from "next/navigation";
import { HoverBorderGradient } from "./hover-border-gradient";

interface CarouselProps {
  items: JSX.Element[];
}

type Card = {
  src: string;
  title: string;
  features?: string[];
  description?: string;
  link?: string;
  badge?: string;
  subjects?: string[];
  pricing?: string;
};

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
  handleCardHover: (isHovering: boolean) => void;
  hoveredCard: string | null;
  setHoveredCard: (position: string | null) => void;
}>({
  onCardClose: () => {},
  currentIndex: 0,
  handleCardHover: () => {},
  hoveredCard: null,
  setHoveredCard: () => {},
});

export const Carousel = memo(({ items }: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [pauseReason, setPauseReason] = useState<"none" | "arrow" | "card">("none");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [lastClickedArrow, setLastClickedArrow] = useState<"left" | "right" | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-slide functionality with optimized interval
  useEffect(() => {
    if (!isAutoPlaying || items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 4000); // Increased to 4 seconds for better UX

    return () => clearInterval(interval);
  }, [items.length, isAutoPlaying]);

  // Resume auto-play after arrow click pause
  useEffect(() => {
    if (pauseReason === "arrow") {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }

      pauseTimeoutRef.current = setTimeout(() => {
        setIsAutoPlaying(true);
        setPauseReason("none");
      }, 5000); // Resume after 5 seconds
    }

    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [pauseReason]);

  const scrollLeft = useCallback(() => {
    setIsAutoPlaying(false);
    setPauseReason("arrow");
    setLastClickedArrow("left");
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? items.length - 1 : prevIndex - 1));
  }, [items.length]);

  const scrollRight = useCallback(() => {
    setIsAutoPlaying(false);
    setPauseReason("arrow");
    setLastClickedArrow("right");
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  }, [items.length]);

  const handleCardClose = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleCardHover = useCallback((isHovering: boolean) => {
    if (isHovering) {
      setIsAutoPlaying(false);
      setPauseReason("card");
    } else {
      // Resume auto-play immediately when not hovering
      setIsAutoPlaying(true);
      setPauseReason("none");
    }
  }, []);

  const visibleCards = useMemo(() => {
    const visibleCards = [];
    const totalItems = items.length;

    // Previous card
    const prevIndex = currentIndex === 0 ? totalItems - 1 : currentIndex - 1;
    visibleCards.push({ item: items[prevIndex], index: prevIndex, position: "left" });

    // Current card
    visibleCards.push({ item: items[currentIndex], index: currentIndex, position: "center" });

    // Next card
    const nextIndex = (currentIndex + 1) % totalItems;
    visibleCards.push({ item: items[nextIndex], index: nextIndex, position: "right" });

    return visibleCards;
  }, [items, currentIndex]);

  return (
    <CarouselContext.Provider
      value={{
        onCardClose: handleCardClose,
        currentIndex,
        handleCardHover,
        hoveredCard,
        setHoveredCard,
      }}
    >
      <div className="relative w-full pt-4 sm:pt-6">
        <div className="flex w-full py-0 justify-center">
          <div className="flex flex-row items-center gap-2 sm:gap-4 md:gap-8 px-2 sm:px-4">
            {visibleCards.map(({ item, index, position }) => {
              // Determine focus state based on hover or default center focus
              const isFocused = hoveredCard ? hoveredCard === position : position === "center";

              return (
                <motion.div
                  key={`${index}-${position}`}
                  initial={false}
                  animate={{
                    opacity: isFocused ? 1 : 0.7,
                    scale: isFocused ? 1 : 0.9,
                    filter: isFocused ? "blur(0px) brightness(1)" : "blur(0.5px) brightness(0.95)",
                  }}    
                  transition={{
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="flex-shrink-0 p-2"
                  onMouseEnter={() => {
                    if (hoverTimeoutRef.current) {
                      clearTimeout(hoverTimeoutRef.current);
                    }
                    handleCardHover(true);
                    setHoveredCard(position);
                  }}
                  onMouseLeave={() => {
                    // Clear any existing timeout
                    if (hoverTimeoutRef.current) {
                      clearTimeout(hoverTimeoutRef.current);
                    }
                    
                    // Set a small timeout to prevent flickering when moving between cards
                    hoverTimeoutRef.current = setTimeout(() => {
                      handleCardHover(false);
                      setHoveredCard(null);
                    }, 50);
                  }}
                  role="tabpanel"
                  aria-hidden={!isFocused}
                >
                  {React.cloneElement(item, {
                    ...item.props,
                    isFocused,
                    position,
                  })}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Navigation buttons - Left and Right sides */}
        <button
          className={cn(
            "absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-40 flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 text-white",
            lastClickedArrow === "left" 
              ? "ring-2 ring-yellow-400 ring-offset-2" 
              : ""
          )}
          onClick={scrollLeft}
          aria-label="Previous card"
          aria-describedby="carousel-navigation"
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          className={cn(
            "absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 text-white",
            lastClickedArrow === "right" 
              ? "ring-2 ring-yellow-400 ring-offset-2" 
              : ""
          )}
          onClick={scrollRight}
          aria-label="Next card"
          aria-describedby="carousel-navigation"
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide indicators */}
        <div 
          className="flex justify-center gap-2 mt-2"
          id="carousel-navigation"
          role="tablist"
          aria-label="Carousel navigation"
        >
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-blue-600 scale-125"
                  : "bg-gray-300 hover:bg-gray-400"
              )}
              aria-label={`Go to slide ${index + 1}`}
              aria-selected={index === currentIndex}
              role="tab"
            />
          ))}
        </div>
      </div>
    </CarouselContext.Provider>
  );
});

Carousel.displayName = "Carousel";



export const Card = memo(({
  card,
  index,
  isFocused = false,
  position,
}: {
  card: Card;
  index: number;
  isFocused?: boolean;
  position?: string;
}) => {
  const { onCardClose, currentIndex } = useContext(CarouselContext);
  const router = useRouter();

  return (
    <motion.div
      className={cn(
        "relative z-10 flex flex-col items-start justify-start overflow-hidden rounded-2xl sm:rounded-3xl font-sans backdrop-blur-sm",
        isFocused
          ? "h-[28rem] w-64 sm:h-80 sm:w-64 md:h-[40rem] md:w-[28rem] bg-white/95 shadow-2xl border border-white/20 shadow-blue-500/20"
          : "h-[24rem] w-56 sm:h-72 sm:w-56 md:h-[36rem] md:w-[24rem] bg-white/90 shadow-lg border border-white/10",
      )}
      animate={{
        scale: isFocused ? 1.02 : 1,
        y: isFocused ? -8 : 0,
      }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{
        scale: isFocused ? 1.03 : 1.01,
        transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
      }}
    >
      {/* Premium Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl" />
      
      {/* Enhanced Accent Bar */}
      <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-l-3xl shadow-lg" />
      
      {/* Top 2/5 Image with Enhanced Styling */}
      <div className="w-full h-2/5 relative z-10 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-t-3xl z-10" />
        <BlurImage 
          src={card.src} 
          alt={card.title} 
          className="h-full w-full object-cover rounded-t-3xl transition-transform duration-500 hover:scale-105" 
        />
        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent rounded-t-3xl" />
      </div>
      
      {/* Bottom 3/5 Content with Glassmorphism */}
      <div className="w-full h-3/5 flex flex-col rounded-b-3xl overflow-hidden relative z-20 bg-gradient-to-br from-white/80 via-blue-50/60 to-purple-50/60 backdrop-blur-sm border-t border-white/20">
        <div className={cn(
          "flex flex-col flex-1 overflow-hidden",
          isFocused ? "gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2 p-1 sm:p-1.5 md:p-2 lg:p-3 xl:p-4" : "gap-0.5 p-0.5 sm:p-1 md:p-1.5 lg:p-2 xl:p-3"
        )}>
          {/* Enhanced Badge */}
          {card.badge && (
            <motion.span 
              className={cn(
                "inline-block rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold shadow-lg w-fit hover:shadow-xl transition-all duration-300 hover:scale-105",
                isFocused ? "px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-1.5 mb-0.5 sm:mb-1 md:mb-2 lg:mb-3 text-xs" : "px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 mb-0.5 sm:mb-1 md:mb-1.5 lg:mb-2 text-xs"
              )}
              whileHover={{ scale: 1.05 }}
            >
              ✨ {card.badge}
            </motion.span>
          )}
          
          {/* Enhanced Title */}
          <h3 className={cn(
            "font-bold tracking-tight bg-gradient-to-r from-gray-800 via-purple-800 to-blue-800 bg-clip-text text-transparent",
            isFocused ? "text-sm sm:text-base md:text-lg mb-0.5 sm:mb-1" : "text-xs sm:text-sm md:text-base mb-0.5 sm:mb-1"
          )}>
            {card.title}
          </h3>
          
          {/* Enhanced Divider */}
          <div className={cn(
            "rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 shadow-lg border border-yellow-300/50",
            isFocused ? "w-12 sm:w-16 md:w-24 h-1 mb-0.5 sm:mb-1 md:mb-2 lg:mb-3" : "w-6 sm:w-8 md:w-10 h-1 mb-0.5 sm:mb-1"
          )} />
         
          
          {/* Enhanced Description */}
          {card.description && (
            <p className={cn(
              "text-gray-600 font-medium leading-relaxed text-left",
              isFocused ? "text-xs sm:text-sm mb-1 sm:mb-1.5 md:mb-2 lg:mb-3" : "text-xs mb-0.5 sm:mb-1 md:mb-1.5 lg:mb-2"
            )}>
              {card.description}
            </p>
          )}
          
          {/* Enhanced Competition Preparation Section */}
          <div className="mb-0.5 sm:mb-1 md:mb-2">
            <h4 className={cn(
              "font-semibold text-gray-800 mb-1 sm:mb-1.5 flex items-center gap-1",
              isFocused ? "text-xs" : "text-xs"
            )}>
              <span className="text-yellow-500">🏆</span> Competition Preparation
            </h4>
            <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
              {card.subjects && card.subjects.length > 0 && (
                <motion.span 
                  className={cn(
                    "rounded-full bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 font-medium border border-blue-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-1 justify-center truncate",
                    isFocused ? "px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-xs" : "px-1 sm:px-2 py-0.5 text-xs"
                  )}
                  whileHover={{ scale: 1.02 }}
                  title={card.subjects[0]}
                >
                  📚 <span className="truncate">{card.subjects[0]}</span>
                </motion.span>
              )}
              {card.subjects && card.subjects.length > 1 && (
                <motion.span 
                  className={cn(
                    "rounded-full bg-gradient-to-r from-purple-50 to-pink-50 text-gray-700 font-medium border border-purple-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-1 justify-center truncate",
                    isFocused ? "px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-xs" : "px-1 sm:px-2 py-0.5 text-xs"
                  )}
                  whileHover={{ scale: 1.02 }}
                  title={card.subjects[1]}
                >
                  🧠 <span className="truncate">{card.subjects[1]}</span>
                </motion.span>
              )}
            </div>
          </div>
          
          {/* Enhanced Advanced Coaching Section */}
          <div className="mb-0.5 sm:mb-1 md:mb-2">
            <h4 className={cn(
              "font-semibold text-gray-800 mb-1 sm:mb-1.5 flex items-center gap-1",
              isFocused ? "text-xs" : "text-xs"
            )}>
              <span className="text-purple-500">⚡</span> Advanced Coaching
            </h4>
            <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
              {card.features && card.features.length > 0 && (
                <motion.span 
                  className={cn(
                    "rounded-full bg-gradient-to-r from-green-50 to-blue-50 text-gray-700 font-medium border border-green-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-1 justify-center truncate",
                    isFocused ? "px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-xs" : "px-1 sm:px-2 py-0.5 text-xs"
                  )}
                  whileHover={{ scale: 1.02 }}
                  title={card.features[0]}
                >
                  ✨ <span className="truncate">{card.features[0]}</span>
                </motion.span>
              )}
              {card.features && card.features.length > 1 && (
                <motion.span 
                  className={cn(
                    "rounded-full bg-gradient-to-r from-orange-50 to-yellow-50 text-gray-700 font-medium border border-orange-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-1 justify-center truncate",
                    isFocused ? "px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-xs" : "px-1 sm:px-2 py-0.5 text-xs"
                  )}
                  whileHover={{ scale: 1.02 }}
                  title={card.features[1]}
                >
                  🎯 <span className="truncate">{card.features[1]}</span>
                </motion.span>
              )}
            </div>
          </div>
          
          {/* Enhanced Pricing */}
          {card.pricing && (
            <motion.div 
              className={cn(
                "font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-1",
                isFocused ? "text-xs mb-1 sm:mb-1.5 md:mb-2 lg:mb-3" : "text-xs mb-0.5 sm:mb-1 md:mb-1.5 lg:mb-2"
              )}
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-blue-500">💰</span> {card.pricing}
            </motion.div>
          )}
        </div>
        
        {/* Enhanced Explore button */}
        <div className={cn(
          "flex justify-center flex-shrink-0",
          isFocused ? "pb-1 sm:pb-1.5 md:pb-2 lg:pb-3 px-1.5 sm:px-2 md:px-3 lg:px-4 xl:px-5" : "pb-0.5 sm:pb-1 md:pb-1.5 lg:pb-2 px-1 sm:px-1.5 md:px-2 lg:px-3 xl:px-4"
        )}>
          <HoverBorderGradient
            onClick={() => { if (card.link) { router.push(card.link); } }}
            containerClassName={cn(
              "w-full",
              isFocused ? "max-w-xs" : "max-w-[85%]"
            )}
            className={cn(
              "flex items-center justify-center gap-1 sm:gap-2 text-white drop-shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl font-semibold",
              isFocused 
                ? "px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm tracking-wide" 
                : "px-3 sm:px-4 py-1.5 sm:py-2 text-xs tracking-wide"
            )}
            duration={1.5}
          >
            <span>🔍 Explore Program</span>
            <IconArrowRight className={cn(
              "drop-shadow-sm",
              isFocused ? "w-3 h-3 sm:w-4 sm:h-4" : "w-2.5 h-2.5 sm:w-3 sm:h-3"
            )} />
          </HoverBorderGradient>
        </div>
      </div>
    </motion.div>
  );
});

Card.displayName = "Card";

export const BlurImage = memo(({ height, width, src, className, alt, ...rest }: ImageProps) => {
  const [isLoading, setLoading] = useState(true);

  // Remove blurDataURL prop to fix React warning
  const { blurDataURL, ...imageProps } = rest;

  return (
    <Image
      className={cn("h-full w-full transition-all duration-400 ease-out", isLoading ? "blur-sm" : "blur-0", className)}
      onLoad={() => setLoading(false)}
      src={(src as string) || "/placeholder.svg"}
      width={width || 400}
      height={height || 300}
      loading="lazy"
      alt={alt ? alt : "Background of a beautiful view"}
      priority={false}
      quality={85}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      {...imageProps}
    />
  );
});

BlurImage.displayName = "BlurImage";