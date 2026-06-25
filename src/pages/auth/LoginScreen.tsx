import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginScreen() {
  const navigate = useNavigate()
  const { login, showToast } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      navigate('/home', { replace: true })
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Login failed', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F5FFFC]">
      {/* Header gradient */}
      <div className="relative h-48 bg-gradient-to-br from-[#10B981] via-[#06B6D4] to-[#3B82F6] rounded-b-[40px] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-2 border border-white/30">
              <span className="text-3xl font-black text-white">M</span>
            </div>
            <p className="text-white/90 text-sm font-medium">Welcome back</p>
          </motion.div>
        </div>
        <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-5 -right-5 h-28 w-28 rounded-full bg-white/10" />
      </div>

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex-1 -mt-6 bg-white rounded-t-[32px] shadow-xl px-6 pt-8 pb-6 overflow-y-auto"
      >
        <h1 className="text-2xl font-black text-[#111827] mb-1">Sign In</h1>
        <p className="text-[#64748B] text-sm mb-8">Enter your credentials to continue</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2">Password</label>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#64748B] hover:text-[#111827]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          {/* Forgot password */}
          <div className="flex justify-end">
            <Link
              to="/auth/forgot-password"
              className="text-sm font-semibold text-[#10B981] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            loading={isLoading}
            size="xl"
            className="w-full mt-2"
          >
            Sign In
            <ArrowRight className="h-5 w-5" />
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[#E5F4F1]" />
          <span className="text-xs text-[#64748B] font-medium">OR</span>
          <div className="flex-1 h-px bg-[#E5F4F1]" />
        </div>

        {/* Sign up link */}
        <div className="text-center">
          <span className="text-sm text-[#64748B]">Don't have an account? </span>
          <Link to="/auth/signup" className="text-sm font-bold text-[#10B981]">
            Create Account
          </Link>
        </div>

        {/* Demo info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 p-4 bg-[#F5FFFC] rounded-2xl border border-[#E5F4F1]"
        >
          <p className="text-xs text-[#64748B] text-center font-medium">
            🔒 Your messages are end-to-end encrypted with AES-256
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
