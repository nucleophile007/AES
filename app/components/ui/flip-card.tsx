"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface FlipCardProps {
  children: React.ReactNode;
  className?: string;
  height?: string;
  delay?: number;
}

interface FlipCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const FlipCard: React.FC<FlipCardProps> = ({ 
  children, 
  className = "", 
  height = "h-72",
  delay = 0
}) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Transform scroll progress to rotation
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [0, 180, 0]);

  useEffect(() => {
    const unsubscribe = rotateY.on("change", (latest) => {
      setIsFlipped(latest > 90);
    });
    return unsubscribe;
  }, [rotateY]);

  return (
    <motion.div 
      ref={ref}
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
        style={{ rotateY }}
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
