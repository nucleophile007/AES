"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import TestimonialDialog from "./TestimonialDialog";

type SuccessStory = {
  name: string;
  achievement: string;
  improvement: string;
  subject: string;
  testimonial: string;
  image: string;
  highlight: string;
};

const successStoriesByCategory: { [key: string]: SuccessStory[] } = {
  Tutoring: [
    {
      name: "Sarah Chen",
      achievement: "AP Calculus BC - Score 5",
      improvement: "From C+ to AP Excellence",
      subject: "Advanced Mathematics",
      testimonial:
        "The personalized tutoring approach helped me understand complex calculus concepts that I was struggling with. My tutor broke down every problem step by step, making it so much clearer.",
      image: "/placeholder.svg",
      highlight: "Personalized Learning Success",
    },
    // ... (add the rest as in your original)
  ],
  // ... (other categories)
};

const categories = [
  "Tutoring",
  "SAT Coaching",
  "College Prep",
  "Research Program",
  "Math Competition",
];

export default function SuccessStoriesSection() {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [testimonialOpen, setTestimonialOpen] = useState(false);

  return (
    <section id="success" className="py-20 bg-gradient-to-br from-brand-light-blue/20 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-brand-green/10 text-brand-green">Success Stories</Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">Student Outcomes & Alumni Success</h2>
          <p className="text-xl text-text-light max-w-3xl mx-auto">Discover how our students excel across all our programs</p>
        </motion.div>
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === category
                    ? "bg-gradient-to-r from-brand-blue to-brand-teal text-white shadow-lg"
                    : "bg-white text-text-dark hover:bg-brand-blue/10 border border-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Carousel
              opts={{ align: "start", loop: true, slidesToScroll: 1 }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {successStoriesByCategory[activeCategory]?.map((story, index) => (
                  <CarouselItem
                    key={index}
                    className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
                  >
                    <Card className="h-full hover:shadow-xl transition-all duration-300 group">
                      <CardHeader>
                        <div className="flex items-center space-x-4">
                          <Avatar className="border-2 border-brand-blue/20">
                            <AvatarImage src={story.image} />
                            <AvatarFallback className="bg-gradient-to-br from-brand-blue to-brand-teal text-white">
                              {story.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{story.name}</CardTitle>
                            <CardDescription className="font-medium text-brand-teal">{story.achievement}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-3 bg-gradient-to-r from-brand-blue/10 to-brand-teal/10 rounded-lg">
                          <div className="text-sm font-semibold text-brand-blue text-center">{story.highlight}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-center p-2 bg-brand-green/10 rounded-lg">
                            <div className="text-xs font-semibold text-brand-green">{story.improvement}</div>
                          </div>
                          <div className="text-center p-2 bg-brand-orange/10 rounded-lg">
                            <div className="text-xs font-semibold text-brand-orange">{story.subject}</div>
                          </div>
                        </div>
                        <blockquote className="text-sm text-text-light italic border-l-4 border-brand-teal pl-4">&quot;{story.testimonial}&quot;</blockquote>
                        <div className="flex text-brand-orange justify-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-brand-blue to-brand-teal hover:from-brand-blue/90 hover:to-brand-teal/90"
            onClick={() => setTestimonialOpen(true)}
          >
            <Plus className="mr-2 h-5 w-5" />
            Leave a Testimonial
          </Button>
          <TestimonialDialog open={testimonialOpen} setOpen={setTestimonialOpen} />
        </motion.div>
      </div>
    </section>
  );
} 