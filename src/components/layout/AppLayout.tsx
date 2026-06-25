import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'
import { FullPageLoader } from '@/components/ui/loading'
import { Toast } from '@/components/ui/toast'
import { BottomNav } from './BottomNav'

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const { updateOnlineStatus } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth/login', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  useEffect(() => {
    if (isAuthenticated) {
      updateOnlineStatus(true)
      
      const handleVisibility = () => {
        updateOnlineStatus(!document.hidden)
      }
      
      const handleBeforeUnload = () => {
        updateOnlineStatus(false)
      }

      document.addEventListener('visibilitychange', handleVisibility)
      window.addEventListener('beforeunload', handleBeforeUnload)
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibility)
        window.removeEventListener('beforeunload', handleBeforeUnload)
        updateOnlineStatus(false)
      }
    }
  }, [isAuthenticated, updateOnlineStatus])

  if (isLoading) return <FullPageLoader />
  if (!isAuthenticated) return null

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F5FFFC] max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 overflow-hidden relative"
      >
        <Outlet />
      </motion.div>
      <BottomNav />
      <Toast />
    </div>
  )
}
