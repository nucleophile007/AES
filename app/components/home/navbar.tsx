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
        <MenuItem setActive={setActive} active={null} item="Home" href="/#home" className="text-foreground hover:text-brand-blue transition-colors font-medium">
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Programs" href="/#programs" className="text-foreground hover:text-brand-blue transition-colors font-medium">
          <div className="text-sm grid grid-cols-2 gap-6 p-4 min-w-[400px]">
            <ProductItem
              title="Academic Tutoring"
              href="/academictutoring"
              src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=140&h=70&fit=crop"
              description="Personalized tutoring across all subjects."
            />
            <ProductItem
              title="College Prep"
              href="/collegeprep"
              src="https://images.unsplash.com/photo-1523050854058-8df90110c9a1?w=140&h=70&fit=crop"
              description="SAT, ACT, and college application guidance."
            />
            <ProductItem
              title="Math Competition"
              href="/mathcompetition"
              src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=140&h=70&fit=crop"
              description="Competition math and advanced problem solving."
            />
            <ProductItem
              title="Research Programs"
              href="/researchprogram"
              src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=140&h=70&fit=crop"
              description="Scientific research and project development."
            />
            <ProductItem
              title="SAT Coaching"
              href="/satcoaching"
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=140&h=70&fit=crop"
              description="Comprehensive SAT preparation and strategies."
            />
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={null} item="Mentors" href="/#mentors" className="text-foreground hover:text-brand-blue transition-colors font-medium">
        </MenuItem>
        <MenuItem setActive={setActive} active={null} item="Success Stories" href="/#success" className="text-foreground hover:text-brand-blue transition-colors font-medium">
        </MenuItem>
        <MenuItem setActive={setActive} active={null} item="About" href="/#about" className="text-foreground hover:text-brand-blue transition-colors font-medium">
        </MenuItem>
        <MenuItem setActive={setActive} active={null} item="Contact" href="/#contact" className="text-foreground hover:text-brand-blue transition-colors font-medium">
        </MenuItem>
      </Menu>
    </div>
  );
}

export default function TestingNavPage() {
  return <NavbarDemo />;
}
