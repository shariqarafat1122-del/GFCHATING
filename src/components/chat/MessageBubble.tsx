import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Reply, Copy, Edit2, Trash2, MoreHorizontal, Check, CheckCheck,
  FileText, MapPin, Mic, Download, ExternalLink,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import { UserAvatar } from '@/components/ui/avatar'
import { formatMessageTime, cn } from '@/lib/utils'
import type { Message } from '@/types/database'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar: boolean
  onReply: () => void
  onEdit: () => void
}

const EMOJI_REACTIONS = ['❤️', '😂', '😮', '😢', '👍', '🔥']

export function MessageBubble({ message, isOwn, showAvatar, onReply, onEdit }: MessageBubbleProps) {
  const { user } = useAuthStore()
  const { updateMessage, removeMessage } = useChatStore()
  const [showActions, setShowActions] = useState(false)
  const [showReactions, setShowReactions] = useState(false)

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content)
    }
    setShowActions(false)
  }

  const handleDelete = async (forEveryone: boolean) => {
    if (!user) return
    try {
      if (forEveryone) {
        await supabase
          .from('messages')
          .update({ is_deleted: true, content: null, updated_at: new Date().toISOString() })
          .eq('id', message.id)
        updateMessage(message.id, { is_deleted: true, content: null })
      } else {
        const deletedFor = [...(message.deleted_for || []), user.id]
        await supabase
          .from('messages')
          .update({ deleted_for: deletedFor })
          .eq('id', message.id)
        removeMessage(message.id)
      }
    } catch (error) {
      console.error('Error deleting message:', error)
    }
    setShowActions(false)
  }

  const handleReaction = async (emoji: string) => {
    if (!user) return
    try {
      const existing = message.reactions?.find(r => r.user_id === user.id && r.emoji === emoji)
      if (existing) {
        await supabase.from('message_reactions').delete().eq('id', existing.id)
      } else {
        await supabase.from('message_reactions').insert({
          message_id: message.id,
          user_id: user.id,
          emoji,
        })
      }
    } catch (error) {
      console.error('Error adding reaction:', error)
    }
    setShowReactions(false)
  }

  // Check if deleted for current user
  if (message.deleted_for?.includes(user?.id || '') && !message.is_deleted) {
    return null
  }

  const isDeleted = message.is_deleted
  const reactions = message.reactions || []

  // Group reactions by emoji
  const reactionGroups = reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15 }}
      className={cn('flex items-end gap-2 group', isOwn ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-8">
        {!isOwn && showAvatar && (
          <UserAvatar
            src={message.sender?.avatar_url}
            name={message.sender?.display_name || 'User'}
            userId={message.sender?.id}
            size="xs"
          />
        )}
      </div>

      <div className={cn('flex flex-col max-w-[75%]', isOwn ? 'items-end' : 'items-start')}>
        {/* Sender name for group chats */}
        {!isOwn && showAvatar && (
          <span className="text-xs font-semibold text-[#10B981] mb-1 ml-1">
            {message.sender?.display_name || 'User'}
          </span>
        )}

        {/* Reply preview */}
        {message.reply_to && !isDeleted && (
          <div className={cn(
            'mb-1 px-3 py-1.5 rounded-xl border-l-2 border-[#10B981] bg-white/60 max-w-full',
            isOwn ? 'mr-1' : 'ml-1'
          )}>
            <p className="text-xs font-bold text-[#10B981] mb-0.5">
              {message.reply_to.sender?.display_name || 'User'}
            </p>
            <p className="text-xs text-[#64748B] truncate">{message.reply_to.content}</p>
          </div>
        )}

        {/* Message content */}
        <div className="relative">
          {/* Long press / right click for actions */}
          <motion.div
            onContextMenu={(e) => {
              e.preventDefault()
              setShowActions(true)
            }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'relative rounded-3xl px-4 py-2.5 shadow-sm',
              isDeleted
                ? 'bg-[#F5FFFC] border border-[#E5F4F1] italic'
                : isOwn
                ? 'bg-gradient-to-br from-[#10B981] to-[#0ea572] text-white rounded-tr-sm'
                : 'bg-white border border-[#E5F4F1] text-[#111827] rounded-tl-sm',
              message.type === 'image' && 'p-1 overflow-hidden'
            )}
          >
            {isDeleted ? (
              <p className="text-xs text-[#64748B] flex items-center gap-1.5">
                <Trash2 className="h-3 w-3" />
                This message was deleted
              </p>
            ) : message.type === 'image' ? (
              <div className="relative">
                <img
                  src={message.media_url || ''}
                  alt="Image"
                  className="rounded-2xl max-w-full max-h-64 object-cover cursor-pointer"
                  loading="lazy"
                />
                {message.content && (
                  <p className={cn(
                    'text-sm px-2 pt-1 pb-0.5',
                    isOwn ? 'text-white' : 'text-[#111827]'
                  )}>
                    {message.content}
                  </p>
                )}
              </div>
            ) : message.type === 'document' ? (
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate max-w-[140px]">{message.media_name || 'Document'}</p>
                  <a
                    href={message.media_url || '#'}
                    download
                    className="text-xs opacity-70 flex items-center gap-1 hover:opacity-100"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </a>
                </div>
              </div>
            ) : message.type === 'audio' ? (
              <div className="flex items-center gap-2 min-w-[160px]">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Mic className="h-4 w-4" />
                </div>
                <audio controls src={message.media_url || ''} className="flex-1 h-7" />
              </div>
            ) : message.type === 'location' ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Location shared</span>
                <a href={message.media_url || '#'} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>
              </div>
            ) : (
              <p className={cn(
                'text-sm leading-relaxed break-words',
                isOwn ? 'text-white' : 'text-[#111827]'
              )}>
                {message.content}
              </p>
            )}

            {/* Time & status */}
            {!isDeleted && (
              <div className={cn(
                'flex items-center gap-1 mt-1',
                isOwn ? 'justify-end' : 'justify-end'
              )}>
                <span className={cn(
                  'text-[10px]',
                  isOwn ? 'text-white/70' : 'text-[#64748B]'
                )}>
                  {formatMessageTime(message.created_at)}
                  {message.is_edited && ' · edited'}
                </span>
                {isOwn && (
                  <span>
                    {message.reads && message.reads.length > 0 ? (
                      <CheckCheck className="h-3 w-3 text-white/90" />
                    ) : (
                      <Check className="h-3 w-3 text-white/70" />
                    )}
                  </span>
                )}
              </div>
            )}
          </motion.div>

          {/* Quick action buttons (hover) */}
          <div className={cn(
            'absolute top-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150',
            isOwn ? '-left-20' : '-right-20'
          )}>
            <button
              onClick={onReply}
              className="h-7 w-7 rounded-xl bg-white border border-[#E5F4F1] shadow-sm flex items-center justify-center text-[#64748B] hover:text-[#10B981]"
            >
              <Reply className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setShowReactions(true)}
              className="h-7 w-7 rounded-xl bg-white border border-[#E5F4F1] shadow-sm flex items-center justify-center text-[#64748B] hover:text-[#10B981]"
            >
              😊
            </button>
            <button
              onClick={() => setShowActions(true)}
              className="h-7 w-7 rounded-xl bg-white border border-[#E5F4F1] shadow-sm flex items-center justify-center text-[#64748B]"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Reactions display */}
        {Object.keys(reactionGroups).length > 0 && (
          <div className={cn(
            'flex flex-wrap gap-1 mt-1',
            isOwn ? 'justify-end mr-1' : 'justify-start ml-1'
          )}>
            {Object.entries(reactionGroups).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-white border border-[#E5F4F1] shadow-sm text-xs hover:border-[#10B981] transition-colors"
              >
                <span>{emoji}</span>
                {count > 1 && <span className="text-[#64748B] font-medium">{count}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reactions picker */}
      <AnimatePresence>
        {showReactions && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              onClick={() => setShowReactions(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white rounded-2xl p-2 shadow-xl border border-[#E5F4F1]"
            >
              {EMOJI_REACTIONS.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleReaction(emoji)}
                  className="text-2xl hover:bg-[#F5FFFC] rounded-xl p-1.5"
                >
                  {emoji}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Action menu */}
      <AnimatePresence>
        {showActions && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              onClick={() => setShowActions(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                'fixed z-50 bg-white rounded-2xl shadow-xl border border-[#E5F4F1] overflow-hidden w-48',
                'bottom-32',
                isOwn ? 'right-4' : 'left-4'
              )}
            >
              <button
                onClick={onReply}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#111827] hover:bg-[#F5FFFC] transition-colors"
              >
                <Reply className="h-4 w-4 text-[#10B981]" />
                Reply
              </button>
              {message.content && (
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#111827] hover:bg-[#F5FFFC] transition-colors"
                >
                  <Copy className="h-4 w-4 text-[#64748B]" />
                  Copy
                </button>
              )}
              {isOwn && message.type === 'text' && (
                <button
                  onClick={() => { onEdit(); setShowActions(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#111827] hover:bg-[#F5FFFC] transition-colors"
                >
                  <Edit2 className="h-4 w-4 text-[#64748B]" />
                  Edit
                </button>
              )}
              <div className="h-px bg-[#E5F4F1]" />
              <button
                onClick={() => handleDelete(false)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#EF4444] hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete for me
              </button>
              {isOwn && (
                <button
                  onClick={() => handleDelete(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#EF4444] hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete for everyone
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
