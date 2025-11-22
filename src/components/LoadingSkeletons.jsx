// Skeleton loader for board cards
export const BoardCardSkeleton = () => (
  <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 animate-pulse">
    <div className="flex items-start gap-3 mb-4">
      <div className="h-12 w-12 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
      <div className="flex-1 min-w-0">
        <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4 mb-2" />
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-16" />
      <div className="flex -space-x-2">
        <div className="h-6 w-6 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-6 w-6 rounded-full bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  </div>
);

// Skeleton loader for dashboard
export const DashboardSkeleton = () => (
  <div className="max-w-7xl mx-auto p-8">
    <div className="mb-8">
      <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-48 mb-2 animate-pulse" />
      <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-96 animate-pulse" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <BoardCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// Skeleton loader for kanban board
export const KanbanSkeleton = () => (
  <div className="flex gap-4 p-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex-1 min-w-[300px]">
        <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-lg mb-4 animate-pulse" />
        <div className="space-y-3">
          {[...Array(3)].map((_, j) => (
            <div
              key={j}
              className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 animate-pulse"
            >
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4 mb-2" />
              <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-full mb-3" />
              <div className="flex items-center justify-between">
                <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-12" />
                <div className="h-6 w-6 rounded-full bg-neutral-200 dark:bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Skeleton loader for flow view
export const FlowSkeleton = () => (
  <div className="flex items-center justify-center h-full p-8">
    <div className="flex gap-8 items-start">
      {/* Input node skeleton */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 w-[320px] animate-pulse">
        <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-32 mb-4" />
        <div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg mb-4" />
        <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
      </div>

      {/* Idea nodes skeleton */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 w-[320px] animate-pulse"
        >
          <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4 mb-3" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full mb-2" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6 mb-4" />
          <div className="flex gap-2">
            <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded flex-1" />
            <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded flex-1" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Generic loading spinner
export const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizeClasses[size]}`}
      />
    </div>
  );
};

// Full page loading
export const PageLoading = ({ message = "Loading..." }) => (
  <div className="h-screen w-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
    <div className="flex flex-col items-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{message}</p>
    </div>
  </div>
);
