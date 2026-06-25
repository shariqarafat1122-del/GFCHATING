import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || ''

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('No session')
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  }
}

async function apiRequest<T>(
  path: string,
  method: string = 'GET',
  body?: unknown
): Promise<T> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }
  
  return response.json()
}

// Chat APIs
export const chatApi = {
  sendMessage: (data: {
    conversationId: string
    content?: string
    type?: string
    mediaUrl?: string
    replyToId?: string
  }) => apiRequest('/api/chat/send', 'POST', data),

  deleteMessage: (messageId: string, deleteForEveryone: boolean) =>
    apiRequest('/api/chat/delete', 'POST', { messageId, deleteForEveryone }),

  editMessage: (messageId: string, content: string) =>
    apiRequest('/api/chat/edit', 'POST', { messageId, content }),

  addReaction: (messageId: string, emoji: string) =>
    apiRequest('/api/chat/reaction', 'POST', { messageId, emoji }),

  markRead: (conversationId: string, messageId: string) =>
    apiRequest('/api/chat/read', 'POST', { conversationId, messageId }),

  uploadMedia: async (file: File, conversationId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error('No session')
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('conversationId', conversationId)
    
    const response = await fetch(`${API_URL}/api/chat/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: formData,
    })
    
    if (!response.ok) throw new Error('Upload failed')
    return response.json()
  },
}

// User APIs
export const userApi = {
  search: (query: string) =>
    apiRequest<{ users: unknown[] }>(`/api/user/search?q=${encodeURIComponent(query)}`),
  
  getProfile: (userId: string) =>
    apiRequest(`/api/user/profile?userId=${userId}`),
  
  updateProfile: (data: Record<string, unknown>) =>
    apiRequest('/api/user/profile', 'PUT', data),
}

// Friend APIs
export const friendApi = {
  sendRequest: (receiverId: string) =>
    apiRequest('/api/friend/request', 'POST', { receiverId }),
  
  acceptRequest: (requestId: string) =>
    apiRequest('/api/friend/accept', 'POST', { requestId }),
  
  rejectRequest: (requestId: string) =>
    apiRequest('/api/friend/reject', 'POST', { requestId }),
  
  removeFriend: (friendId: string) =>
    apiRequest('/api/friend/remove', 'POST', { friendId }),
}

// Block/Report APIs
export const moderationApi = {
  blockUser: (userId: string) =>
    apiRequest('/api/block', 'POST', { userId }),
  
  unblockUser: (userId: string) =>
    apiRequest('/api/block', 'DELETE', { userId }),
  
  reportUser: (userId: string, reason: string) =>
    apiRequest('/api/report', 'POST', { userId, reason }),
}

// Notification APIs
export const notificationApi = {
  getNotifications: () =>
    apiRequest('/api/notification'),
  
  markRead: (notificationId: string) =>
    apiRequest('/api/notification', 'PUT', { notificationId }),
}

export { apiRequest }
