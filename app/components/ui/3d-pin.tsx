"use client";
import React, { createContext, useContext, useRef, useState } from "react";
import { motion } from "framer-motion";

const MouseEnterContext = createContext<{
  mouseX: number;
  mouseY: number;
}>({
  mouseX: 0,
  mouseY: 0,
});

export const CardContainer = ({
  children,
  className,
  containerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMouseX(e.clientX - rect.left);
    setMouseY(e.clientY - rect.top);
  };

  return (
    <MouseEnterContext.Provider value={{ mouseX, mouseY }}>
      <motion.div
        onMouseMove={handleMouseMove}
        ref={containerRef}
        className={`flex items-center justify-center ${containerClassName}`}
        style={{
          transformStyle: "preserve-3d",
        }}
        whileHover="hover"
      >
        <div className={className}>{children}</div>
      </motion.div>
    </MouseEnterContext.Provider>
  );
};

export const CardBody = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { mouseX, mouseY } = useContext(MouseEnterContext);

  const rotateX = mouseY / 5;
  const rotateY = mouseX / 5;

  return (
    <motion.div
      ref={ref}
      style={{
        transformStyle: "preserve-3d",
      }}
      animate={{
        rotateX,
        rotateY,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const PinContainer = ({
  children,
  title,
  href,
  className,
  containerClassName,
}: {
  children: React.ReactNode;
  title?: string;
  href?: string;
  className?: string;
  containerClassName?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const { mouseX, mouseY } = useContext(MouseEnterContext);

  const rotateX = mouseY / 24;
  const rotateY = mouseX / 24;

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <motion.div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
      }}
      animate={
        isHovered
          ? {
              rotateX,
              rotateY,
              z: 30,
            }
          : {
              rotateX: 0,
              rotateY: 0,
              z: 0,
            }
      }
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
      className={`group relative ${className}`}
    >
      <motion.div
        style={{
          transformStyle: "preserve-3d",
        }}
        className="relative h-full w-full"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-yellow-500/30 to-yellow-400/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {children}
      </motion.div>
    </motion.div>
  );
};


