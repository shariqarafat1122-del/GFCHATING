import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { MessageCirclePlus } from 'lucide-react'

export function NewChatFAB() {
  const navigate = useNavigate()

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate('/search')}
      className="absolute bottom-20 right-4 h-14 w-14 rounded-2xl bg-gradient-to-br from-[#10B981] via-[#06B6D4] to-[#3B82F6] flex items-center justify-center shadow-xl shadow-emerald-500/30 z-10"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
    >
      <MessageCirclePlus className="h-6 w-6 text-white" />
    </motion.button>
  )
}
