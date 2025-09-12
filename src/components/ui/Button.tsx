import { ButtonHTMLAttributes, forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn, touchFeedback, animations, vibrateDevice } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary-600 text-white hover:bg-primary-700",
        destructive:
          "bg-red-600 text-white hover:bg-red-700",
        outline:
          "border border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200",
        ghost: "hover:bg-gray-100 hover:text-gray-900",
        link: "text-primary-600 underline-offset-4 hover:underline",
        success: "bg-green-600 text-white hover:bg-green-700",
        warning: "bg-orange-500 text-white hover:bg-orange-600",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-xl px-4",
        lg: "h-14 rounded-xl px-8",
        xl: "h-16 rounded-xl px-10 text-xl font-semibold",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  hapticFeedback?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false,
    isLoading, 
    children, 
    disabled, 
    leftIcon,
    rightIcon,
    hapticFeedback = false,
    onClick,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (hapticFeedback) {
        vibrateDevice(10)
      }
      onClick?.(e)
    }

    const loadingSpinnerSizes = {
      default: 'h-4 w-4',
      sm: 'h-3 w-3', 
      lg: 'h-5 w-5',
      xl: 'h-6 w-6',
      icon: 'h-4 w-4',
    }

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          // Enhanced mobile-first interactions
          'relative transition-all duration-200 ease-out transform-gpu',
          'min-h-touch min-w-touch',
          touchFeedback.button,
          'hover:scale-[1.02] active:scale-[0.98]',
          'hover:-translate-y-0.5 active:translate-y-0',
          'shadow-sm hover:shadow-md',
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
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export { Button }