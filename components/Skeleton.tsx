interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer rounded ${className}`}
      style={{ minHeight: "1rem" }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-start gap-3 mb-4">
        <Skeleton className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700" />
          <Skeleton className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700" />
        </div>
        <Skeleton className="w-20 h-6 rounded-full bg-slate-200 dark:bg-slate-700" />
      </div>
      <Skeleton className="h-4 w-full mb-2 bg-slate-200 dark:bg-slate-700" />
      <Skeleton className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700" />
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
        <Skeleton className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-slate-700" />
          <Skeleton className="h-10 w-16 bg-slate-200 dark:bg-slate-700" />
        </div>
        <Skeleton className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-white dark:bg-slate-800 shadow rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="bg-slate-50 dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-4 w-full bg-slate-200 dark:bg-slate-700"
            />
          ))}
        </div>
      </div>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="p-4 border-b border-slate-200 dark:border-slate-700"
        >
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, j) => (
              <Skeleton
                key={j}
                className="h-4 w-full bg-slate-200 dark:bg-slate-700"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
