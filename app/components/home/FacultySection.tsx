"use client";
import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Linkedin, Globe, Mail } from "lucide-react";

const faculty = [
  {
    name: "Dr. Rajesh Acharya",
    role: "Founder & Lead Mathematics Educator",
    education: "Ph.D. in Applied Mathematics",
    institution: "IIT Delhi Alumni",
    experience: "15+ years",
    specialties: ["Advanced Calculus", "Linear Algebra", "Competition Math", "AP Mathematics"],
    achievements: ["500+ students mentored", "98% improvement rate", "Research publications"],
    image: "/placeholder.svg",
  },
  {
    name: "Dr. Priya Sharma",
    role: "Head of Sciences Department",
    education: "Ph.D. in Biochemistry",
    institution: "University Faculty",
    experience: "12+ years",
    specialties: ["AP Chemistry", "Organic Chemistry", "Biology", "Pre-Med Prep"],
    achievements: ["Medical school guidance", "Research mentor", "Lab experience"],
    image: "/placeholder.svg",
  },
  {
    name: "Prof. Ankit Gupta",
    role: "Physics & Engineering Specialist",
    education: "M.Tech in Engineering Physics",
    institution: "IIT Bombay Alumni",
    experience: "10+ years",
    specialties: ["AP Physics C", "Mechanics", "Electromagnetism", "Engineering Prep"],
    achievements: ["Industry experience", "Patent holder", "Competition coach"],
    image: "/placeholder.svg",
  },
  {
    name: "Dr. Meera Patel",
    role: "SAT & Test Prep Expert",
    education: "Ph.D. in Education",
    institution: "Stanford University",
    experience: "8+ years",
    specialties: ["SAT Math", "SAT Reading", "Test Strategies", "College Prep"],
    achievements: ["1500+ average score improvement", "College counselor", "Admissions expert"],
    image: "/placeholder.svg",
  },
  {
    name: "Prof. Vikram Singh",
    role: "Research Programs Director",
    education: "Ph.D. in Computer Science",
    institution: "IIT Kanpur Alumni",
    experience: "14+ years",
    specialties: ["Research Methodology", "Data Analysis", "Programming", "Project Mentoring"],
    achievements: ["Published researcher", "Startup founder", "Innovation mentor"],
    image: "/placeholder.svg",
  },
  {
    name: "Dr. Kavita Reddy",
    role: "Humanities & Law Coordinator",
    education: "Ph.D. in English Literature",
    institution: "University Faculty",
    experience: "11+ years",
    specialties: ["Academic Writing", "Critical Analysis", "Law Prep", "Liberal Arts"],
    achievements: ["Writing coach", "Publication editor", "Legal education expert"],
    image: "/placeholder.svg",
  },
];

export default function FacultySection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h3 className="text-3xl font-bold text-text-dark mb-4">
            Meet Our Distinguished Faculty
          </h3>
          <p className="text-lg text-text-light max-w-3xl mx-auto">
            Our team combines academic excellence from top institutions with
            practical teaching experience
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {faculty.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 group border-2 hover:border-brand-blue/20">
                <CardHeader className="text-center pb-4">
                  <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-brand-blue/20">
                    <AvatarImage src={member.image} />
                    <AvatarFallback className="bg-gradient-to-br from-brand-blue to-brand-teal text-white text-lg">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="font-medium text-brand-teal">
                    {member.role}
                  </CardDescription>
                  <Badge className="bg-brand-orange/10 text-brand-orange border-brand-orange/20 text-xs">
                    {member.experience}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-brand-blue/5 to-brand-teal/5 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-text-dark mb-1">
                        Education & Background
                      </p>
                      <p className="text-xs text-text-light">{member.education}</p>
                      <p className="text-xs text-brand-blue font-medium">{member.institution}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-dark mb-2">Specialties</p>
                      <div className="flex flex-wrap gap-1">
                        {member.specialties.slice(0, 3).map((specialty, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {member.specialties.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.specialties.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-dark mb-2">Key Achievements</p>
                      <div className="space-y-1">
                        {member.achievements.map((achievement, i) => (
                          <div key={i} className="flex items-center text-xs text-text-light">
                            <Trophy className="h-3 w-3 text-brand-orange mr-2 flex-shrink-0" />
                            {achievement}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center space-x-3 pt-2">
                    <a href="#" className="p-2 rounded-full border border-gray-200 hover:border-brand-blue hover:bg-brand-blue/10 transition-all duration-200 group" title="LinkedIn Profile">
                      <Linkedin className="h-4 w-4 text-gray-600 group-hover:text-brand-blue" />
                    </a>
                    <a href="#" className="p-2 rounded-full border border-gray-200 hover:border-brand-teal hover:bg-brand-teal/10 transition-all duration-200 group" title="Personal Website">
                      <Globe className="h-4 w-4 text-gray-600 group-hover:text-brand-teal" />
                    </a>
                    <a href="#" className="p-2 rounded-full border border-gray-200 hover:border-gray-600 hover:bg-gray-100 transition-all duration-200 group" title="Email Contact">
                      <Mail className="h-4 w-4 text-gray-600 group-hover:text-gray-800" />
                    </a>
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