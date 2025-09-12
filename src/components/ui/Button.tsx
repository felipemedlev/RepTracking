import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn, touchFeedback, animations, vibrateDevice } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning'
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xl'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  hapticFeedback?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'default', 
    isLoading, 
    children, 
    disabled, 
    leftIcon,
    rightIcon,
    hapticFeedback = false,
    onClick,
    ...props 
  }, ref) => {
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (hapticFeedback) {
        vibrateDevice(10)
      }
      onClick?.(e)
    }

    const variants = {
      default: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm hover:shadow-md',
      destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm hover:shadow-md',
      outline: 'border-2 border-gray-300 bg-transparent hover:bg-gray-50 active:bg-gray-100 text-gray-900 hover:border-gray-400',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 shadow-sm',
      ghost: 'hover:bg-gray-100 active:bg-gray-200 text-gray-700 hover:text-gray-900',
      link: 'text-primary-600 underline-offset-4 hover:underline hover:text-primary-700 p-0 h-auto',
      success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm hover:shadow-md',
      warning: 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 shadow-sm hover:shadow-md',
    }

    const sizes = {
      default: 'h-12 px-6 py-3 text-base font-medium',
      sm: 'h-10 px-4 py-2 text-sm font-medium',
      lg: 'h-14 px-8 py-4 text-lg font-semibold',
      xl: 'h-16 px-10 py-5 text-xl font-semibold',
      icon: 'h-12 w-12 p-0',
    }

    const loadingSpinnerSizes = {
      default: 'h-4 w-4',
      sm: 'h-3 w-3', 
      lg: 'h-5 w-5',
      xl: 'h-6 w-6',
      icon: 'h-4 w-4',
    }

    return (
      <button
        className={cn(
          // Base styles with improved animations and interactions
          'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
          'transform-gpu', // Hardware acceleration
          
          // Mobile-first touch targets and feedback
          'min-h-touch min-w-touch',
          touchFeedback.button,
          
          // Interactive states with enhanced visual feedback
          'hover:scale-[1.02] active:scale-[0.98]',
          'hover:-translate-y-0.5 active:translate-y-0',
          
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        onClick={handleClick}
        {...props}
      >
        {/* Loading spinner with smooth entrance */}
        {isLoading && (
          <div className={cn(
            'animate-spin rounded-full border-2 border-current border-t-transparent',
            animations.scaleIn,
            loadingSpinnerSizes[size]
          )} />
        )}
        
        {/* Left icon with proper spacing */}
        {leftIcon && !isLoading && (
          <span className="flex-shrink-0">
            {leftIcon}
          </span>
        )}
        
        {/* Button content */}
        <span className={cn(
          'flex-1',
          isLoading && 'opacity-70'
        )}>
          {children}
        </span>
        
        {/* Right icon with proper spacing */}
        {rightIcon && !isLoading && (
          <span className="flex-shrink-0">
            {rightIcon}
          </span>
        )}

        {/* Subtle ripple effect overlay */}
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 active:opacity-20 transition-opacity duration-200" />
        </div>
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }