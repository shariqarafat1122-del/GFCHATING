import { Suspense, lazy } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import { FullPageLoader } from '@/components/ui/loading'
import AppLayout from '@/components/layout/AppLayout'

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const SplashScreen         = lazy(() => import('@/pages/auth/SplashScreen'))
const OnboardingScreen     = lazy(() => import('@/pages/auth/OnboardingScreen'))
const LoginScreen          = lazy(() => import('@/pages/auth/LoginScreen'))
const SignupScreen          = lazy(() => import('@/pages/auth/SignupScreen'))
const ForgotPasswordScreen = lazy(() => import('@/pages/auth/ForgotPasswordScreen'))
const VerifyEmailScreen    = lazy(() => import('@/pages/auth/VerifyEmailScreen'))

const HomeScreen   = lazy(() => import('@/pages/home/HomeScreen'))
const ChatScreen   = lazy(() => import('@/pages/chat/ChatScreen'))
const SearchScreen = lazy(() => import('@/pages/search/SearchScreen'))

// ─── Auth initializer — mounts useAuth side-effects once ─────────────────────
function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuth()           // subscribes to Supabase auth state changes
  return <>{children}</>
}

// ─── Route guard: redirects unauthenticated users to /auth/login ──────────────
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <FullPageLoader />
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />
  return <>{children}</>
}

// ─── Route guard: redirects authenticated users away from auth pages ──────────
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <FullPageLoader />
  if (isAuthenticated) return <Navigate to="/home" replace />
  return <>{children}</>
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<FullPageLoader />}>
          <Routes>
            {/* Splash — decides where to redirect after 2.5 s */}
            <Route path="/" element={<SplashScreen />} />

            {/* Public / auth routes */}
            <Route
              path="/onboarding"
              element={
                <PublicRoute>
                  <OnboardingScreen />
                </PublicRoute>
              }
            />
            <Route
              path="/auth/login"
              element={
                <PublicRoute>
                  <LoginScreen />
                </PublicRoute>
              }
            />
            <Route
              path="/auth/signup"
              element={
                <PublicRoute>
                  <SignupScreen />
                </PublicRoute>
              }
            />
            <Route
              path="/auth/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPasswordScreen />
                </PublicRoute>
              }
            />
            <Route
              path="/auth/verify-email"
              element={
                <PublicRoute>
                  <VerifyEmailScreen />
                </PublicRoute>
              }
            />

            {/* Protected routes — wrapped in AppLayout (BottomNav + Toast) */}
            <Route
              element={
                <PrivateRoute>
                  <AppLayout />
                </PrivateRoute>
              }
            >
              <Route path="/home"         element={<HomeScreen />} />
              <Route path="/search"       element={<SearchScreen />} />
              <Route path="/chat/:id"     element={<ChatScreen />} />

              {/* Stub routes — replace with real screens when ready */}
              <Route
                path="/notifications"
                element={
                  <PlaceholderScreen title="Notifications" />
                }
              />
              <Route
                path="/profile"
                element={
                  <PlaceholderScreen title="Profile" />
                }
              />

              {/* Fallback inside the protected shell */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

// ─── Temporary placeholder for screens not yet built ─────────────────────────
function PlaceholderScreen({ title }: { title: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center p-8">
      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-emerald-200">
        <svg
          className="h-7 w-7 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
      <p className="text-sm text-slate-500">Coming soon…</p>
    </div>
  )
}
