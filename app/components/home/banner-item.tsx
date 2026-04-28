'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface BannerItemProps {
  title: string;
  tagline: string;
  features: Array<{
    icon: React.ReactNode;
    text: string;
  }>;
  textColor: string;
  accentColor: string;
  image: string;
  priority?: boolean;
  objectPosition?: string;
  href?: string;
}

export function BannerItem({
  title,
  tagline,
  features,
  textColor,
  accentColor,
  image,
  priority = false,
  objectPosition = "object-center",
  href = "#",
}: BannerItemProps) {
  const content = (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-gradient-to-br from-slate-900 to-slate-950 group transition-all duration-500 cursor-pointer">
      {/* Background Image */}
      <Image
        src={image}
        alt={title}
        fill
        priority={priority}
        decoding="sync"
        quality={85}
        className={`object-cover ${objectPosition} group-hover:scale-110 transition-transform duration-700`}
        sizes="(max-width: 768px) 100vw, 50vw"
      />

      {/* Overlay Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/85 transition-all duration-500" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent group-hover:from-black/70 transition-all duration-500" />

      {/* Decorative blur shapes */}
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-yellow-400/20 blur-3xl group-hover:bg-yellow-400/30 transition-colors duration-500" />
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl group-hover:bg-blue-400/20 transition-colors duration-500" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-6">
        {/* Title Section */}
        <div className="space-y-2">
          <h3 className={`text-3xl sm:text-4xl font-black ${textColor} leading-tight group-hover:text-yellow-200 transition-colors duration-300`}>
            {title}
          </h3>
          <p className="text-base sm:text-lg font-bold text-yellow-300 group-hover:text-yellow-200 transition-colors duration-300">
            {tagline}
          </p>
        </div>

        {/* Features Row */}
        <div className="flex flex-wrap gap-3 items-center">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 group-hover:text-yellow-200 transition-colors duration-300"
            >
              <span className="text-yellow-300 group-hover:text-yellow-100 transition-colors duration-300">
                {feature.icon}
              </span>
              <span className="text-xs font-semibold text-white/90 group-hover:text-yellow-100 transition-colors duration-300">
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return href ? (
    <Link href={href}>
      {content}
    </Link>
  ) : (
    content
  );
}
