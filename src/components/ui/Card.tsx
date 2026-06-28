import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('bg-linen border border-stone rounded-card p-6', className)}
      {...props}
    >
      {children}
    </div>
  )
)
Card.displayName = 'Card'
export default Card
