export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} border-2 border-surface-700 border-t-primary-500 rounded-full animate-spin`} />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-4 space-y-3 animate-fade-in">
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-4 w-1/2" />
      <div className="skeleton h-3 w-1/4" />
    </div>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-surface-700 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-surface-500 text-sm animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
