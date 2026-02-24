"use client";

import { useState, useMemo, useEffect } from "react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import { Calendar, Clock, User, ArrowRight, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 6;

const researchPosts = [
  {
    title: "Cancer Detection & Targeted Therapy",
    slug: "cancer-detection-targeted-therapy",
    excerpt:
      "A student-led deep dive into convolutional neural networks for early detection of diseases from medical imaging datasets.",
    category: "Machine Learning",
    date: "2025-02-10",
    readTime: "6 minute read",
    author: "Arshia Sompura",
    authorRole: "Research Mentor",
  },
  {
    title: "Detecting Anomalies in Smart Device Behavior Using ML",
    slug: "detecting-anomalies-in-smart-device-behavior-using-ml",
    excerpt:
      "Modeling strategic behavior with classic game theory frameworks and simulations to understand real-world competitive environments.",
    category: "Data Science",
    date: "2025-02-10",
    readTime: "8 minute read",
    author: "Arshia Sompura",
    authorRole: "Research Mentor",
  },
  {
    title: "Photodynamic(PDT) & Photothermal(PTT) Therapies with Nanoparticles",
    slug: "photodynamic-pdt-photothermal-ptt-therapies-with-nanoparticles",
    excerpt:
      "Comparing classical statistical forecasting with modern ML approaches for climate-related time series prediction.",
    category: "Biotechnology",
    date: "2024-08-23",
    readTime: "3 minute read",
    author: "Arshia Sompura",
    authorRole: "Research Mentor",
  },
  {
    title: "A Parametric Study of Human Balance with Delays using Delay Differential Equations",
    slug: "a-parametric-study-of-human-balance-with-delays-using-delay-differential-equations",
    excerpt:
      "A practical framework to find a compelling topic, narrow your question, and design a project you can actually finish.",
    category: "Applied Mathematics",
    date: "2024-07-18",
    readTime: "7 minute read",
    author: "Arshia Sompura",
    authorRole: "Research Mentor",
  },
  {
    title: "Nanotechnology and Smart Drug Delivery From prevention to treatment to regeneration",
    slug: "nanotechnology-and-smart-drug-delivery-from-prevention-to-treatment-to-regeneration",
    excerpt:
      "From choosing a venue to formatting, revisions, and submissions—what the publication process looks like in practice.",
    category: "Nanotechnology",
    date: "2024-05-02",
    readTime: "5 minute read",
    author: "Arshia Sompura",
    authorRole: "Research Mentor",
  },
  {
    title: "Evaluating Predictive Models for Heart Disease: A Comparative Study of Feature Selection and Neural Architectures",
    slug: "evaluating-predictive-models-for-heart-disease-a-comparative-study-of-feature-selection-and-neural-architectures",
    excerpt:
      "A curated set of journals and publishing options with tips to pick the right fit based on your project type.",
    category: "Healthcare AI",
    date: "2024-04-10",
    readTime: "4 minute read",
    author: "Arshia Sompura",
    authorRole: "Research Mentor",
  },
  {
    title: "Development of antibiotics: Fight Against Bacterial Resistance",
    slug: "development-of-antibiotics-fight-against-bacterial-resistance",
    excerpt: "Exploring the evolution of antibiotic development and strategies to combat increasing bacterial resistance in modern medicine.",
    category: "Microbiology",
    date: "2024-03-22",
    readTime: "6 minute read",
    author: "Arshia Sompura",
    authorRole: "Research Mentor",
  },
  {
    title: "Early detection of Diabetes Using Logistic Regression: An Analytical Approach",
    slug: "early-detection-of-diabetes-using-logistic-regression-an-analytical-approach",
    excerpt: "An analytical exploration of using logistic regression models for early diabetes detection and risk assessment.",
    category: "Medical AI",
    date: "2024-02-08",
    readTime: "5 minute read",
    author: "Arshia Sompura",
    authorRole: "Research Mentor",
  },
];

function formatDate(isoDate: string) {
  try {
    const date = new Date(isoDate);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  } catch {
    return isoDate;
  }
}

