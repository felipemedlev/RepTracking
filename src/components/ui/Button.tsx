import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      default: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
      destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
      outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-900',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
      ghost: 'hover:bg-gray-100 hover:text-gray-900',
      link: 'text-primary-600 underline-offset-4 hover:underline',
    }

    const sizes = {
      default: 'h-12 px-6 py-3 text-base',
      sm: 'h-10 px-4 py-2 text-sm',
      lg: 'h-14 px-8 py-4 text-lg',
      icon: 'h-12 w-12',
    }

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          'min-h-touch min-w-touch', // Mobile touch targets
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }