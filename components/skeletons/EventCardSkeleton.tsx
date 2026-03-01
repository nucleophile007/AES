export default function EventCardSkeleton() {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden flex flex-col animate-pulse">
      {/* Image skeleton */}
      <div className="relative h-48 bg-slate-700"></div>
      
      {/* Content skeleton */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Title skeleton */}
        <div className="h-6 bg-slate-700 rounded mb-3 w-3/4"></div>
        
        {/* Description skeleton */}
        <div className="space-y-2 mb-4 flex-1">
          <div className="h-4 bg-slate-700 rounded w-full"></div>
          <div className="h-4 bg-slate-700 rounded w-5/6"></div>
          <div className="h-4 bg-slate-700 rounded w-4/6"></div>
        </div>
        
        {/* Event details skeleton */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-700 rounded w-32"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-700 rounded w-24"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-700 rounded w-40"></div>
          </div>
        </div>
        
        {/* Button skeleton */}
        <div className="h-10 bg-slate-700 rounded w-full"></div>
      </div>
    </div>
  );
}
