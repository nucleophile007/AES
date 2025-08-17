import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CTASection() {
  return (
    <section id="cta" className="py-12 sm:py-16 lg:py-20 theme-bg-dark relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400 rounded-full opacity-5 animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-blue-400 rounded-full opacity-5 animate-float-reverse"></div>
        <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-purple-400 rounded-full opacity-5 animate-float"></div>
        <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-green-400 rounded-full opacity-5 animate-float-reverse"></div>
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-amber-500/10"></div>
      
      <div className="container mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto space-y-6 sm:space-y-8"
        >
          <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
            Get Started Today
          </Badge>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold theme-text-light leading-tight">
            Ready to Transform Your Child&apos;s 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500">
              {" "}Academic Journey?
            </span>
          </h2>
          
          <p className="text-base sm:text-lg lg:text-xl theme-text-muted px-4 leading-relaxed max-w-3xl mx-auto">
            Join our community of satisfied families who have seen remarkable improvements with
            ACHARYA Educational Services. Book your free 60-minute assessment
            session today and discover your child&apos;s potential!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pt-4">
            <Link href="/book-session">
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-300 hover:to-yellow-400 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold w-full sm:w-auto"
              >
                Book Free Session Now
                <Calendar className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 border-2 transition-all duration-300 font-semibold"
            >
              <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Chat with Expert
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-8 border-t border-gray-700/30"
          >
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 text-sm theme-text-muted">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Free 60-Min Assessment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Expert Educators</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 