import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value?: number
  max?: number
  percent?: number
  className?: string
  showLabel?: boolean
}

export default function ProgressBar({ value = 0, max, percent, className, showLabel }: ProgressBarProps) {
  const pct = percent !== undefined ? percent : max ? Math.min((value / max) * 100, 100) : 0
  const color = pct >= 100 ? 'bg-moss' : pct >= 50 ? 'bg-wheat' : 'bg-rust'

  return (
    <div className={cn('w-full', className)}>
      <div className="h-1.5 bg-stone rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', color)}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-bark mt-0.5 block">{Math.round(pct)}%</span>
      )}
    </div>
  )
}
