"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

interface LoginModalProps {
  children: React.ReactNode;
}

export function LoginModal({ children }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Successfully logged in
        setOpen(false);
        setEmail("");
        setPassword("");
        
        // Redirect to the appropriate dashboard
        window.location.href = data.redirectTo;
      } else {
        // Show error message
        alert(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-[#1a2236] to-[#0f1419] border border-yellow-400/20 backdrop-blur-xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
            Welcome Back
          </DialogTitle>
          <DialogDescription className="text-center text-yellow-400/70">
            Sign in to your ACHARYA account to continue
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-yellow-400/90 font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-yellow-400/60" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-white/5 border-yellow-400/20 text-white placeholder:text-yellow-400/50 focus:border-yellow-400/40 focus:ring-yellow-400/20"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-yellow-400/90 font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-yellow-400/60" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-white/5 border-yellow-400/20 text-white placeholder:text-yellow-400/50 focus:border-yellow-400/40 focus:ring-yellow-400/20"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-400/60 hover:text-yellow-400/80 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                className="rounded border-yellow-400/20 text-yellow-400 focus:ring-yellow-400/20 bg-white/5"
              />
              <span className="text-yellow-400/70">Remember me</span>
            </label>
            <button
              type="button"
              className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-yellow-400/90 via-amber-500/90 to-orange-500/90 hover:from-yellow-400 hover:via-amber-500 hover:to-orange-500 text-[#1a2236] font-bold shadow-lg hover:shadow-xl hover:shadow-yellow-400/20 transition-all duration-300 transform hover:scale-[1.02] backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-[#1a2236]/30 border-t-[#1a2236] rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-yellow-400/70 text-sm">
            Don&apos;t have an account?{" "}
            <button className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors">
              Sign up
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
