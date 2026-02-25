"use client";

import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const locations = [
  {
    slug: "california",
    title: "California (Sacramento & Bay Area)",
    description:
      "Academic tutoring, SAT coaching, math competition training, and research programs for students in Folsom, Sacramento, and the greater Bay Area.",
  },
  {
    slug: "texas",
    title: "Texas",
    description:
      "Online SAT prep, tutoring, and research mentorship for students across major Texas metros including Dallas, Houston, Austin, and San Antonio.",
  },
  {
    slug: "new-york",
    title: "New York",
    description:
      "Support for competitive students in New York preparing for SAT, AP exams, and selective college admissions.",
  },
];

export default function LocationsPage() {
  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />

      <section className="py-16 lg:py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
              🌎 US Locations
            </Badge>
            <h1 className="text-3xl lg:text-4xl font-bold theme-text-light mb-4">
              US-Based Tutoring & SAT Coaching
            </h1>
            <p className="text-lg theme-text-muted max-w-3xl mx-auto">
              ACHARYA Educational Services works with students across the United
              States through online and in-person programs, with deep experience
              in key regions like California, Texas, and New York.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {locations.map((loc) => (
              <Card
                key={loc.slug}
                className="bg-[#1a2236]/90 border border-yellow-400/20"
              >
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-5 w-5 text-yellow-400" />
                    <CardTitle className="theme-text-light">
                      {loc.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm theme-text-muted mb-4">
                    {loc.description}
                  </p>
                  <Link href="/book-session">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-[#1a2236]"
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Book Session in This Region
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <Chatbot />
    </main>
  );
}

