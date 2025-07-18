"use client";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-brand-blue to-brand-teal">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-white space-y-8"
        >
          <h2 className="text-4xl lg:text-5xl font-bold">
            Ready to Transform Your Child&apos;s Academic Journey?
          </h2>
          <p className="text-xl opacity-90">
            Join 500+ satisfied families who have seen remarkable improvements with
            ACHARYA Educational Services. Book your free 60-minute assessment
            session today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-brand-blue hover:bg-gray-100"
            >
              Book Free Session Now
              <Calendar className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white text-brand-blue hover:bg-gray-100 hover:text-brand-blue"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Chat with Expert
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 