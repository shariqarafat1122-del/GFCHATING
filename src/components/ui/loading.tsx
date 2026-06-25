import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LoadingDotsProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingDots({ className, size = 'md' }: LoadingDotsProps) {
  const sizeClasses = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-3 w-3',
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn(
            'rounded-full bg-gradient-to-r from-[#10B981] to-[#06B6D4]',
            sizeClasses[size]
          )}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <motion.div
      className={cn('rounded-2xl bg-[#E5F4F1]', className)}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

export function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="space-y-1 text-right">
        <Skeleton className="h-3 w-10 ml-auto" />
      </div>
    </div>
  )
}

export function MessageSkeleton({ isOwn = false }: { isOwn?: boolean }) {
  return (
    <div className={cn('flex gap-2 px-4 py-2', isOwn && 'flex-row-reverse')}>
      {!isOwn && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
      <div className={cn('space-y-1', isOwn ? 'items-end' : 'items-start', 'flex flex-col')}>
        <Skeleton className={cn('h-10 rounded-2xl', isOwn ? 'w-40' : 'w-56')} />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  )
}

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-t-transparent',
        'border-[#10B981]',
        sizeClasses[size],
        className
      )}
    />
  )
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F5FFFC]">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#10B981] via-[#06B6D4] to-[#3B82F6] flex items-center justify-center shadow-xl shadow-emerald-500/30"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-2xl font-bold text-white">M</span>
        </motion.div>
        <LoadingDots size="md" />
      </div>
    </div>
  )
}
