import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User, AtSign, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'

const signupSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(50),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username too long')
    .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type SignupForm = z.infer<typeof signupSchema>

export default function SignupScreen() {
  const navigate = useNavigate()
  const { register: authRegister, showToast } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  })

  const handleNextStep = async () => {
    const valid = await trigger(['displayName', 'username'])
    if (valid) setStep(2)
  }

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true)
    try {
      await authRegister(data.email, data.password, data.username, data.displayName)
      showToast('Account created! Please verify your email.', 'success')
      navigate('/auth/verify-email', { state: { email: data.email } })
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Registration failed', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F5FFFC]">
      {/* Header */}
      <div className="relative h-48 bg-gradient-to-br from-[#10B981] via-[#06B6D4] to-[#3B82F6] rounded-b-[40px] overflow-hidden">
        <button
          onClick={() => step === 1 ? navigate('/auth/login') : setStep(1)}
          className="absolute top-safe-top top-4 left-4 h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 mt-6"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div className="text-center">
            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-2 border border-white/30">
              <span className="text-3xl font-black text-white">M</span>
            </div>
            <p className="text-white/90 text-sm font-medium">Create account</p>
          </motion.div>
        </div>

        {/* Step indicator */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? 'w-8 bg-white' : 'w-4 bg-white/40'
              }`}
            />
          ))}
        </div>

        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10" />
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 -mt-6 bg-white rounded-t-[32px] shadow-xl px-6 pt-8 pb-6 overflow-y-auto"
      >
        <h1 className="text-2xl font-black text-[#111827] mb-1">
          {step === 1 ? 'Who are you?' : 'Secure your account'}
        </h1>
        <p className="text-[#64748B] text-sm mb-8">
          {step === 1 ? 'Step 1 of 2 — Your identity' : 'Step 2 of 2 — Credentials'}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">Display Name</label>
                <Input
                  placeholder="Your full name"
                  leftIcon={<User className="h-4 w-4" />}
                  error={errors.displayName?.message}
                  {...register('displayName')}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">Username</label>
                <Input
                  placeholder="username (lowercase)"
                  leftIcon={<AtSign className="h-4 w-4" />}
                  error={errors.username?.message}
                  {...register('username')}
                />
                <p className="mt-1.5 text-xs text-[#64748B]">Only letters, numbers, and underscores</p>
              </div>

              <Button type="button" onClick={handleNextStep} size="xl" className="w-full mt-2">
                Continue
                <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
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
                  placeholder="Create a strong password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="Repeat your password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>

              <Button type="submit" loading={isLoading} size="xl" className="w-full mt-2">
                Create Account
                <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </form>

        <div className="mt-6 text-center">
          <span className="text-sm text-[#64748B]">Already have an account? </span>
          <Link to="/auth/login" className="text-sm font-bold text-[#10B981]">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
