import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { MessageCircle, Users, Shield, ArrowRight, Check } from 'lucide-react'

const slides = [
  {
    icon: MessageCircle,
    gradient: 'from-[#10B981] to-[#06B6D4]',
    title: 'Real-Time Messaging',
    subtitle: 'Connect instantly with friends and family through lightning-fast messages with delivery receipts.',
    bg: '#F5FFFC',
    accent: '#10B981',
  },
  {
    icon: Users,
    gradient: 'from-[#06B6D4] to-[#3B82F6]',
    title: 'Rich Media Sharing',
    subtitle: 'Share photos, videos, voice notes, documents and locations in beautiful galleries.',
    bg: '#F0FEFF',
    accent: '#06B6D4',
  },
  {
    icon: Shield,
    gradient: 'from-[#3B82F6] to-[#10B981]',
    title: 'Privacy First',
    subtitle: 'End-to-end encrypted messages with advanced privacy controls only you command.',
    bg: '#EFF6FF',
    accent: '#3B82F6',
  },
]

export default function OnboardingScreen() {
  const [current, setCurrent] = useState(0)
  const navigate = useNavigate()

  const handleNext = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1)
    } else {
      navigate('/auth/login')
    }
  }

  const slide = slides[current]
  const Icon = slide.icon

  return (
    <div className="fixed inset-0 flex flex-col" style={{ backgroundColor: slide.bg }}>
      {/* Skip button */}
      <div className="flex justify-end p-6 pt-safe-top">
        <button
          onClick={() => navigate('/auth/login')}
          className="text-sm text-[#64748B] font-medium px-4 py-2 rounded-xl hover:bg-black/5 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col items-center text-center"
          >
            {/* Illustration */}
            <motion.div
              className={`relative h-48 w-48 rounded-3xl bg-gradient-to-br ${slide.gradient} flex items-center justify-center mb-10 shadow-2xl`}
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 2, -2, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Icon className="h-24 w-24 text-white" strokeWidth={1.5} />
              
              {/* Decorative elements */}
              <motion.div
                className="absolute -top-3 -right-3 h-10 w-10 rounded-2xl bg-white shadow-lg flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                <Check className="h-5 w-5" style={{ color: slide.accent }} />
              </motion.div>
              <motion.div
                className="absolute -bottom-2 -left-3 h-8 w-8 rounded-xl bg-white/90 shadow-lg"
                animate={{ scale: [1, 0.8, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </motion.div>

            <h2 className="text-3xl font-black text-[#111827] leading-tight mb-4">
              {slide.title}
            </h2>
            <p className="text-[#64748B] text-base leading-relaxed max-w-xs">
              {slide.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom section */}
      <div className="px-8 pb-safe-bottom pb-10">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all duration-300"
              animate={{
                width: i === current ? 24 : 8,
                height: 8,
                backgroundColor: i === current ? slide.accent : '#E5F4F1',
              }}
            />
          ))}
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleNext}
          size="xl"
          className="w-full"
        >
          {current < slides.length - 1 ? 'Continue' : 'Get Started'}
          <ArrowRight className="h-5 w-5 ml-1" />
        </Button>

        {/* Login link */}
        <div className="mt-4 text-center">
          <span className="text-sm text-[#64748B]">Already have an account? </span>
          <button
            onClick={() => navigate('/auth/login')}
            className="text-sm font-semibold text-[#10B981]"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  )
}
