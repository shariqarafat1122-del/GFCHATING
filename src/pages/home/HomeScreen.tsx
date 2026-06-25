import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Edit } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import { useConversations } from '@/hooks/useChat'
import { UserAvatar } from '@/components/ui/avatar'
import { ConversationSkeleton } from '@/components/ui/loading'
import { ConversationItem } from '@/components/chat/ConversationItem'
import { NewChatFAB } from '@/components/chat/NewChatFAB'
import { cn, truncateText } from '@/lib/utils'

export default function HomeScreen() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { conversations } = useChatStore()
  const { fetchConversations } = useConversations()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      await fetchConversations()
      setIsLoading(false)
    }
    load()
  }, [fetchConversations])

  const filteredConversations = conversations.filter((conv) => {
    const name = conv.other_user?.display_name || conv.name || ''
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.last_message?.content?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || (filter === 'unread' && (conv.unread_count || 0) > 0)
    return matchesSearch && matchesFilter
  })

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-[#E5F4F1] px-4 pt-safe-top pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <UserAvatar
              src={profile?.avatar_url}
              name={profile?.display_name || 'User'}
              userId={profile?.id}
              size="sm"
              isOnline={true}
              showRing
              animate
            />
            <div>
              <h1 className="text-lg font-black text-[#111827]">MintWave</h1>
              {totalUnread > 0 && (
                <p className="text-xs text-[#10B981] font-semibold">
                  {totalUnread} unread message{totalUnread > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/search')}
              className="h-9 w-9 rounded-xl bg-[#F5FFFC] flex items-center justify-center border border-[#E5F4F1]"
            >
              <Search className="h-4 w-4 text-[#64748B]" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/search')}
              className="h-9 w-9 rounded-xl bg-gradient-to-r from-[#10B981] to-[#06B6D4] flex items-center justify-center shadow-sm"
            >
              <Edit className="h-4 w-4 text-white" />
            </motion.button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#F5FFFC] border border-[#E5F4F1] text-sm text-[#111827] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#10B981]/30 focus:border-[#10B981]"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mt-3">
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 capitalize',
                filter === f
                  ? 'bg-gradient-to-r from-[#10B981] to-[#06B6D4] text-white shadow-sm'
                  : 'bg-[#F5FFFC] text-[#64748B] border border-[#E5F4F1]'
              )}
            >
              {f === 'unread' ? `Unread ${totalUnread > 0 ? `(${totalUnread})` : ''}` : 'All Chats'}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <ConversationSkeleton key={i} />
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <EmptyState query={searchQuery} filter={filter} onNewChat={() => navigate('/search')} />
        ) : (
          <AnimatePresence>
            {filteredConversations.map((conv, index) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <ConversationItem
                  conversation={conv}
                  onClick={() => navigate(`/chat/${conv.id}`)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* FAB */}
      <NewChatFAB />
    </div>
  )
}

function EmptyState({
  query,
  filter,
  onNewChat,
}: {
  query: string
  filter: string
  onNewChat: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full px-8 text-center py-20"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="h-20 w-20 rounded-3xl bg-gradient-to-br from-[#10B981]/10 to-[#06B6D4]/10 flex items-center justify-center mb-5"
      >
        <span className="text-4xl">💬</span>
      </motion.div>
      <h3 className="text-lg font-bold text-[#111827] mb-2">
        {query ? 'No results found' : filter === 'unread' ? 'All caught up!' : 'Start a conversation'}
      </h3>
      <p className="text-sm text-[#64748B] mb-6 max-w-xs">
        {query
          ? `No conversations match "${truncateText(query, 20)}"`
          : filter === 'unread'
          ? 'You have no unread messages.'
          : 'Search for friends and start chatting!'}
      </p>
      <button
        onClick={onNewChat}
        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#06B6D4] text-white text-sm font-bold shadow-lg shadow-emerald-500/25"
      >
        Find Friends
      </button>
    </motion.div>
  )
}
