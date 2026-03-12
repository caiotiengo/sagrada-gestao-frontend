import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface FormSkeletonProps {
  fields?: number
  className?: string
}

export function FormSkeleton({ fields = 4, className }: FormSkeletonProps) {
  return (
    <div className={cn('space-y-5', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      ))}
      <div className="flex justify-end pt-2">
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
    </div>
  )
}
