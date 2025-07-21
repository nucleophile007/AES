"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
        <a href={href} className={className || "cursor-pointer text-gray-700 hover:text-brand-blue transition-all duration-300 py-2 relative overflow-hidden"}>
          <span className="relative z-10">{item}</span>
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-blue transition-all duration-300 group-hover:w-full"></span>
        </a>
      ) : (
        <motion.p
          transition={{ duration: 0.3 }}
          className={className || "cursor-pointer text-gray-700 hover:text-brand-blue transition-all duration-300 py-2 relative overflow-hidden"}
        >
          <span className="relative z-10">{item}</span>
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-blue transition-all duration-300 group-hover:w-full"></span>
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
                className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-2xl ring-1 ring-black/5"
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
      className="relative flex items-center space-x-6 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200/50 shadow-sm"
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
    <a href={href} className="flex space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
      <div className="relative overflow-hidden rounded-lg">
        <Image
          src={src}
          width={120}
          height={60}
          alt={title}
          className="shrink-0 rounded-lg shadow-md object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white truncate group-hover:text-brand-blue transition-colors duration-300">
          {title}
        </h4>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
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
      className="text-neutral-700 dark:text-neutral-200 hover:text-black "
    >
      {children}
    </a>
  );
};
