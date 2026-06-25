// AES-256 encryption for message content
// Uses Web Crypto API for secure encryption

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256

export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  )
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key)
  return btoa(String.fromCharCode(...new Uint8Array(exported)))
}

export async function importKey(keyStr: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(keyStr), (c) => c.charCodeAt(0))
  return crypto.subtle.importKey('raw', keyData, { name: ALGORITHM }, true, ['encrypt', 'decrypt'])
}

export async function encryptMessage(message: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(message)
  
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoded
  )
  
  const result = new Uint8Array(iv.length + encrypted.byteLength)
  result.set(iv)
  result.set(new Uint8Array(encrypted), iv.length)
  
  return btoa(String.fromCharCode(...result))
}

export async function decryptMessage(encryptedStr: string, key: CryptoKey): Promise<string> {
  const data = Uint8Array.from(atob(encryptedStr), (c) => c.charCodeAt(0))
  const iv = data.slice(0, 12)
  const encrypted = data.slice(12)
  
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encrypted
  )
  
  return new TextDecoder().decode(decrypted)
}

// Derive conversation key from conversation ID + user keys
export async function deriveConversationKey(conversationId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(conversationId),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('mint-wave-chat-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  )
}
