'use client';

import Image from 'next/image';
import React from 'react';

interface BannerItemProps {
  title: string;
  subtitle: string;
  features: Array<{
    icon: React.ReactNode;
    text: string;
  }>;
  textColor: string;
  accentColor: string;
  image: string;
  priority?: boolean;
  objectPosition?: string;
}

export function BannerItem({
  title,
  subtitle,
  features,
  textColor,
  accentColor,
  image,
  priority = false,
  objectPosition = "object-center",
}: BannerItemProps) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-gradient-to-br from-slate-900 to-slate-950">
      {/* Background Image */}
      <Image
        src={image}
        alt={title}
        fill
        priority={priority}
        decoding="async"
        quality={85}
        className={`object-cover ${objectPosition}`}
        sizes="(max-width: 768px) 100vw, 50vw"
      />

      {/* Overlay Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

      {/* Decorative blur shapes */}
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-yellow-400/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-6">
        {/* Title Section */}
        <div>
          <h3 className={`text-3xl sm:text-4xl font-black ${textColor} leading-tight`}>
            {title}
          </h3>
          <p className="mt-2 text-lg sm:text-xl font-bold text-yellow-300">
            {subtitle}
          </p>
        </div>

        {/* Features Section */}
        <div className="flex flex-wrap gap-2">
          {features.map((feature) => (
            <div
              key={feature.text}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs sm:text-sm font-semibold text-white backdrop-blur-md"
            >
              <span className="text-yellow-300">{feature.icon}</span>
              <span>{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
