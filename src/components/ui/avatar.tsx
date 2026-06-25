import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn, generateInitials, getAvatarColor } from '@/lib/utils'
import { motion } from 'framer-motion'

const AvatarRoot = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn('relative flex shrink-0 overflow-hidden rounded-full', className)}
    {...props}
  />
))
AvatarRoot.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full text-white font-semibold',
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

interface UserAvatarProps {
  src?: string | null
  name: string
  userId?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  isOnline?: boolean
  showRing?: boolean
  className?: string
  animate?: boolean
}

const sizeConfig = {
  xs: { container: 'h-7 w-7', text: 'text-xs', status: 'h-2 w-2', ring: 'p-0.5' },
  sm: { container: 'h-9 w-9', text: 'text-sm', status: 'h-2.5 w-2.5', ring: 'p-0.5' },
  md: { container: 'h-11 w-11', text: 'text-base', status: 'h-3 w-3', ring: 'p-0.5' },
  lg: { container: 'h-14 w-14', text: 'text-lg', status: 'h-3.5 w-3.5', ring: 'p-0.5' },
  xl: { container: 'h-18 w-18', text: 'text-xl', status: 'h-4 w-4', ring: 'p-[3px]' },
  '2xl': { container: 'h-24 w-24', text: 'text-2xl', status: 'h-5 w-5', ring: 'p-1' },
}

export function UserAvatar({
  src,
  name,
  userId = '',
  size = 'md',
  isOnline,
  showRing,
  className,
  animate = false,
}: UserAvatarProps) {
  const config = sizeConfig[size]
  const bgColor = getAvatarColor(userId || name)
  const initials = generateInitials(name)

  const avatarContent = (
    <div className={cn('relative inline-flex', className)}>
      {showRing ? (
        <div className={cn(
          'rounded-full bg-gradient-to-br from-[#10B981] via-[#06B6D4] to-[#3B82F6]',
          config.ring
        )}>
          <AvatarRoot className={cn(config.container, 'ring-2 ring-white')}>
            <AvatarImage src={src || undefined} alt={name} />
            <AvatarFallback style={{ backgroundColor: bgColor }}>
              <span className={cn(config.text, 'font-bold')}>{initials}</span>
            </AvatarFallback>
          </AvatarRoot>
        </div>
      ) : (
        <AvatarRoot className={cn(config.container)}>
          <AvatarImage src={src || undefined} alt={name} />
          <AvatarFallback style={{ backgroundColor: bgColor }}>
            <span className={cn(config.text, 'font-bold')}>{initials}</span>
          </AvatarFallback>
        </AvatarRoot>
      )}
      
      {isOnline !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white',
            config.status,
            isOnline
              ? 'bg-gradient-to-r from-[#10B981] to-[#06B6D4]'
              : 'bg-[#64748B]'
          )}
        />
      )}
    </div>
  )

  if (animate) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {avatarContent}
      </motion.div>
    )
  }

  return avatarContent
}

export { AvatarRoot, AvatarImage, AvatarFallback }
