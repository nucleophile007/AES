"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PinContainer, CardBody } from "./3d-pin";

interface Step {
  number: number;
  title: string;
  description: string;
  color: string;
  details: string[];
}

interface StepCardProps {
  step: Step;
  index: number;
}

export default function StepCard({ step, index }: StepCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative group">
      {/* Step Number and Title in One Line */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        className="relative z-20 mx-auto mb-6 flex items-center justify-center gap-4"
      >
        {/* Number Circle - Hover trigger */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20 cursor-pointer transition-all duration-300",
            `bg-gradient-to-br ${step.color}`
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span className="text-3xl font-bold text-white">{step.number}</span>
        </motion.div>
        
        {/* Title */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
        </div>
      </motion.div>

      {/* Expanded Details - Shown on hover with 3D effect and sequential animation */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20, scale: 0.95, rotateX: -15 }}
            animate={{ opacity: 1, height: "auto", y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, height: 0, y: -20, scale: 0.95, rotateX: -15 }}
            transition={{ 
              duration: 0.5, 
              ease: "easeInOut",
              opacity: { duration: 0.3 },
              scale: { duration: 0.4 },
              rotateX: { duration: 0.4 }
            }}
            className="mt-4 overflow-hidden"
            style={{ transformStyle: "preserve-3d" }}
          >
            <PinContainer className="w-full">
              <CardBody className="w-full">
                <div className="bg-gradient-to-br from-yellow-400/10 to-yellow-500/10 rounded-2xl p-6 border border-yellow-400/20 shadow-lg">
                  <motion.h4 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="text-lg font-semibold text-yellow-600 mb-4 text-center"
                  >
                    What This Step Involves
                  </motion.h4>
                  <ul className="space-y-3">
                    {step.details.map((detail, detailIndex) => (
                      <motion.li
                        key={detailIndex}
                        initial={{ opacity: 0, x: -50, y: -20, scale: 0.5 }}
                        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                        transition={{ 
                          delay: 0.1 + (detailIndex * 0.2), // Sequential delay: 0.1, 0.3, 0.5, 0.7
                          duration: 0.6,
                          ease: "easeOut",
                          type: "spring",
                          stiffness: 100
                        }}
                        className="flex items-start gap-3 relative"
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        {/* Arrow connector line */}
                        {detailIndex > 0 && (
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ 
                              delay: 0.05 + (detailIndex * 0.2),
                              duration: 0.4,
                              ease: "easeOut"
                            }}
                            className="absolute left-6 top-0 w-0.5 h-6 bg-gradient-to-b from-yellow-400 to-yellow-500 origin-top"
                            style={{ transform: "translateY(-100%)" }}
                          />
                        )}
                        
                        <motion.div 
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ 
                            delay: 0.15 + (detailIndex * 0.2),
                            duration: 0.5,
                            type: "spring",
                            stiffness: 200
                          }}
                          className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mt-2 flex-shrink-0 shadow-lg"
                        />
                        <span className="text-gray-700 text-sm leading-relaxed font-medium">
                          {detail}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </CardBody>
            </PinContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
