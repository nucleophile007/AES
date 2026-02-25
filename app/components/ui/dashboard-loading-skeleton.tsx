import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardLoadingSkeletonProps = {
  role: "student" | "teacher";
  className?: string;
};

export function ShimmerSkeleton({ className }: { className?: string }) {
  return (
    <div className="relative overflow-hidden rounded-md">
      <Skeleton className={cn("h-full w-full", className)} />
      <div className="pointer-events-none absolute inset-0 animate-shimmer opacity-70" />
    </div>
  );
}

export default function DashboardLoadingSkeleton({ role, className }: DashboardLoadingSkeletonProps) {
  const menuCount = role === "teacher" ? 6 : 8;
  const cardCount = role === "teacher" ? 6 : 8;
  const rowCount = role === "teacher" ? 5 : 6;

  return (
    <div
      className={cn(
        "flex min-h-screen w-full",
        role === "teacher"
          ? "bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50"
          : "bg-slate-50",
        className
      )}
    >
      <aside className="hidden w-72 shrink-0 border-r bg-white p-4 md:flex md:flex-col">
        <div className="mb-6 flex items-center gap-3">
          <ShimmerSkeleton className="h-11 w-11 rounded-full" />
          <div className="space-y-2 flex-1">
            <ShimmerSkeleton className="h-4 w-32" />
            <ShimmerSkeleton className="h-3 w-24" />
          </div>
        </div>

        <div className="space-y-3">
          {Array.from({ length: menuCount }).map((_, index) => (
            <div className="flex items-center gap-3" key={`menu-${index}`}>
              <ShimmerSkeleton className="h-8 w-8 rounded-md" />
              <ShimmerSkeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex h-16 items-center gap-3 border-b bg-white/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/60 md:px-6">
          <ShimmerSkeleton className="h-8 w-8 rounded-md" />
          <ShimmerSkeleton className="h-5 w-44" />
          <div className="ml-auto hidden md:block">
            <ShimmerSkeleton className="h-9 w-64 rounded-lg" />
          </div>
        </header>

        <main className="space-y-6 p-4 md:p-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="rounded-xl border bg-white p-4" key={`metric-${index}`}>
                <ShimmerSkeleton className="h-4 w-20" />
                <ShimmerSkeleton className="mt-3 h-7 w-16" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: cardCount }).map((_, index) => (
              <div className="space-y-3" key={`card-${index}`}>
                <ShimmerSkeleton className="aspect-video w-full rounded-xl" />
                <div className="flex gap-3">
                  <ShimmerSkeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <ShimmerSkeleton className="h-4 w-[90%]" />
                    <ShimmerSkeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border bg-white p-4">
            <ShimmerSkeleton className="h-5 w-40" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: rowCount }).map((_, index) => (
                <div className="flex items-center gap-3" key={`row-${index}`}>
                  <ShimmerSkeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <ShimmerSkeleton className="h-4 w-3/4" />
                    <ShimmerSkeleton className="h-3 w-1/2" />
                  </div>
                  <ShimmerSkeleton className="h-8 w-20 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
