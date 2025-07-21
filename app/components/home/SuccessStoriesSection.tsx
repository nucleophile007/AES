"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import TestimonialDialog from "./TestimonialDialog";

type Testimonial = {
  name: string;
  achievement: string;
  improvement: string;
  subject: string;
  testimonial: string;
  image: string;
  highlight: string;
  rating: number;
};

const testimonialsByCategory: { [key: string]: Testimonial[] } = {
  Tutoring: [
    {
      name: "Pragna",
      achievement: "Physics: 95% | Math: B's to A's",
      improvement: "Academic Excellence",
      subject: "Physics & Mathematics",
      testimonial: "ACHARYA Educational Services has significantly improved my academic performance in both physics and math. With their guidance, I achieved a 95 on my physics midterm and raised my math test scores from low B's to consistent A's. The tutors are knowledgeable, clear in their explanations, and genuinely committed to student success.",
      image: "/placeholder.svg",
      highlight: "Outstanding Results",
      rating: 5,
    },
    {
      name: "Adwitha",
      achievement: "Math Grade: D to A",
      improvement: "Complete Turnaround",
      subject: "Mathematics",
      testimonial: "Shanti Swaroop is a great tutor and has helped improve in math a lot. I went from a D to an A this year. Math is now easier than before when I was struggling everything finally clicked. My confidence in math has grown throughout the year.",
      image: "/placeholder.svg",
      highlight: "Grade Transformation",
      rating: 5,
    },
    {
      name: "Lalit Pinisetti",
      achievement: "Personalized Learning Success",
      improvement: "Understanding & Motivation",
      subject: "Mathematics & Physics",
      testimonial: "The tutor is strict with students when he needs to be strict, and gentle with students when he needs to be gentle. He truly understands what each student is capable of and motivates each student precisely enough for their highest chances of success. He makes each topic easy to understand for students and is overall a great teacher.",
      image: "/placeholder.svg",
      highlight: "Personalized Approach",
      rating: 5,
    },
    {
      name: "Ruhee",
      achievement: "AP Calculus Confidence",
      improvement: "Exam Preparation Success",
      subject: "AP Calculus",
      testimonial: "I joined because I wanted help in preparing for the AP Calculus exam, and these sessions definitely boosted my confidence in and familiarity with the subject. Shanti provided lots of good practice problems, explained concepts that I didn't understand at first, and was patient if it took me a while to figure something out. Overall, great experience!",
      image: "/placeholder.svg",
      highlight: "AP Exam Success",
      rating: 5,
    },
    {
      name: "Rishitha",
      achievement: "Tailored Learning Method",
      improvement: "Concept Mastery",
      subject: "Multiple Subjects",
      testimonial: "I have joined these classes to help me get hold and excel in some of the classes that I am taking in school. Shanti Swaroop gained insights on how I learn and tailors the classes based on that which helps me to understand the different concepts even better. His way of teaching is very unique and different from any other tutor.",
      image: "/placeholder.svg",
      highlight: "Customized Learning",
      rating: 5,
    },
  ],
  "College Prep": [
    {
      name: "Eesha's Parent",
      achievement: "College Essay Excellence",
      improvement: "Strategic Application",
      subject: "College Admissions",
      testimonial: "Our daughter is a now a high school senior. She took college preparatory courses at ACHARYA. I am pleased to say that she really enjoyed working with Shanti Swaroop, who assisted her in writing five essays. His coaching helped her identify and outline her strengths, extra curricular activities, achievements and challenges in the correct format.",
      image: "/placeholder.svg",
      highlight: "Essay Writing Success",
      rating: 5,
    },
    {
      name: "Athreya",
      achievement: "Comprehensive College Guidance",
      improvement: "Career Planning",
      subject: "College Counseling",
      testimonial: `I have been working with Shanti Swaroop for about half a year at the time of this testimonial. I attended one of his talks at a stage where he talked about college admissions and what colleges look in a student. Later on, we scheduled a meeting to talk about my college needs and what I should be looking for.`,
      image: "/placeholder.svg",
      highlight: "Admissions Strategy",
      rating: 5,
    },
    {
      name: "Sahasra",
      achievement: "University Selection Success",
      improvement: "Application Enhancement",
      subject: "College Applications",
      testimonial: "Dr. Shanti Swaroop's guidance was essential to our understanding of the college application process. His patience and constant encouragement and attention are what truly make him stand apart from other counselors. He helped us narrow down the potential universities I should apply to based on my major.",
      image: "/placeholder.svg",
      highlight: "Expert Guidance",
      rating: 5,
    },
  ],
  "SAT Coaching": [],
  "Research Program": [],
  "Math Competition": [],
};

