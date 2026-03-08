"use client";
import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";

interface Blog {
  id: number;
  publicationYear: number;
  publicationMonth: number;
}

interface MonthTabsProps {
  selectedYear: number;
  selectedMonth: number | null;
  onMonthSelect: (month: number | null) => void;
  blogs: Blog[];
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function MonthTabs({ selectedYear, selectedMonth, onMonthSelect, blogs }: MonthTabsProps) {
  // Calculate blog counts per month for the selected year
  const monthCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    blogs.forEach(blog => {
      if (blog.publicationYear === selectedYear) {
        counts[blog.publicationMonth] = (counts[blog.publicationMonth] || 0) + 1;
      }
    });
    return counts;
  }, [blogs, selectedYear]);

  const totalBlogs = Object.values(monthCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-semibold text-white mb-4">Select Month</h3>
      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-2 min-w-max px-4 justify-center">
          {/* All Months Button */}
          <button
            onClick={() => onMonthSelect(null)}
            className={`
              relative px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 whitespace-nowrap
              ${selectedMonth === null
                ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-lg border-2 border-yellow-400/40'
                : 'bg-slate-800/50 text-slate-300 border border-slate-700 hover:border-yellow-400/50 hover:text-white'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <span>All Months</span>
              {totalBlogs > 0 && (
                <Badge className="bg-yellow-400/20 text-yellow-400 border-0 text-xs">
                  {totalBlogs}
                </Badge>
              )}
            </div>
          </button>

          {/* Individual Month Buttons */}
          {MONTH_NAMES.map((monthName, index) => {
            const monthNumber = index + 1;
            const blogCount = monthCounts[monthNumber] || 0;
            const isSelected = selectedMonth === monthNumber;
            const hasBlogs = blogCount > 0;

            return (
              <button
                key={monthName}
                onClick={() => hasBlogs && onMonthSelect(monthNumber)}
                disabled={!hasBlogs}
                className={`
                  relative px-5 py-3 rounded-lg font-semibold text-sm transition-all duration-300 whitespace-nowrap
                  ${isSelected
                    ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-lg border-2 border-yellow-400/40'
                    : hasBlogs
                      ? 'bg-slate-800/50 text-slate-300 border border-slate-700 hover:border-yellow-400/50 hover:text-white'
                      : 'bg-slate-900/50 text-slate-600 border border-slate-800 cursor-not-allowed opacity-40'
                  }
                `}
              >
                <div className="relative z-10 flex items-center gap-2">
                  <span>{monthName}</span>
                  {blogCount > 0 && (
                    <Badge 
                      className="border-0 text-xs bg-yellow-400/20 text-yellow-400"
                    >
                      {blogCount}
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
