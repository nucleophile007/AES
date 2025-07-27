"use client";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Presentation, FileText, Lightbulb, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const blogCategories = [
  {
    icon: Presentation,
    title: "Student Presentations",
    description: "Showcasing outstanding student projects and presentations from our research programs",
    count: "24",
    color: "from-blue-500 to-blue-600",
    posts: [
      { title: "AI in Healthcare: A Student's Research Journey", author: "Sarah Chen", date: "Dec 15, 2024", category: "Research Project" },
      { title: "Mathematical Modeling of Climate Change", author: "Alex Rodriguez", date: "Dec 10, 2024", category: "STEM Presentation" },
      { title: "Social Media Impact on Teen Mental Health", author: "Maya Patel", date: "Dec 5, 2024", category: "Social Sciences" },
    ],
  },
  {
    icon: FileText,
    title: "Research Papers",
    description: "Published research and academic papers by our students and faculty members",
    count: "18",
    color: "from-green-500 to-green-600",
    posts: [
      { title: "Quantum Computing Applications in Cryptography", author: "Dr. Rajesh Acharya", date: "Dec 12, 2024", category: "Faculty Research" },
      { title: "Novel Approaches to AP Calculus Teaching", author: "Prof. Ankit Gupta", date: "Nov 28, 2024", category: "Educational Research" },
      { title: "Machine Learning in Educational Assessment", author: "Student Research Team", date: "Nov 20, 2024", category: "Collaborative Study" },
    ],
  },
  {
    icon: Lightbulb,
    title: "Founder Thoughts",
    description: "Educational insights, philosophies, and thought leadership from our founding team",
    count: "32",
    color: "from-orange-500 to-orange-600",
    posts: [
      { title: "The Future of Personalized Learning", author: "Dr. Rajesh Acharya", date: "Dec 18, 2024", category: "Educational Philosophy" },
      { title: "Why Every Student Learns Differently", author: "Founder Team", date: "Dec 8, 2024", category: "Teaching Methodology" },
      { title: "Building Confidence in STEM Education", author: "Dr. Priya Sharma", date: "Dec 1, 2024", category: "Student Development" },
    ],
  },
];

export default function BlogSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-brand-light-blue/20 to-white">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-brand-blue/10 text-brand-blue">AES Blog</Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">Student Presentations, Research & Insights</h2>
          <p className="text-xl text-text-light max-w-3xl mx-auto">Explore student achievements, research publications, and educational insights from our founder and faculty</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {blogCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs">{category.count} posts</Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-brand-blue transition-colors">{category.title}</CardTitle>
                  <CardDescription className="text-sm">{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-text-dark">Recent Posts:</h4>
                    <div className="space-y-3">
                      {category.posts.map((post, i) => (
                        <motion.div
                          key={i}
                          className="border-l-2 border-brand-blue/20 pl-3 hover:border-brand-blue/40 transition-colors cursor-pointer"
                          whileHover={{ x: 5 }}
                        >
                          <h5 className="text-sm font-medium text-text-dark hover:text-brand-blue transition-colors line-clamp-2">{post.title}</h5>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-text-light">{post.author}</span>
                            <span className="text-xs text-text-light">{post.date}</span>
                          </div>
                          <Badge variant="outline" className="text-xs mt-1">{post.category}</Badge>
                        </motion.div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                      View All Posts <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-lg border-2 border-brand-blue/10"
        >
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <Badge className="mb-4 bg-brand-green/10 text-brand-green">Featured Article</Badge>
              <h3 className="text-2xl font-bold text-text-dark mb-4">&quot;The Evolution of Educational Technology: Lessons from a Decade of Teaching&quot;</h3>
              <p className="text-text-light mb-6">A comprehensive analysis of how educational technology has transformed learning outcomes, featuring insights from our 15+ years of experience in personalized education and research-driven teaching methodologies.</p>
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-br from-brand-blue to-brand-teal text-white">RA</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-text-dark">Dr. Rajesh Acharya</p>
                  <p className="text-sm text-text-light">Founder & Lead Educator</p>
                </div>
                <div className="text-sm text-text-light">Published Dec 20, 2024</div>
              </div>
            </div>
            <div className="text-center lg:text-right">
              <Button size="lg" className="bg-gradient-to-r from-brand-blue to-brand-teal hover:from-brand-blue/90 hover:to-brand-teal/90">
                Read Full Article
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm text-text-light mt-3">15 min read • Educational Technology</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 