import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightIcon, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-12 w-full rounded-2xl border border-[#E5F4F1] bg-white px-4 py-3 text-sm text-[#111827] placeholder:text-[#64748B] transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[#10B981]/30 focus:border-[#10B981]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'hover:border-[#10B981]/50',
            error && 'border-[#EF4444] focus:ring-[#EF4444]/30 focus:border-[#EF4444]',
            leftIcon && 'pl-11',
            rightIcon && 'pr-11',
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B]">
            {rightIcon}
          </div>
        )}
        {error && (
          <p className="mt-1.5 text-xs text-[#EF4444]">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
