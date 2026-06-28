import { cn } from '@/lib/utils'

interface BadgeProps {
  label: string
  variant?: 'high' | 'medium' | 'low' | 'usda' | 'ai' | 'manual'
  className?: string
}

export default function Badge({ label, variant, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        {
          'bg-moss/10 text-moss': variant === 'high',
          'bg-wheat/20 text-bark': variant === 'medium',
          'bg-rust/10 text-rust': variant === 'low',
          'bg-stone/40 text-bark': variant === 'usda' || variant === 'manual',
          'bg-clay/10 text-clay': variant === 'ai',
        },
        className
      )}
    >
      {label}
    </span>
  )
}
