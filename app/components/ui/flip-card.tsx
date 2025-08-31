"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

interface FlipCardProps {
  children: React.ReactNode;
  className?: string;
  height?: string;
  delay?: number;
  autoFlip?: boolean;
  autoFlipDelay?: number;
}

interface FlipCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const FlipCard: React.FC<FlipCardProps> = ({ 
  children, 
  className = "", 
  height = "h-72",
  delay = 0,
  autoFlip = false,
  autoFlipDelay = 0
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: false, amount: 0.4 });
  
  // Effect to handle flipping when section is in view
  useEffect(() => {
    let flipTimer: NodeJS.Timeout;
    let resetTimer: NodeJS.Timeout;
    
    if (isInView && autoFlip) {
      // Start flip timer when card is in view
      flipTimer = setTimeout(() => {
        setIsFlipped(true);
      }, autoFlipDelay);
    } else {
      // When out of view, reset flip state after a short delay
      resetTimer = setTimeout(() => {
        setIsFlipped(false);
      }, 300);
    }
    
    return () => {
      clearTimeout(flipTimer);
      clearTimeout(resetTimer);
    };
  }, [isInView, autoFlip, autoFlipDelay]);

  return (
    <motion.div 
      ref={cardRef}
      className={`relative w-full ${height} perspective-1000 ${className}`}
      initial={{ opacity: 0, scale: 0.9, y: 50 }}
      whileInView={{ 
        opacity: 1, 
        scale: 1, 
        y: 0
      }}
      transition={{ 
        duration: 0.8,
        delay: delay,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={{ scale: 1.02 }}
    >
      <motion.div
        className="relative w-full h-full transform-style-preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ 
          duration: 0.7,
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        {/* Front of card */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === FlipCardFront) {
              return child;
            }
            return null;
          })}
        </div>

        {/* Back of card - Properly oriented */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === FlipCardBack) {
              return child;
            }
            return null;
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export const FlipCardFront: React.FC<FlipCardContentProps> = ({ children, className = "" }) => {
  return (
    <div className={`absolute inset-0 w-full h-full ${className}`}>
      {children}
    </div>
  );
};

export const FlipCardBack: React.FC<FlipCardContentProps> = ({ children, className = "" }) => {
  return (
    <div className={`absolute inset-0 w-full h-full ${className}`}>
      {children}
    </div>
  );
};

// Default export for the main component
export default FlipCard;
