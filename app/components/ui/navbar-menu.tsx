"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
  href,
  className,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
  href?: string;
  className?: string;
}) => {
  const transition = {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
  };

  return (
    <div
      onMouseEnter={() => setActive(item)}
      className="relative group"
    >
      {href ? (
        <a href={href} className={className || "cursor-pointer text-yellow-400/90 hover:text-yellow-300 transition-all duration-300 py-2 px-3 rounded-lg hover:bg-white/10 backdrop-blur-sm relative overflow-hidden"}>
          <span className="relative z-10 flex items-center gap-1">
            {item}
            {children && <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />}
          </span>
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400/60 transition-all duration-300 group-hover:w-full"></span>
        </a>
      ) : (
        <motion.p
          transition={{ duration: 0.3 }}
          className={className || "cursor-pointer text-yellow-400/90 hover:text-yellow-300 transition-all duration-300 py-2 px-3 rounded-lg hover:bg-white/10 backdrop-blur-sm relative overflow-hidden"}
        >
          <span className="relative z-10 flex items-center gap-1">
            {item}
            {children && <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />}
          </span>
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400/60 transition-all duration-300 group-hover:w-full"></span>
        </motion.p>
      )}
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 5 }}
          transition={transition}
        >
          {active === item && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 pt-2 z-50">
              <motion.div
                transition={transition}
                layoutId="active"
                className="bg-[#1a2236]/95 backdrop-blur-2xl rounded-xl overflow-hidden border border-yellow-400/30 shadow-2xl ring-1 ring-yellow-400/20"
              >
                <motion.div
                  layout
                  className="w-max h-full p-4"
                >
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)} // resets the state
      className="relative flex items-center space-x-6 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-yellow-400/20 hover:bg-white/10 hover:border-yellow-400/30 transition-all duration-300 shadow-lg"
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <a href={href} className="flex space-x-3 p-4 rounded-lg hover:bg-yellow-400/10 hover:bg-opacity-20 transition-all duration-300 hover:scale-105 hover:shadow-xl group bg-white/5 border border-transparent hover:border-yellow-400/20">
      <div className="relative overflow-hidden rounded-lg">
        <Image
          src={src}
          width={120}
          height={60}
          alt={title}
          className="shrink-0 rounded-lg shadow-lg object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-lg font-bold mb-2 text-yellow-300 truncate group-hover:text-yellow-200 transition-colors duration-300">
          {title}
        </h4>
        <p className="text-yellow-400/80 text-sm leading-relaxed group-hover:text-yellow-300/90">
          {description}
        </p>
      </div>
    </a>
  );
};

export const HoveredLink = ({ children, ...rest }: any) => {
  return (
    <a
      {...rest}
      className="text-yellow-400/80 hover:text-yellow-300 transition-colors duration-300"
    >
      {children}
    </a>
  );
};
