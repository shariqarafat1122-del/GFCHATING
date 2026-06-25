import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMessageTime(date: string | Date): string {
  const d = new Date(date)
  if (isToday(d)) {
    return format(d, 'HH:mm')
  } else if (isYesterday(d)) {
    return 'Yesterday'
  } else {
    return format(d, 'dd/MM/yyyy')
  }
}

export function formatLastSeen(date: string | Date): string {
  const d = new Date(date)
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

export function generateInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export function isValidUrl(str: string): boolean {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function getAvatarColor(userId: string): string {
  const colors = [
    '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6',
    '#EC4899', '#F59E0B', '#EF4444', '#14B8A6',
  ]
  const index = userId.charCodeAt(0) % colors.length
  return colors[index]
}

export async function compressImage(file: File, maxSizeKB = 500): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      let { width, height } = img
      const maxDim = 1200
      
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = (height * maxDim) / width
          width = maxDim
        } else {
          width = (width * maxDim) / height
          height = maxDim
        }
      }
      
      canvas.width = width
      canvas.height = height
      ctx?.drawImage(img, 0, 0, width, height)
      
      let quality = 0.9
      const compress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Compression failed'))
            if (blob.size / 1024 > maxSizeKB && quality > 0.3) {
              quality -= 0.1
              compress()
            } else {
              resolve(blob)
            }
          },
          'image/jpeg',
          quality
        )
      }
      compress()
    }
    
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export function formatConversationTime(date: string): string {
  const d = new Date(date)
  if (isToday(d)) return format(d, 'HH:mm')
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'dd/MM/yy')
}
