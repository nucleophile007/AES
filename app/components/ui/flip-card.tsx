"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface FlipCardProps {
  children: React.ReactNode;
  className?: string;
  height?: string;
}

interface FlipCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const FlipCard: React.FC<FlipCardProps> = ({ 
  children, 
  className = "", 
  height = "h-72" 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className={`relative w-full ${height} cursor-pointer perspective-1000 ${className}`}
      onClick={handleFlip}
    >
      <motion.div
        className="relative w-full h-full transform-style-preserve-3d transition-all duration-700 ease-out"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        whileHover={{ scale: 1.02 }}
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

        {/* Back of card */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === FlipCardBack) {
              return child;
            }
            return null;
          })}
        </div>
      </motion.div>
    </div>
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
