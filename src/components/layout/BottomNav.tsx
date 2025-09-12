'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn, touchFeedback, vibrateDevice } from '@/lib/utils'

const navItems = [
  { 
    href: '/', 
    label: 'Home', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  { 
    href: '/workouts', 
    label: 'Workouts', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )
  },
  { 
    href: '/session', 
    label: 'Session', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    )
  },
  { 
    href: '/progress', 
    label: 'Progress', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  { 
    href: '/profile', 
    label: 'Profile', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
]

export function BottomNav() {
  const pathname = usePathname()

  const handleNavClick = () => {
    vibrateDevice(5) // Subtle haptic feedback
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/50 shadow-2xl safe-area-inset z-50">
      <div className="flex justify-around items-center h-nav px-2">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                'relative flex flex-col items-center justify-center space-y-1 py-3 px-4 rounded-2xl',
                'transition-all duration-300 ease-out',
                'min-h-touch min-w-touch', // Touch target
                touchFeedback.subtle,
                isActive 
                  ? 'text-primary-600 bg-primary-50 shadow-sm scale-105' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:scale-105'
              )}
              style={{
                animationDelay: `${index * 50}ms`, // Staggered entrance
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full animate-pulse" />
              )}
              
              {/* Icon with enhanced animations */}
              <div className={cn(
                'relative transition-all duration-300 ease-out',
                isActive ? 'scale-110 -translate-y-0.5' : 'scale-100 translate-y-0'
              )}>
                {item.icon}
                
                {/* Subtle glow effect for active icon */}
                {isActive && (
                  <div className="absolute inset-0 bg-primary-200/30 rounded-lg blur-sm -z-10 animate-pulse" />
                )}
              </div>
              
              {/* Label with smooth transitions */}
              <span className={cn(
                'text-xs font-medium transition-all duration-300 ease-out',
                isActive ? 'font-semibold scale-105' : 'scale-100'
              )}>
                {item.label}
              </span>
              
              {/* Ripple effect overlay */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-primary-400/10 opacity-0 hover:opacity-100 active:opacity-50 transition-opacity duration-200 rounded-2xl" />
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}