import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface ListSkeletonProps {
  rows?: number
  className?: string
}

export function ListSkeleton({ rows = 5, className }: ListSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-border/50 p-3"
        >
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
      ))}
    </div>
  )
}
