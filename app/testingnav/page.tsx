"use client";
import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "@/components/ui/navbar-menu";
import { cn } from "@/lib/utils";

function NavbarDemo() {
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Navigation Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Hover over menu items to see dropdowns. Click on menu items to navigate to different sections.
          </p>
        </div>
        <Navbar className="top-2" />
        <div className="mt-16 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Scroll down to explore more content
          </p>
        </div>
      </div>
    </div>
  );
}

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
    >
      <Menu setActive={setActive}>
        <MenuItem setActive={setActive} active={null} item="Home" href="/#home" className="text-foreground hover:text-brand-blue transition-colors">
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Programs" href="/#program">
          <div className="  text-sm grid grid-cols-2 gap-10 p-4">
            <ProductItem
              title="Algochurn"
              href="/academictutoring"
              src="https://assets.aceternity.com/demos/algochurn.webp"
              description="Prepare for tech interviews like never before."
            />
            <ProductItem
              title="Tailwind Master Kit"
              href="/collegeprep"
              src="https://assets.aceternity.com/demos/tailwindmasterkit.webp"
              description="Production ready Tailwind css components for your next project"
            />
            <ProductItem
              title="Moonbeam"
              href="/mathcompetition"
              src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.51.31%E2%80%AFPM.png"
              description="Never write from scratch again. Go from idea to blog in minutes."
            />
            <ProductItem
              title="Rogue"
              href="/researchprogram"
              src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.47.07%E2%80%AFPM.png"
              description="Respond to government RFPs, RFIs and RFQs 10x faster using AI"
            />
            <ProductItem
              title="Rogue"
              href="/satcoaching"
              src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.47.07%E2%80%AFPM.png"
              description="Respond to government RFPs, RFIs and RFQs 10x faster using AI"
            />
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={null} item="Mentors" href="/#mentors" className="text-foreground hover:text-brand-blue transition-colors">
        </MenuItem>
        <MenuItem setActive={setActive} active={null} item="Success Stories" href="/#success" className="text-foreground hover:text-brand-blue transition-colors">
        </MenuItem>
        <MenuItem setActive={setActive} active={null} item="About" href="/#about" className="text-foreground hover:text-brand-blue transition-colors">
        </MenuItem>
        <MenuItem setActive={setActive} active={null} item="Contact" href="/#contact" className="text-foreground hover:text-brand-blue transition-colors">
        </MenuItem>
      </Menu>
    </div>
  );
}

export default function TestingNavPage() {
  return <NavbarDemo />;
}