const additionalTestimonialsByCategory: { [key: string]: Testimonial[] } = {
  Tutoring: [
    {
      name: "Sloane Stenson",
      achievement: "Online Learning Success",
      improvement: "Accessible Tutoring",
      subject: "Mathematics",
      testimonial: "Shanti has been so helpful to me as my tutor. He thoroughly explains every question I have to me and provides me with extra practice when needed. Being available via zoom makes tutoring easier and more accessible.",
      image: "/placeholder.svg",
      highlight: "Online Excellence",
      rating: 5,
    },
    {
      name: "Geetika",
      achievement: "Pre-Calculus Mastery",
      improvement: "Test Score Improvement",
      subject: "Pre-Calculus",
      testimonial: "I joined these classes because I need help with Pre-Calculus, and every time I come to my classes I leave feeling more confident in the topic I am learning. Going to these classes helped me improve my test scores and helped me improve my overall grade in my pre-calculus class.",
      image: "/placeholder.svg",
      highlight: "Confidence Building",
      rating: 5,
    },
    {
      name: "IM1 Tutoring: Sutter Middle School",
      achievement: "Patient Teaching Approach",
      improvement: "Pace Adaptation",
      subject: "Mathematics",
      testimonial: "Shanti Swaroop is very patient and positive. Our daughter is having difficulty keeping up with the pace of her teacher at school. Shanti is better at explaining the concepts and allows her time to learn. He is very encouraging and helps to boost her confidence.",
      image: "/placeholder.svg",
      highlight: "Patient Guidance",
      rating: 5,
    },
    {
      name: "Pre-Calc Tutoring: Folsom High School",
      achievement: "Interactive Learning",
      improvement: "Concept Understanding",
      subject: "Pre-Calculus",
      testimonial: "Amazing Service! Shanti Swaroop is very interactive and focused with my kid. He explains concepts very well in multiple different ways and also a very nice and understanding person. Great Tutor!",
      image: "/placeholder.svg",
      highlight: "Interactive Teaching",
      rating: 5,
    },
    {
      name: "IM3 Tutoring: Folsom High School",
      achievement: "Flexible Scheduling",
      improvement: "Ongoing Support",
      subject: "Mathematics",
      testimonial: "Shanti Swaroop has flexible scheduling and we worked together to find the best days to meet that provide the most benefit for my son. He makes sure that my son is not just working on math when he is in his session but rather, he also asks that my son check in, provides updates and samples of what he is working on.",
      image: "/placeholder.svg",
      highlight: "Flexible Support",
      rating: 5,
    },
    {
      name: "IM2 Tutoring: Folsom High School",
      achievement: "Professional Methodology",
      improvement: "Strategic Planning",
      subject: "Mathematics",
      testimonial: "Shanti Swaroop is a great Tutor! He is very professional and organized in his methodology. You can tell right away that he cares about the students. He provides a game plan for his students. Would definitely recommend him.",
      image: "/placeholder.svg",
      highlight: "Professional Approach",
      rating: 5,
    },
    {
      name: "IM1 Tutoring: Folsom High School",
      achievement: "Concept Breakdown",
      improvement: "Test Preparation",
      subject: "Mathematics",
      testimonial: "Shanti has been really good about breaking down the steps of my son's struggles. He provided help with preparing for quizzes and tests. He has provided tips and tricks that helped math concepts makes sense that common core just is not accomplishing.",
      image: "/placeholder.svg",
      highlight: "Step-by-Step Learning",
      rating: 5,
    },
  ],
  "SAT Coaching": [],
  "Research Program": [],
  "Math Competition": [],
};

