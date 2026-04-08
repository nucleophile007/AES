"use client";
import React, { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { BlogGridSkeleton } from "@/components/ui/BlogSkeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MonthTabs from "./MonthTabs";
import BlogCard from "./BlogCard";
import { AlertCircle, FileText, Calendar } from "lucide-react";

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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function AESBlogsContent() {
  const { data, error, isLoading } = useSWR('/api/blogs', fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: true,
    dedupingInterval: 60000,
  });

  const blogs: Blog[] = useMemo(() => data?.blogs || [], [data]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  // Extract available years from blogs
  const availableYears = useMemo(() => {
    const years = [...new Set(blogs.map(blog => blog.publicationYear))];
    return years.sort((a, b) => b - a); // Descending order
  }, [blogs]);

  // Set default year to the latest year when data is loaded
  useEffect(() => {
    if (availableYears.length > 0 && selectedYear === "") {
      setSelectedYear(availableYears[0].toString());
    }
  }, [availableYears, selectedYear]);

  // Filter blogs based on selected year and month
  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => {
      const yearMatch = selectedYear === "" || blog.publicationYear === parseInt(selectedYear);
      const monthMatch = selectedMonth === null || blog.publicationMonth === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [blogs, selectedYear, selectedMonth]);

  // Loading state
  if (isLoading) {
    return (
      <section className="py-12 theme-bg-dark">
        <div className="max-w-7xl mx-auto px-4">
          <BlogGridSkeleton count={6} />
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-12 theme-bg-dark">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Failed to Load Blogs</h3>
            <p className="text-slate-300 mb-6">
              We couldn&apos;t load the blogs at this time. Please try again later.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Empty state - no blogs at all
  if (blogs.length === 0) {
    return (
      <section className="py-12 theme-bg-dark">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-yellow-400/30 rounded-2xl p-12 text-center">
            <FileText className="h-20 w-20 text-yellow-400 mx-auto mb-6 opacity-50" />
            <h3 className="text-3xl font-bold text-white mb-4">No Blogs Published Yet</h3>
            <p className="text-slate-300 text-lg">
              Our students are working on amazing content. Check back soon for insightful blogs and research articles!
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Empty state - no blogs for selected filters
  const noFilteredBlogs = filteredBlogs.length === 0;
  const filterText = selectedMonth !== null 
    ? `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}` 
    : `${selectedYear}`;

  return (
    <section className="py-12 theme-bg-dark">
      <div className="max-w-7xl mx-auto px-4">
        {/* Year Dropdown Filter */}
        {availableYears.length > 0 && (
          <div className="flex justify-center mb-8">
            <div className="w-full sm:w-auto sm:min-w-[200px]">
              <label className="block text-sm font-medium text-slate-300 mb-2 text-center">
                Filter by Year
              </label>
              <Select
                value={selectedYear || "all"}
                onValueChange={(value) => {
                  setSelectedYear(value === "all" ? "" : value);
                  setSelectedMonth(null); // Reset month when year changes
                }}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full bg-slate-800/60 border-slate-700/50 text-slate-200 focus:border-yellow-400/40 focus:ring-yellow-400/20 rounded-xl py-3">
                  <div className="flex items-center gap-2 justify-center">
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
                  {availableYears.map((year) => (
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
          </div>
        )}

        {selectedYear && (
          <div className="mb-12">
            <MonthTabs
              selectedYear={parseInt(selectedYear)}
              selectedMonth={selectedMonth}
              onMonthSelect={setSelectedMonth}
              blogs={blogs}
            />
          </div>
        )}

        {/* Blogs Grid */}
        {noFilteredBlogs ? (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-12 text-center">
            <FileText className="h-16 w-16 text-slate-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-white mb-2">No Blogs Found</h3>
            <p className="text-slate-400">
              No blogs were published in {filterText}. Try selecting a different time period.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBlogs.map((blog) => (
              <div key={blog.id}>
                <BlogCard blog={blog} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
