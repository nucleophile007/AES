"use client";
import React from "react";

interface YearSelectorProps {
  years: number[];
  selectedYear: number | null;
  onYearSelect: (year: number) => void;
}

export default function YearSelector({ years, selectedYear, onYearSelect }: YearSelectorProps) {
  if (years.length === 0) return null;

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-semibold text-white mb-4">Select Year</h3>
      <div className="flex flex-wrap justify-center gap-3">
        {years.map((year, index) => {
          const isSelected = year === selectedYear;
          
          return (
            <button
              type="button"
              key={year}
              onClick={() => onYearSelect(year)}
              className={`
                relative px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300
                ${isSelected 
                  ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-slate-900 shadow-lg shadow-yellow-400/50' 
                  : 'bg-slate-800/50 text-slate-300 border border-slate-700 hover:border-yellow-400/50 hover:text-white'
                }
              `}
            >
              <span className="relative z-10">{year}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
