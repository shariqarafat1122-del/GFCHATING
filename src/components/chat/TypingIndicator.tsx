import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'

interface TypingIndicatorProps {
  users: string[]
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!users.length) return
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', users)
        
        if (data) {
          const map: Record<string, Profile> = {}
          for (const p of data as Profile[]) {
            map[p.id] = p
          }
          setProfiles(map)
        }
      } catch {}
    }
    fetchProfiles()
  }, [users])

  if (!users.length) return null

  const names = users
    .map(id => profiles[id]?.display_name || 'Someone')
    .slice(0, 2)
    .join(', ')

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-2 px-2"
    >
      <div className="flex items-center gap-2 bg-white rounded-3xl rounded-bl-sm px-4 py-2.5 shadow-sm border border-[#E5F4F1]">
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-gradient-to-r from-[#10B981] to-[#06B6D4]"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
        <span className="text-xs text-[#64748B]">
          {names} {users.length === 1 ? 'is' : 'are'} typing...
        </span>
      </div>
    </motion.div>
  )
}
