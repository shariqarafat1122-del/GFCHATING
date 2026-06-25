import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, UserPlus, ArrowLeft, Check, Clock, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { UserAvatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/loading'
import { debounce, formatLastSeen } from '@/lib/utils'
import type { Profile, FriendRequest } from '@/types/database'

interface SearchResult {
  profile: Profile
  friendStatus: 'none' | 'pending_sent' | 'pending_received' | 'friends'
  requestId?: string
}

export default function SearchScreen() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { showToast } = useUIStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const searchUsers = useCallback(
    debounce(async (q: string) => {
      if (!q.trim() || !user) {
        setResults([])
        setHasSearched(false)
        return
      }

      setIsLoading(true)
      setHasSearched(true)

      try {
        // Search profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
          .neq('id', user.id)
          .limit(20)

        if (!profiles) return

        // Get friend requests
        const { data: requests } = await supabase
          .from('friend_requests')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .in('status', ['pending'])

        // Get friends
        const { data: friends } = await supabase
          .from('friends')
          .select('friend_id')
          .eq('user_id', user.id)

        const friendIds = new Set(friends?.map(f => f.friend_id) || [])
        const reqMap = new Map((requests || []).map(r => [
          r.sender_id === user.id ? r.receiver_id : r.sender_id,
          r
        ]))

        const enriched: SearchResult[] = (profiles as Profile[]).map(p => {
          if (friendIds.has(p.id)) {
            return { profile: p, friendStatus: 'friends' }
          }
          const req = reqMap.get(p.id) as FriendRequest | undefined
          if (req) {
            return {
              profile: p,
              friendStatus: req.sender_id === user.id ? 'pending_sent' : 'pending_received',
              requestId: req.id,
            }
          }
          return { profile: p, friendStatus: 'none' }
        })

        setResults(enriched)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsLoading(false)
      }
    }, 400),
    [user]
  )

  const handleQueryChange = (q: string) => {
    setQuery(q)
    searchUsers(q)
  }

  const sendFriendRequest = async (userId: string) => {
    if (!user) return
    try {
      await supabase.from('friend_requests').insert({
        sender_id: user.id,
        receiver_id: userId,
        status: 'pending',
      })
      setResults(prev => prev.map(r =>
        r.profile.id === userId
          ? { ...r, friendStatus: 'pending_sent' }
          : r
      ))
      showToast('Friend request sent!', 'success')
    } catch {
      showToast('Failed to send request', 'error')
    }
  }

  const cancelRequest = async (requestId: string, userId: string) => {
    try {
      await supabase.from('friend_requests').delete().eq('id', requestId)
      setResults(prev => prev.map(r =>
        r.profile.id === userId
          ? { ...r, friendStatus: 'none', requestId: undefined }
          : r
      ))
    } catch {
      showToast('Failed to cancel request', 'error')
    }
  }

  const openChat = async (otherUserId: string) => {
    if (!user) return

    try {
      // Check if conversation exists
      const { data: existing } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', user.id)

      let convId: string | null = null

      if (existing && existing.length > 0) {
        const myConvIds = existing.map(e => e.conversation_id)
        const { data: other } = await supabase
          .from('conversation_members')
          .select('conversation_id')
          .eq('user_id', otherUserId)
          .in('conversation_id', myConvIds)

        if (other && other.length > 0) {
          convId = other[0].conversation_id
        }
      }

      if (!convId) {
        // Create new conversation
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({ type: 'direct', created_by: user.id })
          .select()
          .single()

        if (newConv) {
          convId = newConv.id
          await supabase.from('conversation_members').insert([
            { conversation_id: convId, user_id: user.id, role: 'admin' },
            { conversation_id: convId, user_id: otherUserId, role: 'member' },
          ])
        }
      }

      if (convId) {
        navigate(`/chat/${convId}`)
      }
    } catch (error) {
      console.error('Error opening chat:', error)
      showToast('Failed to open chat', 'error')
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 pt-safe-top pt-12 pb-4 border-b border-[#E5F4F1]">
        <div className="flex items-center gap-3 mb-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="h-9 w-9 rounded-xl flex items-center justify-center text-[#64748B] hover:bg-[#F5FFFC]"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <h1 className="text-xl font-black text-[#111827]">Find People</h1>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search by username or name..."
            autoFocus
            className="w-full h-12 pl-10 pr-4 rounded-2xl bg-[#F5FFFC] border border-[#E5F4F1] text-sm text-[#111827] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#10B981]/30 focus:border-[#10B981]"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : !hasSearched ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-[#10B981]/10 to-[#06B6D4]/10 flex items-center justify-center mb-4">
              <Users className="h-10 w-10 text-[#10B981]" />
            </div>
            <h3 className="text-base font-bold text-[#111827] mb-2">Search for people</h3>
            <p className="text-sm text-[#64748B]">Enter a username or display name to find people</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="h-20 w-20 rounded-3xl bg-[#F5FFFC] flex items-center justify-center mb-4">
              <Search className="h-10 w-10 text-[#64748B]" />
            </div>
            <h3 className="text-base font-bold text-[#111827] mb-2">No results found</h3>
            <p className="text-sm text-[#64748B]">Try a different name or username</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="p-4 space-y-2">
              {results.map((result, i) => (
                <motion.div
                  key={result.profile.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#E5F4F1] shadow-sm hover:border-[#10B981]/30 transition-colors"
                >
                  <button onClick={() => openChat(result.profile.id)}>
                    <UserAvatar
                      src={result.profile.avatar_url}
                      name={result.profile.display_name}
                      userId={result.profile.id}
                      size="md"
                      isOnline={result.profile.is_online}
                      animate
                    />
                  </button>

                  <div className="flex-1 min-w-0" onClick={() => openChat(result.profile.id)}>
                    <h3 className="text-sm font-bold text-[#111827] truncate">
                      {result.profile.display_name}
                    </h3>
                    <p className="text-xs text-[#64748B]">@{result.profile.username}</p>
                    {result.profile.bio && (
                      <p className="text-xs text-[#64748B] truncate mt-0.5">{result.profile.bio}</p>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    {result.friendStatus === 'friends' ? (
                      <button
                        onClick={() => openChat(result.profile.id)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#06B6D4] text-white text-xs font-bold shadow-sm"
                      >
                        Message
                      </button>
                    ) : result.friendStatus === 'pending_sent' ? (
                      <button
                        onClick={() => result.requestId && cancelRequest(result.requestId, result.profile.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#F5FFFC] text-[#64748B] text-xs font-medium border border-[#E5F4F1] flex items-center gap-1"
                      >
                        <Clock className="h-3 w-3" />
                        Pending
                      </button>
                    ) : result.friendStatus === 'pending_received' ? (
                      <button
                        onClick={() => result.requestId && cancelRequest(result.requestId, result.profile.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#F5FFFC] text-[#10B981] text-xs font-medium border border-[#E5F4F1] flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" />
                        Accept
                      </button>
                    ) : (
                      <button
                        onClick={() => sendFriendRequest(result.profile.id)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#06B6D4] text-white text-xs font-bold shadow-sm flex items-center gap-1"
                      >
                        <UserPlus className="h-3 w-3" />
                        Add
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
