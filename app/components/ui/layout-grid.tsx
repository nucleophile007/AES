"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Card = {
  id: number;
  content: JSX.Element | React.ReactNode | string;
  className: string;
  thumbnail: string;
  hoverThumbnail?: string;
  label?: string;
  href?: string;
};

type HoverPair = {
  expandId: number;
  shrinkId: number;
};

export const LayoutGrid = ({
  cards,
  hoverPairs = [],
}: {
  cards: Card[];
  hoverPairs?: HoverPair[];
}) => {
  const [selected, setSelected] = useState<Card | null>(null);
  const [lastSelected, setLastSelected] = useState<Card | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const handleClick = (card: Card) => {
    if (card.href) {
      window.location.href = card.href;
      return;
    }
    setLastSelected(selected);
    setSelected(card);
  };

  const handleOutsideClick = () => {
    setLastSelected(selected);
    setSelected(null);
  };

  return (
    <div className="w-full h-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 md:auto-rows-fr gap-4 relative">
      {cards.map((card, i) => {
        const activePair = hoverPairs.find((pair) => pair.expandId === hoveredId);
        const shouldExpand = activePair?.expandId === card.id;
        const shouldShrink = activePair?.shrinkId === card.id;
        const sizeClass = shouldExpand
          ? "md:col-span-2"
          : shouldShrink
          ? "md:col-span-1"
          : "";

        return (
        <div key={i} className={cn(card.className, sizeClass, "transition-all duration-300")}>
          <motion.div
            onClick={() => handleClick(card)}
            onMouseEnter={() => setHoveredId(card.id)}
            onMouseLeave={() => setHoveredId(null)}
            onFocus={() => setHoveredId(card.id)}
            onBlur={() => setHoveredId(null)}
            onTouchStart={() => setHoveredId(card.id)}
            onTouchEnd={() => setHoveredId(null)}
            tabIndex={0}
            className={cn(
              card.className,
              "relative overflow-hidden",
              selected?.id === card.id
                ? "rounded-lg cursor-pointer absolute inset-0 h-1/2 w-full md:w-1/2 m-auto z-50 flex justify-center items-center flex-wrap flex-col"
                : lastSelected?.id === card.id
                ? "z-40 bg-white rounded-xl h-full w-full"
                : "bg-white rounded-xl h-full w-full"
            )}
            layoutId={`card-${card.id}`}
          >
            {selected?.id === card.id && <SelectedCard selected={selected} />}
            <ImageComponent card={card} isHovered={hoveredId === card.id} />
          </motion.div>
        </div>
      )})}
      <motion.div
        onClick={handleOutsideClick}
        className={cn(
          "absolute h-full w-full left-0 top-0 bg-black opacity-0 z-10",
          selected?.id ? "pointer-events-auto" : "pointer-events-none"
        )}
        animate={{ opacity: selected?.id ? 0.3 : 0 }}
      />
    </div>
  );
};

const ImageComponent = ({ card, isHovered }: { card: Card; isHovered: boolean }) => {
  return (
    <>
      <motion.img
        layoutId={`image-${card.id}-image`}
        src={card.thumbnail}
        height="500"
        width="500"
        className="object-cover object-top absolute inset-0 h-full w-full"
        animate={{
          opacity: card.hoverThumbnail && isHovered ? 0 : 1,
          scale: card.hoverThumbnail && isHovered ? 1.03 : 1,
        }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        alt="thumbnail"
      />
      {card.hoverThumbnail ? (
        <motion.img
          src={card.hoverThumbnail}
          height="500"
          width="500"
          className="object-contain object-center absolute inset-0 h-full w-full bg-[#0b0f1f]"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 1.06,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          alt="thumbnail"
        />
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
    </>
  );
};

const SelectedCard = ({ selected }: { selected: Card | null }) => {
  return (
    <div className="bg-transparent h-full w-full flex flex-col justify-end rounded-lg shadow-2xl relative z-[60]">
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 0.6,
        }}
        className="absolute inset-0 h-full w-full bg-black opacity-60 z-10"
      />
      <motion.div
        layoutId={`content-${selected?.id}`}
        initial={{
          opacity: 0,
          y: 100,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: 100,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className="relative px-8 pb-4 z-[70]"
      >
        {selected?.content}
      </motion.div>
    </div>
  );
};
