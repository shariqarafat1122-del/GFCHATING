import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Phone, Video, MoreVertical,
  Mic, Paperclip, Send, X, Reply, Smile, ChevronDown,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useChatStore, useTypingInConversation } from '@/store/chatStore'
import { useMessages } from '@/hooks/useChat'
import { UserAvatar } from '@/components/ui/avatar'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { TypingIndicator } from '@/components/chat/TypingIndicator'
import { LoadingDots, MessageSkeleton } from '@/components/ui/loading'
import { formatLastSeen } from '@/lib/utils'
import type { Conversation, Profile } from '@/types/database'

export default function ChatScreen() {
  const { id: conversationId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { replyingTo, setReplyingTo, editingMessage, setEditingMessage } = useChatStore()
  
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [otherUser, setOtherUser] = useState<Profile | null>(null)
  const [messageText, setMessageText] = useState('')
  const [isLoadingConv, setIsLoadingConv] = useState(true)
  const [showScrollBottom, setShowScrollBottom] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { messages, isLoading, hasMore, loadMore, sendTypingIndicator, markAsRead } = useMessages(
    conversationId || ''
  )
  
  const typingUsers = useTypingInConversation(conversationId || '')

  // Fetch conversation details
  useEffect(() => {
    if (!conversationId || !user) return

    const fetchConversation = async () => {
      setIsLoadingConv(true)
      try {
        const { data: conv } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .single()

        if (conv) {
          setConversation(conv as unknown as Conversation)

          // Get other user for direct chats
          if (conv.type === 'direct') {
            const { data: member } = await supabase
              .from('conversation_members')
              .select('user_id')
              .eq('conversation_id', conversationId)
              .neq('user_id', user.id)
              .single()

            if (member) {
              const { data: otherProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', member.user_id)
                .single()
              
              if (otherProfile) setOtherUser(otherProfile as unknown as Profile)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching conversation:', error)
      } finally {
        setIsLoadingConv(false)
      }
    }

    fetchConversation()
  }, [conversationId, user])

  // Auto-scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom('smooth')
    }
  }, [messages.length])

  // Mark messages as read
  useEffect(() => {
    if (messages.length > 0 && user) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg.sender_id !== user.id) {
        markAsRead(lastMsg.id)
      }
    }
  }, [messages, user, markAsRead])

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  const handleScroll = () => {
    const el = messagesContainerRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100
    setShowScrollBottom(!atBottom)

    // Load more when scrolled to top
    if (el.scrollTop < 100 && hasMore && !isLoading) {
      loadMore()
    }
  }

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value)
    sendTypingIndicator(true)
    
    // Auto-resize textarea
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const sendMessage = useCallback(async () => {
    if (!messageText.trim() || !conversationId || !user) return

    const content = messageText.trim()
    setMessageText('')
    sendTypingIndicator(false)
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }

    try {
      if (editingMessage) {
        await supabase
          .from('messages')
          .update({ content, is_edited: true, updated_at: new Date().toISOString() })
          .eq('id', editingMessage.id)
        setEditingMessage(null)
      } else {
        const msgData: Record<string, unknown> = {
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          type: 'text',
        }
        if (replyingTo) {
          msgData.reply_to_id = replyingTo.id
          setReplyingTo(null)
        }
        await supabase.from('messages').insert(msgData)

        // Update conversation's updated_at
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }, [messageText, conversationId, user, editingMessage, replyingTo, sendTypingIndicator, setEditingMessage, setReplyingTo])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !conversationId || !user) return

    try {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const path = `${user.id}/${conversationId}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(path, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('chat-media').getPublicUrl(uploadData.path)

      const msgType = file.type.startsWith('image/') ? 'image' : 
                      file.type.startsWith('video/') ? 'video' : 'document'

      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: file.name,
        type: msgType,
        media_url: urlData.publicUrl,
        media_name: file.name,
        media_size: file.size,
      })
    } catch (error) {
      console.error('Error uploading file:', error)
    }

    e.target.value = ''
  }

  const chatName = otherUser?.display_name || conversation?.name || 'Chat'
  const chatAvatar = otherUser?.avatar_url || conversation?.avatar_url
  const isOnline = otherUser?.is_online || false

  if (isLoadingConv) {
    return (
      <div className="flex flex-col h-full bg-[#F5FFFC]">
        <div className="h-16 bg-white border-b border-[#E5F4F1]" />
        <div className="flex-1 overflow-y-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <MessageSkeleton key={i} isOwn={i % 3 === 0} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#F5FFFC]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5F4F1] px-4 pt-safe-top py-3 flex items-center gap-3 shadow-sm">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="h-9 w-9 rounded-xl flex items-center justify-center text-[#64748B] hover:bg-[#F5FFFC]"
        >
          <ArrowLeft className="h-5 w-5" />
        </motion.button>

        <div className="flex-1 flex items-center gap-3 min-w-0">
          <UserAvatar
            src={chatAvatar}
            name={chatName}
            userId={otherUser?.id}
            size="sm"
            isOnline={isOnline}
          />
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-[#111827] truncate">{chatName}</h2>
            <p className="text-xs text-[#64748B]">
              {typingUsers.length > 0 ? (
                <span className="text-[#10B981] font-medium flex items-center gap-1">
                  <LoadingDots size="sm" /> typing...
                </span>
              ) : isOnline ? (
                <span className="text-[#10B981] font-medium">Online</span>
              ) : otherUser?.last_seen ? (
                `Last seen ${formatLastSeen(otherUser.last_seen)}`
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="h-9 w-9 rounded-xl flex items-center justify-center text-[#64748B] hover:bg-[#F5FFFC]"
          >
            <Phone className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="h-9 w-9 rounded-xl flex items-center justify-center text-[#64748B] hover:bg-[#F5FFFC]"
          >
            <Video className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="h-9 w-9 rounded-xl flex items-center justify-center text-[#64748B] hover:bg-[#F5FFFC]"
          >
            <MoreVertical className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
        style={{ 
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(16,185,129,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(6,182,212,0.03) 0%, transparent 50%)'
        }}
      >
        {/* Load more indicator */}
        {hasMore && (
          <div className="flex justify-center py-2">
            <button
              onClick={loadMore}
              className="text-xs text-[#10B981] font-medium px-4 py-2 rounded-xl bg-white border border-[#E5F4F1] shadow-sm"
            >
              Load earlier messages
            </button>
          </div>
        )}

        {isLoading && messages.length === 0 && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <MessageSkeleton key={i} isOwn={i % 2 === 0} />
            ))}
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message, index) => {
            const prevMessage = index > 0 ? messages[index - 1] : null
            const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id
            
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === user?.id}
                showAvatar={showAvatar}
                onReply={() => setReplyingTo(message)}
                onEdit={() => {
                  setEditingMessage(message)
                  setMessageText(message.content || '')
                  inputRef.current?.focus()
                }}
              />
            )
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {typingUsers.length > 0 && (
            <TypingIndicator
              users={typingUsers.map(t => t.userId)}
            />
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollBottom && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scrollToBottom()}
            className="absolute bottom-24 right-4 h-10 w-10 rounded-full bg-white shadow-lg border border-[#E5F4F1] flex items-center justify-center"
          >
            <ChevronDown className="h-5 w-5 text-[#10B981]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Reply/Edit banner */}
      <AnimatePresence>
        {(replyingTo || editingMessage) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-t border-[#E5F4F1] px-4 py-2 flex items-center gap-3"
          >
            <div className="flex-1 flex items-center gap-2 pl-3 border-l-2 border-[#10B981]">
              {replyingTo && (
                <Reply className="h-3.5 w-3.5 text-[#10B981] flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#10B981]">
                  {replyingTo ? `Reply to ${replyingTo.sender?.display_name || 'User'}` : 'Edit Message'}
                </p>
                <p className="text-xs text-[#64748B] truncate">
                  {replyingTo?.content || editingMessage?.content}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setReplyingTo(null)
                setEditingMessage(null)
                setMessageText('')
              }}
              className="flex-shrink-0 h-6 w-6 rounded-full bg-[#F5FFFC] flex items-center justify-center"
            >
              <X className="h-3.5 w-3.5 text-[#64748B]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="bg-white border-t border-[#E5F4F1] px-4 py-3 safe-area-bottom">
        <div className="flex items-end gap-2">
          <div className="flex items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="h-9 w-9 rounded-xl flex items-center justify-center text-[#64748B] hover:bg-[#F5FFFC]"
            >
              <Smile className="h-5 w-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              className="h-9 w-9 rounded-xl flex items-center justify-center text-[#64748B] hover:bg-[#F5FFFC]"
            >
              <Paperclip className="h-5 w-5" />
            </motion.button>
          </div>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={messageText}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              placeholder="Message..."
              rows={1}
              className="w-full resize-none rounded-2xl border border-[#E5F4F1] bg-[#F5FFFC] px-4 py-2.5 text-sm text-[#111827] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#10B981]/30 focus:border-[#10B981] transition-all max-h-[120px] leading-5"
              style={{ height: 'auto' }}
            />
          </div>

          <AnimatePresence mode="wait">
            {messageText.trim() ? (
              <motion.button
                key="send"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={sendMessage}
                className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0"
              >
                <Send className="h-4 w-4 text-white" />
              </motion.button>
            ) : (
              <motion.button
                key="mic"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                whileTap={{ scale: 0.9 }}
                className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0"
              >
                <Mic className="h-4 w-4 text-white" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,.pdf,.doc,.docx"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  )
}
