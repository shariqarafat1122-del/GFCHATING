import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as ImportMeta & { env: Record<string, string> }).env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = (import.meta as ImportMeta & { env: Record<string, string> }).env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export default supabase
