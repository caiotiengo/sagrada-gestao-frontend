import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface PageSkeletonProps {
  className?: string
}

export function PageSkeleton({ className }: PageSkeletonProps) {
  return (
    <div className={cn('space-y-6 p-4 lg:p-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Content blocks */}
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  )
}
