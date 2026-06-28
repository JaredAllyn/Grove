import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full px-4 py-3 bg-sand border border-stone rounded-input text-soil placeholder-stone focus:outline-none focus:border-clay transition-colors text-sm',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'
export default Input
