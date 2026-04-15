"use client";

import { useState, useEffect, useCallback, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import { Search, Calendar, X, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface Research {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  author: string | null;
  createdAt: Date;
  category: string | null;
  grade: string | null;
  school: string | null;
  domain: string | null;
}

interface APIResponse {
  success: boolean;
  research: Research[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  years: number[];
  counts: {
    byCategory: {
      all: number;
      IGNITE: number;
      ELEVATE: number;
      TRANSFORM: number;
    };
    byYear: Record<string, number>;
    byDomain: Record<string, number>;
  };
}

const DOMAIN_PAGE_SIZE = 4;
const DOMAIN_ORDER = ["AI/ML", "Pre-Med/BIO/CHEM", "Engineering", "Law & Political Sciences"] as const;
type DomainPageMap = Record<string, number>;
type DomainCollapseMap = Record<string, boolean>;

export default function ResearchShowcasePage() {
  return (
    <Suspense fallback={<ResearchPageSkeleton />}>
      <ResearchShowcaseContent />
    </Suspense>
  );
}

function ResearchPageSkeleton() {
  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-yellow-400 border-r-transparent" />
          <p className="mt-4 theme-text-muted">Loading research...</p>
        </div>
      </div>
      <Footer />
      <Chatbot />
    </main>
  );
}

function ResearchShowcaseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [research, setResearch] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
  const [selectedYear, setSelectedYear] = useState(searchParams.get("year") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [totalCount, setTotalCount] = useState(0);
  const [years, setYears] = useState<number[]>([]);
  const [domainPages, setDomainPages] = useState<DomainPageMap>(() =>
    Object.fromEntries(DOMAIN_ORDER.map((domain) => [domain, 1]))
  );
  const [collapsedDomains, setCollapsedDomains] = useState<DomainCollapseMap>({});
  const [counts, setCounts] = useState({
    byCategory: { all: 0, IGNITE: 0, ELEVATE: 0, TRANSFORM: 0 },
    byYear: {} as Record<string, number>,
    byDomain: {} as Record<string, number>,
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch research data
  const fetchResearch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (selectedYear) params.set("year", selectedYear);
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      params.set("showAll", "true");

      const response = await fetch(`/api/research?${params.toString()}`);
      const data: APIResponse = await response.json();

      if (data.success) {
        setResearch(data.research);
        setTotalCount(data.totalCount);
        setYears(data.years);
        setCounts(data.counts);
      }
    } catch (error) {
      console.error("Error fetching research:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedYear, selectedCategory]);

  // Fetch data when filters change
  useEffect(() => {
    fetchResearch();
  }, [fetchResearch]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedYear) params.set("year", selectedYear);
    if (selectedCategory !== "all") params.set("category", selectedCategory);

    const newUrl = params.toString() ? `/research?${params.toString()}` : "/research";
    router.replace(newUrl, { scroll: false });
  }, [debouncedSearch, selectedYear, selectedCategory, router]);

  useEffect(() => {
    setDomainPages(Object.fromEntries(DOMAIN_ORDER.map((domain) => [domain, 1])));
  }, [debouncedSearch, selectedYear, selectedCategory]);

  // Handler functions
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year === "all" ? "" : year);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleDomainPageChange = (domain: string, page: number) => {
    setDomainPages((prev) => ({
      ...prev,
      [domain]: page,
    }));

    const section = document.getElementById(getDomainSectionId(domain));
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleDomainCollapse = (domain: string) => {
    setCollapsedDomains((prev) => ({
      ...prev,
      [domain]: !prev[domain],
    }));
  };

  // Category configurations
  const categories = [
    { id: "all", label: "All Categories", count: counts.byCategory.all, color: "" },
    { id: "IGNITE", label: "IGNITE", count: counts.byCategory.IGNITE, color: "from-orange-500 to-orange-600" },
    { id: "ELEVATE", label: "ELEVATE", count: counts.byCategory.ELEVATE, color: "from-blue-500 to-blue-600" },
    { id: "TRANSFORM", label: "TRANSFORM", count: counts.byCategory.TRANSFORM, color: "from-purple-500 to-purple-600" },
  ];

  const groupedResearch = useMemo(() => {
    const grouped = new Map<string, Research[]>();
    research.forEach((item) => {
      const domain = item.domain?.trim() || "Other";
      const list = grouped.get(domain) || [];
      list.push(item);
      grouped.set(domain, list);
    });

    const preferredOrder = [...DOMAIN_ORDER, "Other"];
    const orderedDomains = [
      ...preferredOrder.filter((domain) => grouped.has(domain) || DOMAIN_ORDER.includes(domain as typeof DOMAIN_ORDER[number])),
      ...Array.from(grouped.keys())
        .filter((domain) => !preferredOrder.includes(domain))
        .sort((a, b) => a.localeCompare(b)),
    ];

    return orderedDomains.map((domain) => ({
      domain,
      items: grouped.get(domain) || [],
    }));
  }, [research]);

  useEffect(() => {
    setCollapsedDomains((prev) => {
      const next = { ...prev };
      groupedResearch.forEach((group) => {
        if (!(group.domain in next)) {
          next[group.domain] = false;
        }
      });
      return next;
    });
  }, [groupedResearch]);

  const getDomainSectionId = (domain: string) => `domain-${domain.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden theme-bg-medium border-b border-yellow-400/10 pt-20 sm:pt-24">
  <div className="absolute inset-0 pointer-events-none">
    <svg
      className="absolute inset-0 h-full w-full text-yellow-400/15"
      viewBox="0 0 1200 420"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="contour"
          width="180"
          height="180"
          patternUnits="userSpaceOnUse"
        >
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
    <div className="flex items-center justify-between gap-10">
      <div className="max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm theme-text-muted">
            <li>
              <Link
                href="/blog"
                className="hover:underline hover:text-yellow-400 transition-colors"
              >
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
          Acharya Research Showcase
        </h1>

        <p className="mt-4 text-lg sm:text-xl theme-text-muted max-w-2xl">
          Learn from our staff and mentors about some of the best
          practices to conduct and showcase research for high school
          students!
        </p>
      </div>
    </div>
  </div>
      </section>

      {/* Search Bar */}
      <section className="py-8 theme-bg-dark border-b border-yellow-400/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-2xl mx-auto group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-yellow-400/60 group-hover:text-yellow-400 transition-colors duration-300 z-10" />
            <Input
              type="text"
              placeholder="Search research by title, author, keywords..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-12 pr-4 py-6 w-full rounded-2xl bg-slate-900/60 backdrop-blur-sm border-2 border-slate-700/50 text-slate-100 placeholder:text-slate-400 
              hover:border-yellow-400/30 hover:shadow-lg hover:shadow-yellow-400/5
              focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 focus:shadow-xl focus:shadow-yellow-400/10
              transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            />
            {/* Glow effect on focus */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/0 via-yellow-400/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10 blur-xl" />
          </div>
        </div>
      </section>

      <section className="theme-bg-dark py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 text-slate-200">
            <div className="max-w-4xl">
              <h2 className="text-2xl sm:text-3xl font-bold theme-text-light mb-4">
                How to use this research showcase
              </h2>
              <p className="theme-text-muted leading-7 mb-4">
                This page collects student research work so families can see the range of topics, writing styles, and academic outcomes our mentors support. You can browse by category, year, or domain to find examples that feel relevant to your interests. The goal is to make research feel approachable while still showing the level of rigor expected in a strong project.
              </p>
              <p className="theme-text-muted leading-7">
                If you are new to research, start by looking at the domains you care about most and the summaries that explain how each project developed. If you already know you want a deeper project, use the filters to narrow the list and compare themes, topics, and the kinds of student growth reflected in the work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-6 theme-bg-dark">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full sm:w-auto sm:min-w-[200px] mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Filter by Year
            </label>
            <Select
              value={selectedYear || "all"}
              onValueChange={handleYearChange}
              disabled={loading}
            >
              <SelectTrigger className="w-full bg-slate-800/60 border-slate-700/50 text-slate-200 focus:border-yellow-400/40 focus:ring-yellow-400/20 rounded-xl py-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-yellow-400" />
                  <SelectValue placeholder="All Years" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 rounded-xl">
                <SelectItem
                  value="all"
                  className="text-slate-200 focus:bg-slate-700 focus:text-yellow-400 cursor-pointer"
                >
                  <span className="font-semibold">All Years</span>
                </SelectItem>
                {years.map((year) => (
                  <SelectItem
                    key={year}
                    value={year.toString()}
                    className="text-slate-200 focus:bg-slate-700 focus:text-yellow-400 cursor-pointer"
                  >
                    <span className="font-semibold">{year}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedYear && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-400/30 rounded-lg"
            >
              <Calendar className="h-3.5 w-3.5 text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-400">{selectedYear}</span>
              <button
                onClick={() => handleYearChange("all")}
                className="ml-1 p-0.5 hover:bg-yellow-400/20 rounded-full transition-colors"
                aria-label="Clear year filter"
              >
                <X className="h-3.5 w-3.5 text-yellow-400" />
              </button>
            </motion.div>
          )}

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3">{categories.map((cat) => {
              const isDisabled = loading || (cat.count === 0 && cat.id !== "all");
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => !isDisabled && handleCategoryChange(cat.id)}
                  whileHover={!isDisabled ? { scale: 1.05 } : {}}
                  whileTap={!isDisabled ? { scale: 0.98 } : {}}
                  disabled={isDisabled}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    selectedCategory === cat.id
                      ? cat.id === "all"
                        ? "bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg"
                        : `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                      : "bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:border-yellow-400/40"
                  } ${isDisabled ? "opacity-40 cursor-not-allowed hover:border-slate-700/50" : ""}`}
                >
                  {cat.label}
                  <span className="ml-2 text-xs opacity-90 font-bold">
                    ({cat.count})
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Research List */}
      <section className="py-16 flex-1">
  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

    {loading ? (
      <ul className="space-y-12 relative">
        {/* Vertical line */}
        <div className="absolute left-[10px] top-2 bottom-2 w-px bg-slate-700/40" />

        {[1, 2, 3, 4].map((i) => (
          <li key={i} className="relative pl-10">
            <div className="absolute left-0 top-2 h-5 w-5 rounded-full bg-slate-700/40" />

            <div className="space-y-3">
              <Skeleton className="h-6 w-3/4 bg-slate-700/50" />
              <Skeleton className="h-4 w-full bg-slate-700/50" />
              <Skeleton className="h-4 w-5/6 bg-slate-700/50" />
            </div>
          </li>
        ))}
      </ul>
    ) : research.length === 0 ? (
      <div className="text-center py-24">
        {totalCount === 0 && !selectedYear && selectedCategory === "all" && !debouncedSearch ? (
          // Database is completely empty - no research at all
          <>
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800/60 border border-slate-700/50 mb-4">
                <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-semibold theme-text-light mb-3">
              No Research Available Yet
            </p>
            <p className="text-sm theme-text-muted max-w-md mx-auto">
              We are building our research showcase. Check back soon for exciting student research projects!
            </p>
          </>
        ) : (
          // Filtered results are empty
          <>
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800/60 border border-slate-700/50 mb-4">
                <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xl theme-text-light mb-3">
              No research found matching your filters
            </p>
            <p className="text-sm theme-text-muted mb-6">
              Try adjusting your search or filters to find more results.
            </p>
            <button
              onClick={() => {
                setSearchInput("");
                setSelectedYear("");
                setSelectedCategory("all");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/30 rounded-lg text-yellow-400 text-sm font-medium transition-colors"
            >
              Clear All Filters
            </button>
          </>
        )}
      </div>
    ) : (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-14"
      >
        {groupedResearch.map((group) => (
          <section
            key={group.domain}
            id={getDomainSectionId(group.domain)}
            className="rounded-3xl border border-slate-700/40 bg-slate-900/25 p-5 sm:p-6"
          >
            <div className="mb-6 flex flex-col gap-4 border-b border-yellow-400/20 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-yellow-400">
                  {group.domain}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-400">
                  {group.items.length} research{group.items.length === 1 ? "" : "es"}
                </p>
              </div>
              <button
                onClick={() => toggleDomainCollapse(group.domain)}
                className="inline-flex items-center gap-2 self-start rounded-full border border-slate-600/60 px-3 py-2 text-sm font-medium text-slate-200 hover:border-yellow-400/40 hover:text-yellow-300 transition-colors"
                aria-expanded={!collapsedDomains[group.domain]}
                aria-controls={`${getDomainSectionId(group.domain)}-content`}
              >
                {collapsedDomains[group.domain] ? (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Expand section
                  </>
                ) : (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Collapse section
                  </>
                )}
              </button>
            </div>

            {collapsedDomains[group.domain] ? (
              <div className="rounded-2xl border border-slate-700/40 bg-slate-950/30 px-5 py-4 text-sm text-slate-400">
                Section collapsed. Expand to browse research in {group.domain}.
              </div>
            ) : group.items.length === 0 ? (
              <div className="rounded-2xl border border-slate-700/40 bg-slate-900/30 px-6 py-8 text-slate-400 text-sm">
                No research available in this domain for the current filters.
              </div>
            ) : (
              <>
                <ul id={`${getDomainSectionId(group.domain)}-content`} className="space-y-12 relative">
                  <div className="absolute left-[10px] top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-slate-700/40 to-transparent" />

                  {group.items
                    .slice(
                      ((domainPages[group.domain] || 1) - 1) * DOMAIN_PAGE_SIZE,
                      ((domainPages[group.domain] || 1) - 1) * DOMAIN_PAGE_SIZE + DOMAIN_PAGE_SIZE
                    )
                    .map((item, index, pageItems) => (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06 }}
                        className="group relative pl-10"
                      >
                        <span className="absolute left-0 top-2 flex items-center justify-center">
                          <span className="h-4 w-4 rounded-full bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)] group-hover:scale-110 transition-transform duration-300" />
                        </span>

                        <Link href={`/research/${item.slug}`} className="block">
                          {item.category && (
                            <div className="mb-2">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-[11px] tracking-wide font-semibold backdrop-blur-sm border ${
                                  item.category === "IGNITE"
                                    ? "bg-orange-500/10 text-orange-400 border-orange-400/20"
                                    : item.category === "ELEVATE"
                                    ? "bg-blue-500/10 text-blue-400 border-blue-400/20"
                                    : item.category === "TRANSFORM"
                                    ? "bg-purple-500/10 text-purple-400 border-purple-400/20"
                                    : "bg-slate-500/10 text-slate-400 border-slate-400/20"
                                }`}
                              >
                                {item.category}
                              </span>
                            </div>
                          )}

                          <h2 className="text-xl sm:text-2xl font-semibold theme-text-light leading-snug group-hover:text-yellow-400 transition-colors duration-300">
                            {item.title}
                          </h2>

                          {item.description && (
                            <p className="mt-3 theme-text-muted max-w-3xl leading-relaxed text-[15px]">
                              {item.description}
                            </p>
                          )}

                          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm theme-text-muted">
                            {item.author && (
                              <div>
                                By{" "}
                                <span className="text-yellow-400 font-medium">
                                  {item.author}
                                </span>
                              </div>
                            )}

                            {item.grade && (
                              <div>
                                Grade{" "}
                                <span className="text-yellow-400 font-medium">
                                  {item.grade}
                                </span>
                              </div>
                            )}

                            {item.school && (
                              <div className="text-xs opacity-80">
                                {item.school}
                              </div>
                            )}
                          </div>
                        </Link>

                        {index !== pageItems.length - 1 && (
                          <div className="mt-10 border-t border-slate-700/40" />
                        )}
                      </motion.li>
                    ))}
                </ul>

                {group.items.length > DOMAIN_PAGE_SIZE && (
                  <div className="mt-8 flex items-center justify-center gap-6">
                    <button
                      disabled={(domainPages[group.domain] || 1) === 1}
                      onClick={() => handleDomainPageChange(group.domain, (domainPages[group.domain] || 1) - 1)}
                      className="px-4 py-2 rounded-full border border-yellow-400/20 bg-slate-900/40 theme-text-light hover:border-yellow-400/50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="text-sm theme-text-muted tracking-wide">
                      Page <span className="text-yellow-400 font-semibold">{domainPages[group.domain] || 1}</span> of <span className="text-yellow-400 font-semibold">{Math.max(1, Math.ceil(group.items.length / DOMAIN_PAGE_SIZE))}</span>
                    </div>

                    <button
                      disabled={(domainPages[group.domain] || 1) >= Math.max(1, Math.ceil(group.items.length / DOMAIN_PAGE_SIZE))}
                      onClick={() => handleDomainPageChange(group.domain, (domainPages[group.domain] || 1) + 1)}
                      className="px-4 py-2 rounded-full border border-yellow-400/20 bg-slate-900/40 theme-text-light hover:border-yellow-400/50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        ))}
      </motion.div>
    )}

  </div>
</section>

      <Footer />
      <Chatbot />
    </main>
  );
}