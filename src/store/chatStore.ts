import { create } from 'zustand'
import type { Conversation, Message } from '@/types/database'

interface TypingUser {
  userId: string
  conversationId: string
  timestamp: number
}

interface ChatState {
  conversations: Conversation[]
  activeConversation: Conversation | null
  messages: Record<string, Message[]>
  typingUsers: TypingUser[]
  replyingTo: Message | null
  editingMessage: Message | null
  searchQuery: string
  isLoadingMessages: boolean
  hasMoreMessages: Record<string, boolean>

  setConversations: (conversations: Conversation[]) => void
  addConversation: (conversation: Conversation) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  setActiveConversation: (conversation: Conversation | null) => void
  setMessages: (conversationId: string, messages: Message[]) => void
  addMessage: (message: Message) => void
  updateMessage: (id: string, updates: Partial<Message>) => void
  removeMessage: (id: string) => void
  prependMessages: (conversationId: string, messages: Message[]) => void
  setTypingUser: (userId: string, conversationId: string, isTyping: boolean) => void
  setReplyingTo: (message: Message | null) => void
  setEditingMessage: (message: Message | null) => void
  setSearchQuery: (query: string) => void
  setLoadingMessages: (loading: boolean) => void
  setHasMoreMessages: (conversationId: string, hasMore: boolean) => void
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversation: null,
  messages: {},
  typingUsers: [],
  replyingTo: null,
  editingMessage: null,
  searchQuery: '',
  isLoadingMessages: false,
  hasMoreMessages: {},

  setConversations: (conversations) => set({ conversations }),
  
  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations.filter((c) => c.id !== conversation.id)],
    })),

  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      activeConversation:
        state.activeConversation?.id === id
          ? { ...state.activeConversation, ...updates }
          : state.activeConversation,
    })),

  setActiveConversation: (conversation) => set({ activeConversation: conversation }),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    })),

  addMessage: (message) =>
    set((state) => {
      const existing = state.messages[message.conversation_id] || []
      const isDuplicate = existing.some((m) => m.id === message.id)
      if (isDuplicate) return state
      return {
        messages: {
          ...state.messages,
          [message.conversation_id]: [...existing, message],
        },
      }
    }),

  updateMessage: (id, updates) =>
    set((state) => {
      const newMessages: Record<string, Message[]> = {}
      for (const [convId, msgs] of Object.entries(state.messages)) {
        newMessages[convId] = msgs.map((m) => (m.id === id ? { ...m, ...updates } : m))
      }
      return { messages: newMessages }
    }),

  removeMessage: (id) =>
    set((state) => {
      const newMessages: Record<string, Message[]> = {}
      for (const [convId, msgs] of Object.entries(state.messages)) {
        newMessages[convId] = msgs.filter((m) => m.id !== id)
      }
      return { messages: newMessages }
    }),

  prependMessages: (conversationId, messages) =>
    set((state) => {
      const existing = state.messages[conversationId] || []
      const newMsgs = messages.filter((m) => !existing.some((e) => e.id === m.id))
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...newMsgs, ...existing],
        },
      }
    }),

  setTypingUser: (userId, conversationId, isTyping) =>
    set((state) => {
      const filtered = state.typingUsers.filter(
        (t) => !(t.userId === userId && t.conversationId === conversationId)
      )
      if (isTyping) {
        return { typingUsers: [...filtered, { userId, conversationId, timestamp: Date.now() }] }
      }
      return { typingUsers: filtered }
    }),

  setReplyingTo: (replyingTo) => set({ replyingTo }),
  setEditingMessage: (editingMessage) => set({ editingMessage }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setLoadingMessages: (isLoadingMessages) => set({ isLoadingMessages }),
  setHasMoreMessages: (conversationId, hasMore) =>
    set((state) => ({
      hasMoreMessages: { ...state.hasMoreMessages, [conversationId]: hasMore },
    })),
}))

// Selector for typing users in a specific conversation
export const useTypingInConversation = (conversationId: string) =>
  useChatStore((state) =>
    state.typingUsers.filter(
      (t) => t.conversationId === conversationId && Date.now() - t.timestamp < 5000
    )
  )
