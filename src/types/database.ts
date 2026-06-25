export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          bio: string | null
          avatar_url: string | null
          is_online: boolean
          last_seen: string
          created_at: string
          updated_at: string
          phone: string | null
          location: string | null
          website: string | null
          privacy_settings: Json
        }
        Insert: {
          id: string
          username: string
          display_name: string
          bio?: string | null
          avatar_url?: string | null
          is_online?: boolean
          last_seen?: string
          created_at?: string
          updated_at?: string
          phone?: string | null
          location?: string | null
          website?: string | null
          privacy_settings?: Json
        }
        Update: {
          id?: string
          username?: string
          display_name?: string
          bio?: string | null
          avatar_url?: string | null
          is_online?: boolean
          last_seen?: string
          created_at?: string
          updated_at?: string
          phone?: string | null
          location?: string | null
          website?: string | null
          privacy_settings?: Json
        }
      }
      friend_requests: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      friends: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          type: 'direct' | 'group'
          name: string | null
          avatar_url: string | null
          created_by: string
          created_at: string
          updated_at: string
          last_message_id: string | null
          is_archived: boolean
          pinned_message_id: string | null
        }
        Insert: {
          id?: string
          type?: 'direct' | 'group'
          name?: string | null
          avatar_url?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          last_message_id?: string | null
          is_archived?: boolean
          pinned_message_id?: string | null
        }
        Update: {
          id?: string
          type?: 'direct' | 'group'
          name?: string | null
          avatar_url?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
          last_message_id?: string | null
          is_archived?: boolean
          pinned_message_id?: string | null
        }
      }
      conversation_members: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          role: 'admin' | 'member'
          joined_at: string
          last_read_at: string | null
          is_muted: boolean
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          role?: 'admin' | 'member'
          joined_at?: string
          last_read_at?: string | null
          is_muted?: boolean
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          role?: 'admin' | 'member'
          joined_at?: string
          last_read_at?: string | null
          is_muted?: boolean
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string | null
          type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'gif'
          media_url: string | null
          media_thumbnail: string | null
          media_size: number | null
          media_name: string | null
          reply_to_id: string | null
          is_edited: boolean
          is_deleted: boolean
          deleted_for: string[]
          created_at: string
          updated_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content?: string | null
          type?: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'gif'
          media_url?: string | null
          media_thumbnail?: string | null
          media_size?: number | null
          media_name?: string | null
          reply_to_id?: string | null
          is_edited?: boolean
          is_deleted?: boolean
          deleted_for?: string[]
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string | null
          type?: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'gif'
          media_url?: string | null
          media_thumbnail?: string | null
          media_size?: number | null
          media_name?: string | null
          reply_to_id?: string | null
          is_edited?: boolean
          is_deleted?: boolean
          deleted_for?: string[]
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
      }
      message_reads: {
        Row: {
          id: string
          message_id: string
          user_id: string
          read_at: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          read_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          read_at?: string
        }
      }
      message_reactions: {
        Row: {
          id: string
          message_id: string
          user_id: string
          emoji: string
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          emoji: string
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          emoji?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'friend_request' | 'message' | 'reaction' | 'system'
          title: string
          body: string
          data: Json
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'friend_request' | 'message' | 'reaction' | 'system'
          title: string
          body: string
          data?: Json
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'friend_request' | 'message' | 'reaction' | 'system'
          title?: string
          body?: string
          data?: Json
          is_read?: boolean
          created_at?: string
        }
      }
      blocked_users: {
        Row: {
          id: string
          blocker_id: string
          blocked_id: string
          created_at: string
        }
        Insert: {
          id?: string
          blocker_id: string
          blocked_id: string
          created_at?: string
        }
        Update: {
          id?: string
          blocker_id?: string
          blocked_id?: string
          created_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          device_info: Json
          is_active: boolean
          created_at: string
          last_active: string
        }
        Insert: {
          id?: string
          user_id: string
          device_info?: Json
          is_active?: boolean
          created_at?: string
          last_active?: string
        }
        Update: {
          id?: string
          user_id?: string
          device_info?: Json
          is_active?: boolean
          created_at?: string
          last_active?: string
        }
      }
      device_tokens: {
        Row: {
          id: string
          user_id: string
          token: string
          platform: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          platform: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          platform?: string
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// App types
export interface Profile {
  id: string
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  is_online: boolean
  last_seen: string
  created_at: string
  updated_at: string
  phone: string | null
  location: string | null
  website: string | null
  privacy_settings: PrivacySettings
}

export interface PrivacySettings {
  last_seen: 'everyone' | 'friends' | 'nobody'
  profile_photo: 'everyone' | 'friends' | 'nobody'
  about: 'everyone' | 'friends' | 'nobody'
  read_receipts: boolean
  typing_indicator: boolean
}

export interface FriendRequest {
  id: string
  sender_id: string
  receiver_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
  sender?: Profile
  receiver?: Profile
}

export interface Conversation {
  id: string
  type: 'direct' | 'group'
  name: string | null
  avatar_url: string | null
  created_by: string
  created_at: string
  updated_at: string
  last_message_id: string | null
  is_archived: boolean
  pinned_message_id: string | null
  other_user?: Profile
  last_message?: Message
  unread_count?: number
  members?: ConversationMember[]
}

export interface ConversationMember {
  id: string
  conversation_id: string
  user_id: string
  role: 'admin' | 'member'
  joined_at: string
  last_read_at: string | null
  is_muted: boolean
  profile?: Profile
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string | null
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'gif'
  media_url: string | null
  media_thumbnail: string | null
  media_size: number | null
  media_name: string | null
  reply_to_id: string | null
  is_edited: boolean
  is_deleted: boolean
  deleted_for: string[]
  created_at: string
  updated_at: string
  metadata: Record<string, unknown>
  sender?: Profile
  reply_to?: Message
  reactions?: MessageReaction[]
  reads?: MessageRead[]
}

export interface MessageReaction {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
  profile?: Profile
}

export interface MessageRead {
  id: string
  message_id: string
  user_id: string
  read_at: string
  profile?: Profile
}

export interface Notification {
  id: string
  user_id: string
  type: 'friend_request' | 'message' | 'reaction' | 'system'
  title: string
  body: string
  data: Record<string, unknown>
  is_read: boolean
  created_at: string
}

export interface BlockedUser {
  id: string
  blocker_id: string
  blocked_id: string
  created_at: string
  blocked_profile?: Profile
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'gif'
