"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

let interval: any;

type Card = {
  id: number;
  name: string;
  designation: string;
  content: React.ReactNode;
};

export const CardStack = ({
  items,
  offset,
  scaleFactor,
}: {
  items: Card[];
  offset?: number;
  scaleFactor?: number;
}) => {
  const CARD_OFFSET = offset || 10;
  const SCALE_FACTOR = scaleFactor || 0.06;
  const [cards, setCards] = useState<Card[]>(items);

  useEffect(() => {
    startFlipping();

    return () => clearInterval(interval);
  }, []);
  
  const startFlipping = () => {
    interval = setInterval(() => {
      setCards((prevCards: Card[]) => {
        const newArray = [...prevCards]; // create a copy of the array
        newArray.unshift(newArray.pop()!); // move the last element to the front
        return newArray;
      });
    }, 5000);
  };

  return (
    <div className="relative h-full w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto">
      {cards.map((card, index) => {
        return (
          <motion.div
            key={card.id}
            className="absolute inset-0 bg-[#1a2236]/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-yellow-400/30 flex flex-col justify-between cursor-pointer hover:border-yellow-400/50 transition-all duration-300"
            style={{
              transformOrigin: "top center",
            }}
            animate={{
              top: index * -CARD_OFFSET,
              scale: 1 - index * SCALE_FACTOR, // decrease scale for cards that are behind
              zIndex: cards.length - index, //  decrease z-index for the cards that are behind
            }}
            whileHover={{
              scale: index === 0 ? 1.02 : 1 - index * SCALE_FACTOR,
              y: index === 0 ? -8 : 0,
              boxShadow: index === 0 ? "0 25px 50px -12px rgba(250, 204, 21, 0.25)" : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
              type: "spring",
              stiffness: 100,
            }}
          >
            <div className="font-normal text-gray-300 text-base leading-relaxed flex-1 overflow-hidden">
              {card.content}
            </div>
            <div className="mt-4">
              <p className="text-yellow-400 font-bold text-lg">
                {card.name}
              </p>
              <p className="text-yellow-400/80 font-medium text-base">
                {card.designation}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
