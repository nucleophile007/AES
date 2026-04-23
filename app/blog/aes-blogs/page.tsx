"use client";
import React, { useMemo, useState } from "react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import useSWR from "swr";
import { AlertCircle, Search } from "lucide-react";

interface Student {
  id: number;
  name: string;
  grade: string | null;
  schoolName: string | null;
}

interface Blog {
  id: number;
  title: string;
  abstract: string;
  externalUrl: string;
  studentId: number | null;
  studentPhoto: string | null;
  publicationYear: number;
  publicationMonth: number;
  Student: Student | null;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const fallbackImages = [
  "/program-image/acharyaes-academic.png",
  "/program-image/acharyaes-research-1.png",
  "/program-image/acharyaes-college.png",
  "/program-image/acharyaes-math-1.png",
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AESBlogsPage() {
  const { data, error, isLoading } = useSWR("/api/blogs", fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: true,
    dedupingInterval: 60000,
  });

  const blogs: Blog[] = useMemo(() => data?.blogs || [], [data]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const mentorBlogs = useMemo(() => {
    const likelyMentor = blogs.filter((blog) => blog.studentId === null);
    const fallback = blogs.filter((blog) => blog.studentId !== null);
    return [...likelyMentor, ...fallback].slice(0, 3);
  }, [blogs]);

  const studentBlogsBase = useMemo(() => {
    const mentorIds = new Set(mentorBlogs.map((blog) => blog.id));
    const studentOnly = blogs.filter((blog) => blog.studentId !== null && !mentorIds.has(blog.id));
    if (studentOnly.length > 0) return studentOnly;
    return blogs.filter((blog) => !mentorIds.has(blog.id));
  }, [blogs, mentorBlogs]);

  const monthCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    studentBlogsBase.forEach((blog) => {
      counts[blog.publicationMonth] = (counts[blog.publicationMonth] || 0) + 1;
    });
    return counts;
  }, [studentBlogsBase]);

  const filteredStudentBlogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return studentBlogsBase.filter((blog) => {
      const monthMatch = selectedMonth === null || blog.publicationMonth === selectedMonth;

      if (!query) return monthMatch;

      const haystack = [
        blog.title,
        blog.abstract,
        blog.Student?.name,
        blog.Student?.schoolName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return monthMatch && haystack.includes(query);
    });
  }, [searchQuery, selectedMonth, studentBlogsBase]);

  const formatDate = (blog: Blog) => `${MONTH_NAMES[blog.publicationMonth - 1]} ${blog.publicationYear}`;

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />

      <section className="relative overflow-hidden theme-bg-medium border-b border-yellow-400/10 pt-20 sm:pt-24">
        <div className="absolute inset-0 pointer-events-none">
          <svg
            className="absolute inset-0 h-full w-full text-yellow-400/15"
            viewBox="0 0 1200 420"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <pattern id="mentor-blogs-contour" width="180" height="180" patternUnits="userSpaceOnUse">
                <path d="M0 90 C 45 60, 90 60, 180 90" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M0 120 C 45 90, 90 90, 180 120" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.7" />
                <path d="M0 60 C 45 30, 90 30, 180 60" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mentor-blogs-contour)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl py-10 sm:py-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-yellow-400 tracking-tight leading-tight drop-shadow-sm">
              AES Blogs
            </h1>
            <h2 className="mt-4 text-2xl sm:text-3xl font-semibold text-slate-100 tracking-tight">
              What our mentors have to say
            </h2>
            <p className="mt-4 text-lg sm:text-xl theme-text-muted max-w-2xl">
              Practical mentor insights for students on research, academics, and profile-building.
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-5 md:grid-cols-3 pb-10">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-80 rounded-3xl bg-slate-800/60 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-3 [perspective:1200px] pb-10">
              {mentorBlogs.map((blog, idx) => (
                <a
                  key={blog.id}
                  href={blog.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-3xl border border-slate-700/50 bg-slate-900/70 overflow-hidden shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:rotate-x-1 hover:rotate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.55)] [transform-style:preserve-3d]"
                >
                  <div className="relative h-48">
                    <img
                      src={blog.studentPhoto || fallbackImages[idx % fallbackImages.length]}
                      alt={blog.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  </div>
                  <div className="p-5 space-y-3">
                    <p className="text-xs uppercase tracking-[0.14em] text-cyan-300 font-semibold">Mentor Blogs</p>
                    <h2 className="text-2xl font-semibold text-slate-100 leading-tight line-clamp-3">{blog.title}</h2>
                    <p className="text-slate-300 text-sm line-clamp-3">{blog.abstract}</p>
                    <p className="text-slate-400 text-sm">{formatDate(blog)}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="pt-2 space-y-5 mb-8">
            <h3 className="text-2xl sm:text-3xl font-semibold text-slate-100">Looking for something specific?</h3>

            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student blogs"
                className="w-full rounded-full bg-slate-800/70 border border-slate-700/70 text-slate-100 placeholder:text-slate-400 pl-11 pr-4 py-3 outline-none focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20 transition"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedMonth(null)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedMonth === null ? "bg-cyan-400 text-slate-900" : "bg-slate-800/70 text-slate-300 hover:bg-slate-700"}`}
              >
                All Months
              </button>
              {MONTH_NAMES.map((name, idx) => {
                const month = idx + 1;
                const count = monthCounts[month] || 0;
                if (!count) return null;

                return (
                  <button
                    key={month}
                    type="button"
                    onClick={() => setSelectedMonth(month)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedMonth === month ? "bg-cyan-400 text-slate-900" : "bg-slate-800/70 text-slate-300 hover:bg-slate-700"}`}
                  >
                    {name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          <h2 className="text-3xl font-semibold text-slate-100 mb-6">Student Blogs</h2>

          {error ? (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-8 text-center">
              <AlertCircle className="h-10 w-10 mx-auto text-red-300 mb-3" />
              <p className="text-red-100">Could not load blogs right now.</p>
            </div>
          ) : filteredStudentBlogs.length === 0 ? (
            <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-8 text-center text-slate-300">
              No student blogs found for this filter.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 [perspective:1200px]">
              {filteredStudentBlogs.map((blog, idx) => (
                <a
                  key={blog.id}
                  href={blog.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-3xl border border-slate-700/50 bg-slate-900/70 overflow-hidden shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:rotate-x-1 hover:rotate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.55)] [transform-style:preserve-3d]"
                >
                  <div className="relative h-52">
                    <img
                      src={blog.studentPhoto || fallbackImages[idx % fallbackImages.length]}
                      alt={blog.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.12em]">
                      <span className="text-cyan-300 font-semibold">Student Blogs</span>
                      <span className="text-slate-400 normal-case tracking-normal">{formatDate(blog)}</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-100 leading-tight line-clamp-3">{blog.title}</h3>
                    <p className="text-slate-300 text-sm line-clamp-3">{blog.abstract}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <Chatbot />
    </main>
  );
}
