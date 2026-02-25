import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardLoadingSkeletonProps = {
  role: "student" | "teacher";
  tab?: string;
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

function TeacherTabSkeleton({ tab }: { tab: string }) {
  switch (tab) {
    case "assignments":
      return (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="rounded-xl border bg-white p-4 space-y-3" key={`teacher-assignments-${index}`}>
              <div className="flex items-center justify-between">
                <ShimmerSkeleton className="h-5 w-1/3" />
                <ShimmerSkeleton className="h-6 w-20 rounded-full" />
              </div>
              <ShimmerSkeleton className="h-4 w-full" />
              <ShimmerSkeleton className="h-4 w-5/6" />
              <div className="grid grid-cols-3 gap-3">
                <ShimmerSkeleton className="h-12 w-full rounded-lg" />
                <ShimmerSkeleton className="h-12 w-full rounded-lg" />
                <ShimmerSkeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      );
    case "submissions":
      return (
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="rounded-xl border bg-white p-4 space-y-3" key={`teacher-submissions-${index}`}>
              <ShimmerSkeleton className="h-5 w-1/2" />
              <ShimmerSkeleton className="h-4 w-1/3" />
              <ShimmerSkeleton className="h-20 w-full rounded-lg" />
              <div className="flex justify-end">
                <ShimmerSkeleton className="h-9 w-28 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      );
    case "resources":
      return (
        <div className="space-y-5">
          <div className="rounded-xl border bg-white p-4 space-y-3">
            <ShimmerSkeleton className="h-5 w-52" />
            <ShimmerSkeleton className="h-10 w-full rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <ShimmerSkeleton className="h-10 w-full rounded-lg" />
              <ShimmerSkeleton className="h-10 w-full rounded-lg" />
              <ShimmerSkeleton className="h-10 w-full rounded-lg" />
            </div>
            <ShimmerSkeleton className="h-10 w-36 rounded-lg" />
          </div>
          {Array.from({ length: 2 }).map((_, index) => (
            <div className="rounded-xl border bg-white p-4 space-y-3" key={`teacher-resource-list-${index}`}>
              <ShimmerSkeleton className="h-5 w-1/2" />
              <ShimmerSkeleton className="h-4 w-full" />
              <ShimmerSkeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      );
    case "progress":
      return (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="rounded-xl border bg-white p-4 space-y-3" key={`teacher-progress-${index}`}>
              <div className="flex items-center justify-between">
                <ShimmerSkeleton className="h-5 w-1/3" />
                <ShimmerSkeleton className="h-6 w-24 rounded-full" />
              </div>
              <ShimmerSkeleton className="h-4 w-1/2" />
              <ShimmerSkeleton className="h-4 w-full" />
              <ShimmerSkeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      );
    case "schedule":
      return (
        <div className="space-y-5">
          <div className="flex gap-2">
            <ShimmerSkeleton className="h-9 w-52 rounded-lg" />
            <ShimmerSkeleton className="h-9 w-32 rounded-lg" />
          </div>
          <div className="rounded-xl border bg-white p-4">
            <ShimmerSkeleton className="h-8 w-48" />
            <ShimmerSkeleton className="mt-4 h-[500px] w-full rounded-lg" />
          </div>
        </div>
      );
    case "students":
    default:
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="rounded-xl border bg-white p-4" key={`teacher-students-metric-${index}`}>
                <ShimmerSkeleton className="h-4 w-24" />
                <ShimmerSkeleton className="mt-3 h-7 w-16" />
              </div>
            ))}
          </div>
          <div className="rounded-xl border bg-white p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div className="flex items-center gap-3" key={`teacher-students-row-${index}`}>
                <ShimmerSkeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <ShimmerSkeleton className="h-4 w-1/3" />
                  <ShimmerSkeleton className="h-3 w-1/2" />
                </div>
                <ShimmerSkeleton className="h-8 w-20 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      );
  }
}

function StudentTabSkeleton({ tab }: { tab: string }) {
  switch (tab) {
    case "assignments":
      return (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="rounded-xl border bg-white p-4 space-y-3" key={`student-assignments-${index}`}>
              <div className="flex items-center justify-between">
                <ShimmerSkeleton className="h-5 w-1/2" />
                <ShimmerSkeleton className="h-6 w-20 rounded-full" />
              </div>
              <ShimmerSkeleton className="h-4 w-full" />
              <ShimmerSkeleton className="h-4 w-4/5" />
              <div className="flex justify-end">
                <ShimmerSkeleton className="h-9 w-32 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      );
    case "submissions":
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="rounded-xl border bg-white p-4 space-y-3" key={`student-submissions-${index}`}>
              <ShimmerSkeleton className="h-5 w-1/2" />
              <ShimmerSkeleton className="h-4 w-1/3" />
              <ShimmerSkeleton className="h-16 w-full rounded-lg" />
            </div>
          ))}
        </div>
      );
    case "grades":
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="rounded-xl border bg-white p-4" key={`student-grades-stat-${index}`}>
                <ShimmerSkeleton className="h-4 w-24" />
                <ShimmerSkeleton className="mt-3 h-7 w-20" />
              </div>
            ))}
          </div>
          <div className="rounded-xl border bg-white p-4">
            <ShimmerSkeleton className="h-5 w-40" />
            <ShimmerSkeleton className="mt-4 h-56 w-full rounded-lg" />
          </div>
        </div>
      );
    case "schedule":
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border bg-white p-4 space-y-3">
              <ShimmerSkeleton className="h-5 w-32" />
              {Array.from({ length: 3 }).map((_, index) => (
                <ShimmerSkeleton className="h-14 w-full rounded-lg" key={`student-schedule-upcoming-${index}`} />
              ))}
            </div>
            <div className="rounded-xl border bg-white p-4 lg:col-span-2">
              <ShimmerSkeleton className="h-5 w-48" />
              <ShimmerSkeleton className="mt-4 h-[420px] w-full rounded-lg" />
            </div>
          </div>
        </div>
      );
    case "progress":
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="rounded-xl border bg-white p-4 space-y-2" key={`student-progress-${index}`}>
              <ShimmerSkeleton className="h-5 w-1/3" />
              <ShimmerSkeleton className="h-4 w-full" />
              <ShimmerSkeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      );
    case "resources":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="rounded-xl border bg-white p-4 space-y-3" key={`student-resources-${index}`}>
              <ShimmerSkeleton className="h-5 w-2/3" />
              <ShimmerSkeleton className="h-4 w-full" />
              <ShimmerSkeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      );
    case "messages":
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border bg-white p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="flex items-center gap-3" key={`student-messages-mentor-${index}`}>
                <ShimmerSkeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <ShimmerSkeleton className="h-4 w-2/3" />
                  <ShimmerSkeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border bg-white p-4 space-y-3 lg:col-span-2">
            <ShimmerSkeleton className="h-5 w-1/3" />
            <ShimmerSkeleton className="h-[280px] w-full rounded-lg" />
            <ShimmerSkeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      );
    case "overview":
    default:
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="rounded-xl border bg-white p-4" key={`student-overview-stat-${index}`}>
                <ShimmerSkeleton className="h-4 w-20" />
                <ShimmerSkeleton className="mt-3 h-7 w-16" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-white p-4 space-y-3">
              <ShimmerSkeleton className="h-5 w-36" />
              <ShimmerSkeleton className="h-24 w-full rounded-lg" />
            </div>
            <div className="rounded-xl border bg-white p-4 space-y-3">
              <ShimmerSkeleton className="h-5 w-40" />
              {Array.from({ length: 3 }).map((_, index) => (
                <ShimmerSkeleton className="h-10 w-full rounded-lg" key={`student-overview-row-${index}`} />
              ))}
            </div>
          </div>
        </div>
      );
  }
}

export default function DashboardLoadingSkeleton({ role, tab, className }: DashboardLoadingSkeletonProps) {
  const menuCount = role === "teacher" ? 6 : 8;
  const normalizedTab =
    role === "teacher"
      ? tab || "students"
      : tab || "overview";

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
          {role === "teacher" ? (
            <TeacherTabSkeleton tab={normalizedTab} />
          ) : (
            <StudentTabSkeleton tab={normalizedTab} />
          )}
        </main>
      </div>
    </div>
  );
}
