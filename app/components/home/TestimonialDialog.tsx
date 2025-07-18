"use client";
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Send } from "lucide-react";

export default function TestimonialDialog({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-brand-blue">Share Your Success Story</DialogTitle>
          <DialogDescription className="text-text-light">
            Help inspire other students by sharing your experience with ACHARYA Educational Services. Your testimonial will be reviewed by our team before being featured on our website.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Your Full Name *</label>
              <Input placeholder="Enter your full name" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Achievement/Success *</label>
              <Input placeholder="e.g., Excellent SAT Score, Admission to MIT" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Subject/Program</label>
              <Input placeholder="e.g., Mathematics, SAT Prep, Chemistry" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Improvement Highlight</label>
              <Input placeholder="e.g., Score increased by 200 points" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">Your Success Story *</label>
            <Textarea placeholder="Share your experience with ACHARYA Educational Services. How did we help you achieve your goals? What made the difference in your learning journey?" className="min-h-[120px]" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">Email Address *</label>
            <Input type="email" placeholder="your.email@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">Phone Number (Optional)</label>
            <Input type="tel" placeholder="+1 (555) 123-4567" />
          </div>
          <div className="bg-brand-light-blue/20 p-4 rounded-lg">
            <p className="text-sm text-text-light">
              <strong>Note:</strong> All testimonials are subject to review and approval. We may edit for length and clarity while preserving the essence of your message. By submitting, you consent to the use of your testimonial for marketing purposes.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button type="submit" className="flex-1 bg-gradient-to-r from-brand-blue to-brand-teal hover:from-brand-blue/90 hover:to-brand-teal/90">
              <Send className="mr-2 h-4 w-4" />
              Submit Testimonial
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 