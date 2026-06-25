import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-[#10B981] via-[#06B6D4] to-[#3B82F6] text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]',
        destructive:
          'bg-[#EF4444] text-white shadow-sm hover:bg-red-600 active:scale-[0.98]',
        outline:
          'border border-[#E5F4F1] bg-white text-[#111827] shadow-sm hover:bg-[#F5FFFC] hover:border-[#10B981] active:scale-[0.98]',
        secondary:
          'bg-[#F5FFFC] text-[#10B981] hover:bg-emerald-50 active:scale-[0.98]',
        ghost:
          'text-[#64748B] hover:bg-[#F5FFFC] hover:text-[#111827] active:scale-[0.98]',
        link: 'text-[#10B981] underline-offset-4 hover:underline',
        glass:
          'bg-white/30 backdrop-blur-md border border-white/40 text-white shadow-lg hover:bg-white/40 active:scale-[0.98]',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 rounded-xl px-4 text-xs',
        lg: 'h-13 rounded-2xl px-8 text-base',
        xl: 'h-14 rounded-2xl px-10 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8 rounded-xl',
        'icon-lg': 'h-12 w-12 rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {children}
          </span>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