export default function ResearchShowcasePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Extract unique years from posts
  const availableYears = useMemo(() => {
    const years = researchPosts.map(post => new Date(post.date).getFullYear());
    return ["all", ...Array.from(new Set(years)).sort((a, b) => b - a)];
  }, []);

  // Filter posts based on search and year
  const filteredPosts = useMemo(() => {
    return researchPosts.filter(post => {
      const matchesSearch = searchQuery === "" || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase());

      const postYear = new Date(post.date).getFullYear().toString();
      const matchesYear = selectedYear === "all" || postYear === selectedYear;

      return matchesSearch && matchesYear;
    });
  }, [searchQuery, selectedYear]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (page - 1) * PAGE_SIZE;
  const visiblePosts = filteredPosts.slice(startIndex, startIndex + PAGE_SIZE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedYear]);

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />

      {/* Hero (Polygence-style) */}
      <section className="relative overflow-hidden theme-bg-medium border-b border-yellow-400/10 pt-20 sm:pt-24">
        <div className="absolute inset-0 pointer-events-none">
          <svg
            className="absolute inset-0 h-full w-full text-yellow-400/15"
            viewBox="0 0 1200 420"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <pattern id="contour" width="180" height="180" patternUnits="userSpaceOnUse">
                <path
                  d="M0 90 C 45 60, 90 60, 180 90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M0 120 C 45 90, 90 90, 180 120"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  opacity="0.7"
                />
                <path
                  d="M0 60 C 45 30, 90 30, 180 60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  opacity="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#contour)" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16 relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className="max-w-3xl">
              <nav aria-label="Breadcrumb" className="mb-4">
                <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm theme-text-muted">
                  <li>
                    <Link href="/blog" className="hover:underline hover:text-yellow-400 transition-colors">
                      Acharya Blog
                    </Link>
                  </li>
                  <li className="opacity-60">/</li>
                  <li className="text-yellow-400 font-semibold">
                    Research Showcase
                  </li>
                </ol>
              </nav>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-yellow-400 tracking-tight leading-tight drop-shadow-sm">
                AES EXPLORERS 
                <br className="hidden sm:block" />
                Research Showcase
              </h1>

              <p className="mt-4 text-lg sm:text-xl theme-text-muted max-w-2xl">
                Learn from our staff and mentors about some of the best practices to conduct and showcase research for high school students!
              </p>
            </div>

            {/* Right-side illustration */}
            <div className="relative w-full lg:w-[360px] flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute -inset-6 rounded-full bg-yellow-400/5 blur-2xl" />
                <div className="relative">
                  <Calendar className="h-48 w-48 sm:h-56 sm:w-56 text-yellow-400" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="theme-bg-dark py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search articles by title, category, author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base bg-slate-800/50 border-slate-700/50 focus:border-yellow-400/40"
              />
            </div>

            {/* Year Filters */}
            <div className="flex gap-2 items-center shrink-0">
              <Filter className="h-5 w-5 text-gray-400" />
              <div className="flex gap-2 flex-wrap">
                {availableYears.map((year) => (
                  <Button
                    key={year}
                    variant={selectedYear === year.toString() ? "default" : "outline"}
                    onClick={() => setSelectedYear(year.toString())}
                    className="capitalize"
                  >
                    {year === "all" ? "All Years" : year}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-gray-400 mt-4">
            Showing {filteredPosts.length} {filteredPosts.length === 1 ? "article" : "articles"}
            {searchQuery && ` matching "${searchQuery}"`}
            {selectedYear !== "all" && ` from ${selectedYear}`}
          </p>
        </div>
      </section>

      {/* Articles List - Professional Horizontal Layout */}
      <section className="theme-bg-dark py-10 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {visiblePosts.map((post) => (
              <Link
                key={post.slug}
                href={`/research/${post.slug}`}
                className="group block rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-yellow-400/40 hover:bg-slate-800/70 transition-all duration-300 overflow-hidden"
              >
                <div className="p-6 sm:p-8">
                  {/* Header: Category and Read Time */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-2 text-sm theme-text-muted">
                      <Clock className="h-4 w-4" />
                      {post.readTime}
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl sm:text-2xl font-bold theme-text-light leading-tight mb-3 group-hover:text-yellow-400 transition-colors">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="theme-text-muted text-base leading-relaxed mb-5">
                    {post.excerpt}
                  </p>

                  {/* Footer: Author, Date, and Read Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-4">
                      {/* Author Info */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400/20 to-amber-500/20 border border-yellow-400/30">
                          <User className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold theme-text-light">
                            {post.author}
                          </div>
                          <div className="text-xs theme-text-muted">
                            {post.authorRole}
                          </div>
                        </div>
                      </div>
                      {/* Date */}
                      <div className="hidden sm:flex items-center gap-2 text-sm theme-text-muted">
                        <Calendar className="h-4 w-4 text-yellow-400/80" />
                        {formatDate(post.date)}
                      </div>
                    </div>
                    
                    {/* Read Article Button */}
                    <div className="flex items-center gap-4">
                      {/* Date for mobile */}
                      <div className="flex sm:hidden items-center gap-2 text-sm theme-text-muted">
                        <Calendar className="h-4 w-4 text-yellow-400/80" />
                        {formatDate(post.date)}
                      </div>
                      {/* Button */}
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 hover:border-yellow-400/50 font-semibold text-sm transition-all duration-200 group-hover:gap-3">
                        Read Article
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Empty State */}
            {visiblePosts.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-400/10 mb-4">
                  <Search className="h-8 w-8 text-yellow-400/60" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No articles found</h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedYear("all");
                  }}
                  className="border-yellow-400/30 hover:border-yellow-400/50 text-yellow-400"
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && filteredPosts.length > 0 && (
            <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-6">
              {page > 1 ? (
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(page - 1)}
                  className="border-yellow-400/20 hover:border-yellow-400/40"
                >
                  Previous
                </Button>
              ) : (
                <Button
                  variant="outline"
                  disabled
                  className="opacity-50 cursor-not-allowed"
                >
                  Previous
                </Button>
              )}

              <div className="text-sm theme-text-muted">
                Page <span className="text-yellow-400 font-semibold">{page}</span> of{" "}
                <span className="text-yellow-400 font-semibold">{totalPages}</span>
              </div>

              {page < totalPages ? (
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(page + 1)}
                  className="border-yellow-400/20 hover:border-yellow-400/40"
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="outline"
                  disabled
                  className="opacity-50 cursor-not-allowed"
                >
                  Next
                </Button>
              )}
            </nav>
          )}
        </div>
      </section>

      <Footer />
      <Chatbot />
    </main>
  );
}
