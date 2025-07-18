"use client";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, Star, Calculator, Atom } from "lucide-react";

export default function MentorSpotlightSection() {
  const credentials = [
    {
      icon: Users,
      title: "University Faculty",
      description:
        "Active professors and researchers from top universities bringing cutting-edge knowledge",
    },
    {
      icon: GraduationCap,
      title: "IIT Alumni",
      description:
        "Graduates from India&apos;s premier engineering institutes with exceptional academic excellence",
    },
    {
      icon: BookOpen,
      title: "Ph.D. Professionals",
      description:
        "Industry experts with doctoral degrees combining academic rigor with practical experience",
    },
    {
      icon: Star,
      title: "US Graduates",
      description:
        "Alumni from prestigious US universities including Ivy League and top-tier institutions",
    },
  ];
  const areas = [
    {
      icon: Calculator,
      title: "Mathematics Experts",
      description:
        "Advanced mathematics specialists from calculus to competitive math",
      expertise: [
        "Calculus & Advanced Math",
        "Competition Mathematics",
        "Statistical Analysis",
        "Applied Mathematics",
      ],
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Atom,
      title: "Sciences Faculty",
      description:
        "Ph.D. holders in Physics, Chemistry, and Biology with research experience",
      expertise: [
        "Quantum Physics",
        "Organic Chemistry",
        "Molecular Biology",
        "Research Methods",
      ],
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: GraduationCap,
      title: "Pre-Med Specialists",
      description:
        "Medical school preparation experts with healthcare industry background",
      expertise: [
        "MCAT Preparation",
        "Medical School Admissions",
        "Healthcare Research",
        "Clinical Experience",
      ],
      color: "from-green-500 to-green-600",
    },
    {
      icon: BookOpen,
      title: "Humanities & Law",
      description:
        "Liberal arts and legal education professionals with advanced degrees",
      expertise: [
        "Legal Writing",
        "Critical Analysis",
        "Research Skills",
        "Academic Writing",
      ],
      color: "from-red-500 to-red-600",
    },
  ];
  return (
    <section id="mentors" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-brand-blue/10 text-brand-blue">
            Our Expert Team
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">
            Elite Educators & Industry Professionals
          </h2>
          <p className="text-xl text-text-light max-w-4xl mx-auto">
            Our team comprises IIT alumni, university faculty, and industry
            professionals with Ph.D. degrees, fostering subject mastery and
            research-driven thinking to guide students toward academic
            excellence.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {credentials.map((credential, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 bg-gradient-to-br from-brand-blue/10 to-brand-teal/10 rounded-2xl"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-brand-blue to-brand-teal rounded-full flex items-center justify-center mx-auto mb-4">
                <credential.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-text-dark">
                {credential.title}
              </h3>
              <p className="text-text-light">{credential.description}</p>
            </motion.div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {areas.map((area, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 group border-2 hover:border-brand-blue/20">
                <CardHeader className="text-center">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${area.color} flex items-center justify-center mx-auto mb-4`}
                  >
                    <area.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">{area.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {area.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-text-dark mb-2">
                      Areas of Expertise:
                    </p>
                    {area.expertise.map((skill, i) => (
                      <div
                        key={i}
                        className="flex items-center text-sm text-text-light"
                      >
                        <Star className="h-3 w-3 text-brand-orange mr-2 flex-shrink-0" />
                        {skill}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 