"use client";
import React, { memo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";

const AppleCardsCarouselDemo = dynamic(() => import("../ui/apple-cards-carousel-demo"), {
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
    </div>
  ),
  ssr: false,
});

// Enhanced animation variants for better UX
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 1,
      staggerChildren: 0.2,
      ease: "easeOut" as const
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.8,
      ease: "easeOut" as const
    }
  }
};

const badgeVariants = {
  hidden: { scale: 0, rotate: -180, opacity: 0 },
  visible: { 
    scale: 1, 
    rotate: 0,
    opacity: 1,
    transition: { 
      type: "spring" as const,
      stiffness: 200,
      damping: 15,
      delay: 0.3
    }
  }
};

const carouselVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 1.2, 
      delay: 0.8,
      ease: "easeOut" as const
    }
  }
};

const ProgramsSection = memo(() => {
  return (
    <section 
      id="programs" 
      className="py-16 sm:py-20 lg:py-32 theme-bg-dark relative overflow-hidden min-h-screen flex items-center"
      aria-labelledby="programs-heading"
    >
      {/* Enhanced background elements for better visual depth */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-5 animate-float"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-blue-400 rounded-full opacity-5 animate-float-reverse"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-purple-400 rounded-full opacity-5 animate-float"></div>
      </div>
      
      <div className="container mx-auto relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <motion.div variants={badgeVariants} className="mb-3 sm:mb-4">
            {/* <Badge 
              className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20 text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2"
              aria-label="Premium programs badge"
            >
              ✨ Our Premium Programs
            </Badge> */}
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
            Our Premium Programs
          </Badge>
          </motion.div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold theme-text-light mb-4 sm:mb-6">
            Unlock Your Child&apos;s Academic Edge
          </h2>
          <p className="text-lg theme-text-muted max-w-2xl mx-auto">
            Our tailored programs and expert mentorship help your child achieve academic excellence.
          </p>
          {/* <motion.h2
            id="programs-heading"
            variants={itemVariants}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-center mb-3 sm:mb-4 lg:mb-6 leading-tight px-2 theme-text-light"
          >
            Unlock Your Child&apos;s
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 block">
              Academic Edge
            </span>
          </motion.h2> */}
          
          {/* <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl lg:text-2xl max-w-4xl mx-auto px-6 py-6 backdrop-blur-md rounded-2xl shadow-2xl font-medium leading-relaxed"
            style={{ 
              color: 'hsl(var(--v0-text-readable))',
              background: 'linear-gradient(to right, hsl(var(--v0-blue-medium)/60), hsl(var(--v0-blue-dark)/60))',
              border: '1px solid hsl(var(--v0-yellow)/20)'
            }}
          >
            🚀{" "}
            <span className="font-bold" style={{ color: 'hsl(var(--v0-yellow))' }}>Personalized Mentorship</span>
            {" "}•{" "}
            <span className="font-bold" style={{ color: 'hsl(var(--v0-blue-light))' }}>Proven Results</span>
            {" "}•{" "}
            <span className="font-bold" style={{ color: 'hsl(var(--v0-yellow))' }}>Expert Guidance</span>
          </motion.p> */}
        </motion.div>

        {/* Enhanced carousel section with better visual hierarchy */}
        <motion.div
          variants={carouselVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="relative"
        >
          {/* Enhanced carousel background */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-sky-400/5 to-yellow-400/10 rounded-3xl blur-2xl"
            aria-hidden="true"
          />
          <div className="relative z-10">
            <AppleCardsCarouselDemo />
          </div>
        </motion.div>

        {/* Additional call-to-action for better engagement */}
                  {/* <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="text-center mt-12 sm:mt-16"
          >
            <p className="text-sm sm:text-base mb-4" style={{ color: 'hsl(var(--v0-text-muted))' }}>
              Ready to transform your academic journey?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                className="px-8 py-4 font-bold rounded-xl shadow-2xl hover:scale-105 transition-all duration-300"
                style={{ 
                  backgroundColor: 'hsl(var(--v0-yellow))',
                  color: 'hsl(var(--v0-blue-dark))',
                  boxShadow: '0 25px 50px -12px hsl(var(--v0-yellow)/25)'
                }}
              >
                Start Your Journey →
              </button>
              <button 
                className="px-8 py-4 border-2 font-bold rounded-xl transition-all duration-300"
                style={{ 
                  borderColor: 'hsl(var(--v0-blue-light))',
                  color: 'hsl(var(--v0-blue-light))'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'hsl(var(--v0-blue-light))';
                  e.currentTarget.style.color = 'hsl(var(--v0-blue-dark))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'hsl(var(--v0-blue-light))';
                }}
              >
                Learn More
              </button>
            </div>
          </motion.div> */}
      </div>
    </section>
  );
});

ProgramsSection.displayName = "ProgramsSection";

export default ProgramsSection;