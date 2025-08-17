"use client";
import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "@/components/ui/navbar-menu";
import { cn } from "@/lib/utils";

export function NavbarDemo() {
  return (
    <div className="relative w-full flex items-center justify-center">
      <Navbar />
    </div>
  );
}

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div className={cn("relative", className)}>
      <Menu setActive={setActive}>
        <MenuItem setActive={setActive} active={null} item="Home" href="/#home" className="text-yellow-400/90 hover:text-yellow-300 transition-colors font-medium">
        </MenuItem>
        <MenuItem setActive={setActive} active={null} item="About" href="/about" className="text-yellow-400/90 hover:text-yellow-300 transition-colors font-medium">
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Programs" className="text-yellow-400/90 hover:text-yellow-300 transition-colors font-medium">
          <div className="text-sm grid grid-cols-1 gap-4 p-6 min-w-[300px] bg-gradient-to-br from-[#1a2236]/90 to-[#1a2236]/95">
            <ProductItem
              title="Academic Tutoring"
              href="/academictutoring"
              src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=140&h=70&fit=crop"
              description="Personalized tutoring across all subjects."
            />
            <ProductItem
              title="College Prep"
              href="/collegeprep"
              src="https://images.unsplash.com/photo-1464983953574-0892a716854b?w=140&h=70&fit=crop"
              description="SAT, ACT, and college application guidance."
            />
            <ProductItem
              title="SAT Coaching"
              href="/satcoaching"
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=140&h=70&fit=crop"
              description="Comprehensive SAT preparation and strategies."
            />
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Profile Enrichment" className="text-yellow-400/90 hover:text-yellow-300 transition-colors font-medium">
          <div className="text-sm grid grid-cols-1 gap-4 p-6 min-w-[300px] bg-gradient-to-br from-[#1a2236]/90 to-[#1a2236]/95">
            <ProductItem
              title="AES Explorers"
              href="/aes-explorers"
              src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=140&h=70&fit=crop"
              description="Research-based mentorship with Ph.D. experts."
            />
            <ProductItem
              title="AES Champions"
              href="/aes-champions"
              src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=140&h=70&fit=crop"
              description="Olympiad excellence and competition preparation."
            />
            <ProductItem
              title="AES Creatorverse"
              href="/aes-creatorverse"
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=140&h=70&fit=crop"
              description="Creative profile building and digital presence."
            />

          </div>
        </MenuItem>

        <MenuItem setActive={setActive} active={null} item="Testimonials" href="/#animatedtestimonials" className="text-yellow-400/90 hover:text-yellow-300 transition-colors font-medium">
        </MenuItem>
        <MenuItem setActive={setActive} active={null} item="Blog" href="/blog" className="text-yellow-400/90 hover:text-yellow-300 transition-colors font-medium">
        </MenuItem>
        <MenuItem setActive={setActive} active={null} item="Contact" href="/#cta" className="text-yellow-400/90 hover:text-yellow-300 transition-colors font-medium">
        </MenuItem>
      </Menu>
    </div>
  );
}

export default function TestingNavPage() {
  return <NavbarDemo />;
}