const categories = ["Tutoring", "SAT Coaching", "College Prep", "Research Program", "Math Competition"];

export default function SuccessStoriesSection() {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [testimonialOpen, setTestimonialOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const sectionRef = React.useRef<HTMLElement>(null);

  const currentTestimonials = testimonialsByCategory[activeCategory] || [];
  const currentAdditionalTestimonials = additionalTestimonialsByCategory[activeCategory] || [];
  const displayedTestimonials = showMore 
    ? [...currentTestimonials, ...currentAdditionalTestimonials] 
    : currentTestimonials;

  // Reset showMore when category changes
  React.useEffect(() => {
    setShowMore(false);
  }, [activeCategory]);

  const handleShowMore = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (showMore) {
      // When hiding testimonials, scroll to top of success section
      const successSection = document.getElementById('success');
      if (successSection) {
        successSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
    
    setShowMore(!showMore);
  };

  return (
    <section ref={sectionRef} id="success" className="py-20 bg-gradient-to-br from-brand-light-blue/20 to-white">
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
                onClick={() => {
                  setActiveCategory(category);
                  setShowMore(false);
                }}
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
            key={`${activeCategory}-${showMore}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {displayedTestimonials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedTestimonials.map((testimonial, index) => (
                  <Card key={`${testimonial.name}-${index}`} className="h-full hover:shadow-xl transition-all duration-300 group border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="border-2 border-brand-blue/20 h-12 w-12">
                          <AvatarImage src={testimonial.image} />
                          <AvatarFallback className="bg-gradient-to-br from-brand-blue to-brand-teal text-white text-sm">
                            {testimonial.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-gray-900">{testimonial.name}</CardTitle>
                          <CardDescription className="font-semibold text-brand-teal">{testimonial.achievement}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 bg-gradient-to-r from-brand-blue/10 to-brand-teal/10 rounded-lg border border-brand-blue/20">
                        <div className="text-sm font-bold text-brand-blue text-center">{testimonial.highlight}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-center p-2 bg-brand-green/10 rounded-lg border border-brand-green/20">
                          <div className="text-xs font-semibold text-brand-green">{testimonial.improvement}</div>
                        </div>
                        <div className="text-center p-2 bg-brand-orange/10 rounded-lg border border-brand-orange/20">
                          <div className="text-xs font-semibold text-brand-orange">{testimonial.subject}</div>
                        </div>
                      </div>
                      <blockquote className="text-sm text-gray-700 italic border-l-4 border-brand-teal pl-4 py-2 bg-gray-50 rounded-r-lg">
                        &ldquo;{testimonial.testimonial}&rdquo;
                      </blockquote>
                      <div className="flex text-brand-orange justify-center">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-gray-400 text-lg mb-4">Coming Soon</div>
                <p className="text-gray-500">Success stories for {activeCategory} will be available soon.</p>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mt-12 space-y-6"
        >
          {currentAdditionalTestimonials.length > 0 && (currentTestimonials.length + currentAdditionalTestimonials.length) > 5 && (
            <div className="inline-block">
              <button
                onClick={handleShowMore}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white transition-all duration-300 bg-background px-3 py-2"
                type="button"
              >
                {showMore ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Show Less Success Stories
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    See More Success Stories
                  </>
                )}
              </button>
            </div>
          )}

          <div className="text-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-brand-blue to-brand-teal hover:from-brand-blue/90 hover:to-brand-teal/90"
              onClick={() => setTestimonialOpen(true)}
            >
              <Plus className="mr-2 h-5 w-5" />
              Leave a Testimonial
            </Button>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-lg font-semibold text-brand-blue mb-2">&ldquo;ACHARYA helps a lot&rdquo;</p>
            <p className="text-sm text-gray-600">Join hundreds of satisfied students who have transformed their academic journey</p>
          </div>
          
          <TestimonialDialog open={testimonialOpen} setOpen={setTestimonialOpen} />
        </motion.div>
      </div>
    </section>
  );
} 