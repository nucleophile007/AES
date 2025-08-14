"use client";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle } from "lucide-react";

export default function CTASection() {
  return (
    <section id="cta" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-brand-blue to-brand-teal">
      <div className="container mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-white space-y-6 sm:space-y-8"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
            Ready to Transform Your Child&apos;s Academic Journey?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl opacity-90 px-4">
            Join 500+ satisfied families who have seen remarkable improvements with
            ACHARYA Educational Services. Book your free 60-minute assessment
            session today!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-brand-blue hover:bg-gray-100 text-sm sm:text-base"
            >
              Book Free Session Now
              <Calendar className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white text-brand-blue hover:bg-gray-100 hover:text-brand-blue text-sm sm:text-base"
            >
              <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Chat with Expert
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 