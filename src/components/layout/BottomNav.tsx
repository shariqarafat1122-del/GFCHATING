import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageCircle, Search, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/home', icon: MessageCircle, label: 'Chats' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/notifications', icon: Bell, label: 'Alerts' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
  const location = useLocation()

  // Hide nav in chat screen
  if (location.pathname.startsWith('/chat/')) return null

  return (
    <div className="bg-white border-t border-[#E5F4F1] safe-area-bottom shadow-lg shadow-black/5">
      <nav className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || 
            (to === '/home' && location.pathname === '/')
          
          return (
            <NavLink
              key={to}
              to={to}
              className="relative flex flex-col items-center gap-1 px-4 py-2 min-w-[56px]"
            >
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-[#10B981]/10 to-[#06B6D4]/10"
                    transition={{ type: 'spring', duration: 0.4 }}
                  />
                )}
                <Icon
                  className={cn(
                    'relative h-5 w-5 transition-colors duration-150',
                    isActive
                      ? 'text-[#10B981]'
                      : 'text-[#64748B]'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span
                className={cn(
                  'text-[10px] font-semibold transition-colors duration-150',
                  isActive ? 'text-[#10B981]' : 'text-[#64748B]'
                )}
              >
                {label}
              </span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
