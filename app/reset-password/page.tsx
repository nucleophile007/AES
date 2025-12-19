"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Password strength calculator (same as activation page)
function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 12) {
    score += 25;
  } else {
    feedback.push("Use at least 12 characters");
  }

  if (/[a-z]/.test(password)) {
    score += 15;
  } else {
    feedback.push("Add lowercase letters");
  }

  if (/[A-Z]/.test(password)) {
    score += 15;
  } else {
    feedback.push("Add uppercase letters");
  }

  if (/[0-9]/.test(password)) {
    score += 15;
  } else {
    feedback.push("Add numbers");
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 20;
  } else {
    feedback.push("Add special characters (!@#$%^&*)");
  }

  if (password.length >= 16) score += 10;

  let label = "Weak";
  let color = "bg-red-500";

  if (score >= 80) {
    label = "Strong";
    color = "bg-green-500";
  } else if (score >= 60) {
    label = "Good";
    color = "bg-yellow-500";
  } else if (score >= 40) {
    label = "Fair";
    color = "bg-orange-500";
  }

  return { score, label, color, feedback };
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<
    ReturnType<typeof calculatePasswordStrength> | null
  >(null);

  // Calculate password strength on change (same as activation)
  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password));
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("This reset link is missing a token.");
      return;
    }

    // Validate password strength (same threshold as activation page)
    if (!passwordStrength || passwordStrength.score < 80) {
      toast.error("Please create a stronger password.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.success === false) {
        toast.error(data?.error || "Reset failed. Please try again.");
        return;
      }

      toast.success("Password updated. Redirecting to home...");

      // Auto-redirect to home
      window.setTimeout(() => {
        window.location.href = "/";
      }, 900);
    } catch (err) {
      toast.error("Reset failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-yellow-400/20 bg-gradient-to-br from-[#1a2236] to-[#0f1419] p-6">
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
          Reset Password
        </h1>
        <p className="mt-2 text-center text-yellow-400/70">
          Choose a new password for your account.
        </p>

        <form onSubmit={onSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label className="text-yellow-400/90 font-medium">New password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-yellow-400/20 text-white placeholder:text-yellow-400/50 focus:border-yellow-400/40 focus:ring-yellow-400/20"
                required
              />

              {/* Password Strength Indicator (same UI as activation page) */}
              {passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-yellow-400/70">
                      Password Strength:
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        passwordStrength.score >= 80
                          ? "text-green-400"
                          : passwordStrength.score >= 60
                            ? "text-yellow-300"
                            : passwordStrength.score >= 40
                              ? "text-orange-400"
                              : "text-red-400"
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`${passwordStrength.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${passwordStrength.score}%` }}
                    />
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <div className="mt-2 flex items-start gap-2 text-xs text-yellow-400/70">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <ul className="list-disc list-inside">
                        {passwordStrength.feedback.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-yellow-400/90 font-medium">Confirm new password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-white/5 border-yellow-400/20 text-white placeholder:text-yellow-400/50 focus:border-yellow-400/40 focus:ring-yellow-400/20"
                required
              />

              {password && confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={
                submitting ||
                !passwordStrength ||
                passwordStrength.score < 80 ||
                password !== confirmPassword
              }
              className="w-full bg-gradient-to-r from-yellow-400/90 via-amber-500/90 to-orange-500/90 hover:from-yellow-400 hover:via-amber-500 hover:to-orange-500 text-[#1a2236] font-bold disabled:opacity-50"
            >
              {submitting ? "Updating..." : "Update password"}
            </Button>
          </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#1a2236] via-[#1a2236] to-[#1d2741] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-yellow-400/70">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
