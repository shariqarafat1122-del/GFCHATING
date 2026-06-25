import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export default function VerifyEmailScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyOTP, showToast } = useAuth()
  const email = (location.state as { email?: string })?.email || ''
  
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when complete
    if (value && index === 5) {
      const code = [...newOtp.slice(0, 5), value].join('')
      if (code.length === 6) handleVerify(code)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (code?: string) => {
    const finalCode = code || otp.join('')
    if (finalCode.length !== 6) {
      showToast('Please enter the 6-digit code', 'error')
      return
    }
    
    setIsLoading(true)
    try {
      await verifyOTP(email, finalCode)
      showToast('Email verified successfully!', 'success')
      navigate('/home', { replace: true })
    } catch {
      showToast('Invalid or expired code. Try again.', 'error')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = () => {
    setCooldown(60)
    showToast('Verification code sent!', 'success')
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F5FFFC]">
      <div className="relative h-48 bg-gradient-to-br from-[#10B981] via-[#06B6D4] to-[#3B82F6] rounded-b-[40px] overflow-hidden">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-14 left-4 h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 -mt-6 bg-white rounded-t-[32px] shadow-xl px-6 pt-8"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#06B6D4] flex items-center justify-center mb-5"
        >
          <Mail className="h-8 w-8 text-white" />
        </motion.div>

        <h1 className="text-2xl font-black text-[#111827] mb-1">Verify Email</h1>
        <p className="text-[#64748B] text-sm mb-1">
          Enter the 6-digit code sent to
        </p>
        <p className="text-[#10B981] font-bold text-sm mb-8">{email || 'your email'}</p>

        {/* OTP Input */}
        <div className="flex gap-3 justify-center mb-8">
          {otp.map((digit, index) => (
            <motion.input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={cn(
                'h-14 w-12 rounded-2xl border-2 text-center text-xl font-bold text-[#111827] transition-all duration-150',
                'focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20',
                digit ? 'border-[#10B981] bg-[#F5FFFC]' : 'border-[#E5F4F1] bg-white'
              )}
            />
          ))}
        </div>

        <Button
          onClick={() => handleVerify()}
          loading={isLoading}
          size="xl"
          className="w-full mb-4"
        >
          Verify & Continue
        </Button>

        {/* Resend */}
        <div className="text-center">
          <span className="text-sm text-[#64748B]">Didn't receive the code? </span>
          <button
            onClick={handleResend}
            disabled={cooldown > 0}
            className={cn(
              'text-sm font-bold transition-colors inline-flex items-center gap-1',
              cooldown > 0 ? 'text-[#64748B]' : 'text-[#10B981]'
            )}
          >
            <RotateCw className="h-3 w-3" />
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
