export default function FormSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto p-8 space-y-8 animate-pulse">
      {/* Event Details Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-6">
        {/* Image skeleton */}
        <div className="w-full h-64 bg-slate-700 rounded-xl"></div>
        
        {/* Title skeleton */}
        <div className="space-y-3">
          <div className="h-8 bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-700 rounded w-full"></div>
          <div className="h-4 bg-slate-700 rounded w-5/6"></div>
        </div>
        
        {/* Event info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 bg-slate-600 rounded"></div>
                <div className="flex-1">
                  <div className="h-3 bg-slate-600 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-slate-600 rounded w-32"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 space-y-6">
        {/* Section title */}
        <div className="h-6 bg-slate-700 rounded w-64 mb-6"></div>
        
        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-slate-700 rounded w-32"></div>
              <div className="h-10 bg-slate-700 rounded w-full"></div>
            </div>
          ))}
        </div>
        
        {/* Textarea skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-slate-700 rounded w-40"></div>
          <div className="h-24 bg-slate-700 rounded w-full"></div>
        </div>
        
        {/* Custom fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-slate-700 rounded w-36"></div>
              <div className="h-10 bg-slate-700 rounded w-full"></div>
            </div>
          ))}
        </div>
        
        {/* Submit button skeleton */}
        <div className="pt-4">
          <div className="h-12 bg-slate-700 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
}
