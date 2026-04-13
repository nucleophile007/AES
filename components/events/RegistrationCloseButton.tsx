"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function RegistrationCloseButton() {
  const router = useRouter();

  const handleClose = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/events");
  };

  return (
    <button
      type="button"
      onClick={handleClose}
      aria-label="Close registration"
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-400/40 bg-slate-800/60 text-slate-100 transition hover:bg-slate-700/70"
    >
      <X className="h-5 w-5" />
    </button>
  );
}
