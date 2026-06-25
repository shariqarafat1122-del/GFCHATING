import { motion } from 'framer-motion'
import { Check, CheckCheck, Image, Mic, FileText, MapPin, Volume2 } from 'lucide-react'
import { UserAvatar } from '@/components/ui/avatar'
import { formatConversationTime } from '@/lib/utils'
import type { Conversation } from '@/types/database'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

interface ConversationItemProps {
  conversation: Conversation
  onClick: () => void
}

const messageTypeIcons: Record<string, React.ReactNode> = {
  image: <Image className="h-3 w-3" />,
  audio: <Mic className="h-3 w-3" />,
  document: <FileText className="h-3 w-3" />,
  location: <MapPin className="h-3 w-3" />,
  video: <Volume2 className="h-3 w-3" />,
}

const messageTypeLabels: Record<string, string> = {
  image: 'Photo',
  audio: 'Voice note',
  document: 'Document',
  location: 'Location',
  video: 'Video',
  gif: 'GIF',
}

export function ConversationItem({ conversation, onClick }: ConversationItemProps) {
  const { user } = useAuthStore()
  const isOwn = conversation.last_message?.sender_id === user?.id
  const hasUnread = (conversation.unread_count || 0) > 0
  const lastMessage = conversation.last_message

  const otherUser = conversation.other_user
  const name = otherUser?.display_name || conversation.name || 'Unknown'
  const avatar = otherUser?.avatar_url || conversation.avatar_url
  const isOnline = otherUser?.is_online || false

  const getMessagePreview = () => {
    if (!lastMessage) return 'Start a conversation'
    if (lastMessage.is_deleted) return 'This message was deleted'
    
    const typeLabel = messageTypeLabels[lastMessage.type]
    if (typeLabel) {
      return (
        <span className="flex items-center gap-1">
          {messageTypeIcons[lastMessage.type]}
          {typeLabel}
        </span>
      )
    }
    
    return lastMessage.content || ''
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 transition-colors duration-100 hover:bg-[#F5FFFC] active:bg-[#F5FFFC]',
        hasUnread && 'bg-gradient-to-r from-[#10B981]/5 to-transparent'
      )}
    >
      <UserAvatar
        src={avatar}
        name={name}
        userId={otherUser?.id}
        size="md"
        isOnline={isOnline}
      />

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className={cn(
            'text-sm truncate',
            hasUnread ? 'font-bold text-[#111827]' : 'font-semibold text-[#111827]'
          )}>
            {name}
          </h3>
          <span className={cn(
            'text-[10px] flex-shrink-0 ml-2',
            hasUnread ? 'text-[#10B981] font-bold' : 'text-[#64748B]'
          )}>
            {lastMessage ? formatConversationTime(lastMessage.created_at) : ''}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className={cn(
            'text-xs truncate flex items-center gap-1 max-w-[75%]',
            hasUnread ? 'text-[#111827] font-medium' : 'text-[#64748B]'
          )}>
            {isOwn && (
              <span className="flex-shrink-0">
                {lastMessage?.reads && lastMessage.reads.length > 0 ? (
                  <CheckCheck className="h-3 w-3 text-[#10B981]" />
                ) : (
                  <Check className="h-3 w-3 text-[#64748B]" />
                )}
              </span>
            )}
            {getMessagePreview()}
          </div>

          {hasUnread && (
            <span className="flex-shrink-0 ml-2 h-5 min-w-[20px] px-1.5 rounded-full bg-gradient-to-r from-[#10B981] to-[#06B6D4] text-white text-[10px] font-bold flex items-center justify-center">
              {conversation.unread_count! > 99 ? '99+' : conversation.unread_count}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  )
}
