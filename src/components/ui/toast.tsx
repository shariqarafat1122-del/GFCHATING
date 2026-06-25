import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

const toastConfig = {
  success: {
    icon: CheckCircle,
    className: 'bg-[#22C55E] text-white',
    iconClass: 'text-white',
  },
  error: {
    icon: XCircle,
    className: 'bg-[#EF4444] text-white',
    iconClass: 'text-white',
  },
  info: {
    icon: Info,
    className: 'bg-[#10B981] text-white',
    iconClass: 'text-white',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-[#F59E0B] text-white',
    iconClass: 'text-white',
  },
}

export function Toast() {
  const { toast, hideToast } = useUIStore()

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(hideToast, 4000)
      return () => clearTimeout(timer)
    }
  }, [toast, hideToast])

  const config = toast ? toastConfig[toast.type] : null

  return (
    <AnimatePresence>
      {toast && config && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'fixed top-4 right-4 z-[100] flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl min-w-[280px] max-w-[380px]',
            config.className
          )}
        >
          <config.icon className={cn('h-5 w-5 flex-shrink-0', config.iconClass)} />
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          <button
            onClick={hideToast}
            className="flex-shrink-0 opacity-80 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
