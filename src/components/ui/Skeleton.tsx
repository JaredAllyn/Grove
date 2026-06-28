import { cn } from '@/lib/utils'

export default function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-stone/40 rounded', className)} />
  )
}
