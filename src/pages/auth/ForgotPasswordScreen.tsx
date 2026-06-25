import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordScreen() {
  const navigate = useNavigate()
  const { forgotPassword, showToast } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await forgotPassword(data.email)
      setSent(true)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to send email', 'error')
    } finally {
      setIsLoading(false)
    }
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
        {!sent ? (
          <>
            <div className="h-14 w-14 rounded-2xl bg-[#F5FFFC] flex items-center justify-center mb-5">
              <Mail className="h-7 w-7 text-[#10B981]" />
            </div>
            <h1 className="text-2xl font-black text-[#111827] mb-1">Forgot Password?</h1>
            <p className="text-[#64748B] text-sm mb-8">
              Enter your email and we'll send you a reset link
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">Email Address</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <Button type="submit" loading={isLoading} size="xl" className="w-full">
                Send Reset Link
                <Send className="h-4 w-4 ml-1" />
              </Button>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center pt-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="h-20 w-20 rounded-full bg-gradient-to-br from-[#10B981] to-[#06B6D4] flex items-center justify-center mb-6"
            >
              <CheckCircle className="h-10 w-10 text-white" />
            </motion.div>
            <h2 className="text-2xl font-black text-[#111827] mb-2">Check your inbox!</h2>
            <p className="text-[#64748B] text-sm mb-1">We sent a reset link to</p>
            <p className="text-[#10B981] font-bold text-sm mb-8">{getValues('email')}</p>
            <p className="text-xs text-[#64748B] mb-8">
              Didn't receive it? Check your spam folder or try again in a few minutes.
            </p>
            <Button
              onClick={() => navigate('/auth/login')}
              variant="outline"
              className="w-full"
            >
              Back to Sign In
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
