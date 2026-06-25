import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'

export default function SplashScreen() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (isAuthenticated) {
          navigate('/home', { replace: true })
        } else {
          navigate('/onboarding', { replace: true })
        }
      }
    }, 2500)
    return () => clearTimeout(timer)
  }, [isAuthenticated, isLoading, navigate])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#10B981] via-[#06B6D4] to-[#3B82F6]">
      {/* Background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/10"
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 left-1/4 h-40 w-40 rounded-full bg-white/5"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        {/* Logo */}
        <motion.div
          className="relative h-24 w-24 rounded-3xl bg-white shadow-2xl flex items-center justify-center"
          animate={{ 
            boxShadow: [
              '0 25px 50px rgba(0,0,0,0.2)',
              '0 35px 60px rgba(0,0,0,0.3)',
              '0 25px 50px rgba(0,0,0,0.2)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-4xl font-black bg-gradient-to-br from-[#10B981] via-[#06B6D4] to-[#3B82F6] bg-clip-text text-transparent">
            M
          </span>
          <motion.div
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-[#10B981] to-[#06B6D4] border-2 border-white"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>

        {/* App name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-4xl font-black text-white tracking-tight">MintWave</h1>
          <p className="mt-1 text-white/70 text-sm font-medium tracking-wider uppercase">
            Premium Messaging
          </p>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-2 mt-4"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-white"
              animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom tagline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-12 text-white/60 text-sm font-medium"
      >
        Connect. Chat. Share.
      </motion.p>
    </div>
  )
}
