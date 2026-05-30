function Shimmer({ className }: { className: string }) {
  return <div className={`bg-slate-800 rounded-2xl animate-pulse ${className}`} />;
}

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-4">

        <div className="flex flex-col gap-2 py-2">
          <div className="h-10 bg-slate-800 rounded-xl animate-pulse" />
          <div className="flex gap-2">
            <div className="h-7 w-20 bg-slate-800 rounded-full animate-pulse" />
            <div className="h-7 w-16 bg-slate-800 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Shimmer className="h-48" />
          <Shimmer className="h-48" />
          <Shimmer className="h-48" />
        </div>

        <Shimmer className="h-44" />
        <Shimmer className="h-64" />
        <Shimmer className="h-48" />

      </div>
    </div>
  );
}
