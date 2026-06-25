import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import type { Profile } from '@/types/database'

export function useAuth() {
  const { user, session, profile, isLoading, isAuthenticated, setUser, setSession, setProfile, setLoading, signOut } = useAuthStore()
  const { showToast } = useUIStore()

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data as Profile
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
          const profile = await fetchProfile(currentSession.user.id)
          if (mounted && profile) setProfile(profile)
        }
      } catch (error) {
        console.error('Auth init error:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (event === 'SIGNED_IN' && session) {
        setSession(session)
        setUser(session.user)
        const profile = await fetchProfile(session.user.id)
        if (mounted && profile) setProfile(profile)
      } else if (event === 'SIGNED_OUT') {
        signOut()
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setSession(session)
      }
      
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile, setUser, setSession, setProfile, setLoading, signOut])

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const register = async (email: string, password: string, username: string, displayName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: displayName },
        emailRedirectTo: `${window.location.origin}/auth/verify`,
      },
    })
    if (error) throw error

    if (data.user) {
      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        username,
        display_name: displayName,
        privacy_settings: {
          last_seen: 'friends',
          profile_photo: 'everyone',
          about: 'everyone',
          read_receipts: true,
          typing_indicator: true,
        },
      })
      if (profileError) throw profileError
    }

    return data
  }

  const logout = async () => {
    try {
      // Update online status
      if (user) {
        await supabase
          .from('profiles')
          .update({ is_online: false, last_seen: new Date().toISOString() })
          .eq('id', user.id)
      }
      await supabase.auth.signOut()
      signOut()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const forgotPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) throw error
  }

  const resetPassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  }

  const verifyOTP = async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })
    if (error) throw error
    return data
  }

  const updateOnlineStatus = useCallback(async (isOnline: boolean) => {
    if (!user) return
    await supabase
      .from('profiles')
      .update({
        is_online: isOnline,
        last_seen: new Date().toISOString(),
      })
      .eq('id', user.id)
  }, [user])

  return {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyOTP,
    updateOnlineStatus,
    showToast,
  }
}

export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth/login', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  return { isAuthenticated, isLoading }
}
