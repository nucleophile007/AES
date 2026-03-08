"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, BookOpen } from "lucide-react";
import Image from "next/image";

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

interface BlogCardProps {
  blog: Blog;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function BlogCard({ blog }: BlogCardProps) {
  const studentName = blog.Student?.name || "AES Team";
  const studentGrade = blog.Student?.grade || null;
  const studentSchool = blog.Student?.schoolName || null;
  const studentPhoto = blog.studentPhoto;
  const publicationDate = `${MONTH_NAMES[blog.publicationMonth - 1]} ${blog.publicationYear}`;

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Box - Student Info */}
      <div className="lg:w-80 flex-shrink-0">
        <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-yellow-400/50 via-amber-500/50 to-yellow-600/50 h-full">
          <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl p-8 h-full flex flex-col items-center justify-center">
            {/* Student Photo */}
            <div className="relative mb-6">
              {studentPhoto ? (
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-400/40 shadow-2xl">
                  <Image
                    src={studentPhoto}
                    alt={studentName}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
              ) : (
                <Avatar className="w-32 h-32 border-4 border-yellow-400/40 shadow-2xl">
                  <AvatarImage src={studentPhoto || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 text-2xl font-bold">
                    {getInitials(studentName)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>

            {/* Student Details */}
            <div className="text-center space-y-2 w-full">
              <h4 className="text-2xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                {studentName}
              </h4>
              
              {studentGrade && (
                <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30 hover:bg-blue-400/30">
                  Grade {studentGrade}
                </Badge>
              )}
              
              {studentSchool && (
                <p className="text-sm text-slate-400 leading-relaxed">
                  {studentSchool}
                </p>
              )}
            </div>

            {/* Decorative bottom accent */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Right Box - Blog Content */}
      <div className="flex-1">
        <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-yellow-400/50 via-amber-500/50 to-yellow-600/50 h-full">
          <div className="bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 rounded-2xl p-8 lg:p-10 h-full">
            <div className="flex flex-col justify-between space-y-6 h-full">
              {/* Publication Date Badge */}
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-yellow-400" />
                <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/30">
                  {publicationDate}
                </Badge>
              </div>

              {/* Blog Title */}
              <h3 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
                {blog.title}
              </h3>

              {/* Abstract */}
              <p className="text-slate-300 leading-relaxed flex-1">
                {blog.abstract}
              </p>

              {/* Read Blog Button */}
              <div>
                <a
                  href={blog.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-slate-900 font-bold rounded-lg shadow-lg shadow-yellow-400/30 hover:shadow-yellow-400/50 transition-all duration-300"
                >
                  <span>Read Full Blog</span>
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
