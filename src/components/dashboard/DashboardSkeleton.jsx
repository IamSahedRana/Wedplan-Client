import { Skeleton } from "@/components/ui/skeleton";

/** Shown while a dashboard layout resolves the session. */
export function DashboardSkeleton() {
  return (
    <div className="container-page flex min-h-[calc(100vh-4rem)] gap-6 py-8">
      <div className="hidden w-60 shrink-0 space-y-3 md:block">
        <Skeleton className="h-10 w-full rounded-xl" />
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
      <div className="flex-1 space-y-6">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}
