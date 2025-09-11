'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title: string
  subtitle?: string
  leftAction?: ReactNode
  rightAction?: ReactNode
  className?: string
}

export function Header({ title, subtitle, leftAction, rightAction, className }: HeaderProps) {
  return (
    <header className={cn(
      'sticky top-0 z-40 bg-white border-b border-gray-200 safe-area-inset',
      className
    )}>
      <div className="flex items-center justify-between h-header px-4">
        <div className="flex items-center space-x-3">
          {leftAction}
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600 truncate">{subtitle}</p>
            )}
          </div>
        </div>
        
        {rightAction && (
          <div className="flex items-center space-x-2">
            {rightAction}
          </div>
        )}
      </div>
    </header>
  )
}

export function BackButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="rounded-full"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </Button>
  )
}