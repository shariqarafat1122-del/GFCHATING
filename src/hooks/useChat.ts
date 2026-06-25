import { useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useChatStore } from '@/store/chatStore'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import type { Conversation, Message, Profile } from '@/types/database'

const MESSAGE_PAGE_SIZE = 30

export function useConversations() {
  const { user } = useAuthStore()
  const { conversations, setConversations } = useChatStore()

  const fetchConversations = useCallback(async () => {
    if (!user) return

    try {
      const { data: members } = await supabase
        .from('conversation_members')
        .select(`
          conversation_id,
          conversations (
            id, type, name, avatar_url, created_by, created_at, updated_at,
            last_message_id, is_archived, pinned_message_id
          )
        `)
        .eq('user_id', user.id)

      if (!members) return

      // Fetch unread counts and last messages for each conversation
      const enrichedConversations: Conversation[] = []

      for (const member of members) {
        const conv = member.conversations as unknown as Conversation
        if (!conv) continue

        // Get last message
        let lastMessage: Message | undefined
        if (conv.last_message_id) {
          const { data: msg } = await supabase
            .from('messages')
            .select('*, sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url)')
            .eq('id', conv.last_message_id)
            .single()
          if (msg) lastMessage = msg as unknown as Message
        }

        // Get other user for direct conversations
        let otherUser: Profile | undefined
        if (conv.type === 'direct') {
          const { data: otherMember } = await supabase
            .from('conversation_members')
            .select('user_id, profiles!conversation_members_user_id_fkey(id, username, display_name, avatar_url, is_online, last_seen)')
            .eq('conversation_id', conv.id)
            .neq('user_id', user.id)
            .single()
          
          if (otherMember?.profiles) {
            otherUser = otherMember.profiles as unknown as Profile
          }
        }

        // Get unread count
        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .gt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        enrichedConversations.push({
          ...conv,
          last_message: lastMessage,
          other_user: otherUser,
          unread_count: count || 0,
        })
      }

      // Sort by last message time
      enrichedConversations.sort((a, b) => {
        const timeA = a.last_message?.created_at || a.updated_at
        const timeB = b.last_message?.created_at || b.updated_at
        return new Date(timeB).getTime() - new Date(timeA).getTime()
      })

      setConversations(enrichedConversations)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }, [user, setConversations])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Subscribe to new messages for conversation updates
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversations' },
        () => { fetchConversations() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, fetchConversations])

  return { conversations, fetchConversations }
}

export function useMessages(conversationId: string) {
  const { user } = useAuthStore()
  const {
    messages,
    setMessages,
    addMessage,
    updateMessage,
    isLoadingMessages,
    setLoadingMessages,
    hasMoreMessages,
    setHasMoreMessages,
    prependMessages,
    setTypingUser,
  } = useChatStore()
  const { showToast } = useUIStore()
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const conversationMessages = messages[conversationId] || []

  const fetchMessages = useCallback(async (beforeId?: string) => {
    if (!user || !conversationId) return

    setLoadingMessages(true)
    try {
      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url, is_online),
          reactions:message_reactions(id, emoji, user_id, created_at),
          reads:message_reads(id, user_id, read_at)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(MESSAGE_PAGE_SIZE)

      if (beforeId) {
        const { data: refMsg } = await supabase
          .from('messages')
          .select('created_at')
          .eq('id', beforeId)
          .single()
        if (refMsg) {
          query = query.lt('created_at', refMsg.created_at)
        }
      }

      const { data, error } = await query
      if (error) throw error

      const msgs = (data || []).reverse() as unknown as Message[]

      if (beforeId) {
        prependMessages(conversationId, msgs)
      } else {
        setMessages(conversationId, msgs)
      }

      setHasMoreMessages(conversationId, msgs.length === MESSAGE_PAGE_SIZE)
    } catch (error) {
      console.error('Error fetching messages:', error)
      showToast('Failed to load messages', 'error')
    } finally {
      setLoadingMessages(false)
    }
  }, [user, conversationId, setLoadingMessages, setMessages, prependMessages, setHasMoreMessages, showToast])

  const loadMore = useCallback(() => {
    const msgs = messages[conversationId]
    if (msgs && msgs.length > 0) {
      fetchMessages(msgs[0].id)
    }
  }, [messages, conversationId, fetchMessages])

  // Subscribe to real-time messages
  useEffect(() => {
    if (!user || !conversationId) return

    fetchMessages()

    channelRef.current = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message
          
          // Fetch full message with relations
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url, is_online),
              reactions:message_reactions(id, emoji, user_id, created_at),
              reads:message_reads(id, user_id, read_at)
            `)
            .eq('id', newMsg.id)
            .single()

          if (data) {
            addMessage(data as unknown as Message)
            setTypingUser(newMsg.sender_id, conversationId, false)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          updateMessage(payload.new.id as string, payload.new as Partial<Message>)
        }
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId, isTyping } = payload.payload as { userId: string; isTyping: boolean }
        if (userId !== user.id) {
          setTypingUser(userId, conversationId, isTyping)
        }
      })
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [user, conversationId, fetchMessages, addMessage, updateMessage, setTypingUser])

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!channelRef.current || !user) return

    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: user.id, isTyping },
    })

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(false)
      }, 3000)
    }
  }, [user])

  const markAsRead = useCallback(async (messageId: string) => {
    if (!user) return
    try {
      await supabase.from('message_reads').upsert({
        message_id: messageId,
        user_id: user.id,
        read_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }, [user])

  return {
    messages: conversationMessages,
    isLoading: isLoadingMessages,
    hasMore: hasMoreMessages[conversationId] || false,
    loadMore,
    sendTypingIndicator,
    markAsRead,
    refetch: fetchMessages,
  }
}

export function useOnlineStatus(userIds: string[]) {
  useEffect(() => {
    if (!userIds.length) return

    const channel = supabase
      .channel('online-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          // Handle online status updates
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userIds])
}
