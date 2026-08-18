import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CardSkeleton({ circle = false }: { circle?: boolean }) {
  return (
    <div className="w-[150px] shrink-0 sm:w-[176px]">
      <Skeleton className={cn("aspect-square w-full", circle ? "rounded-full" : "rounded-2xl")} />
      <Skeleton className="mt-3 h-3.5 w-4/5 rounded-full" />
      <Skeleton className="mt-2 h-3 w-3/5 rounded-full" />
    </div>
  );
}

export function RowSkeleton({ circle = false, count = 6 }: { circle?: boolean; count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden px-1">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} circle={circle} />
      ))}
    </div>
  );
}

export function SongListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl p-2">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3 rounded-full" />
            <Skeleton className="h-3 w-1/5 rounded-full" />
          </div>
          <Skeleton className="h-3 w-10 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function DetailHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
      <Skeleton className="h-44 w-44 rounded-2xl sm:h-56 sm:w-56" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="h-8 w-2/3 rounded-full" />
        <Skeleton className="h-3 w-1/3 rounded-full" />
      </div>
    </div>
  );
}
