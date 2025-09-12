import { HTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn, touchFeedback, animations } from '@/lib/utils'

const cardVariants = cva(
  "rounded-2xl transition-all duration-200 ease-out backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "border border-gray-200 bg-white text-gray-900 shadow-sm",
        elevated: "border-0 bg-white shadow-lg shadow-black/5",
        outlined: "border-2 border-gray-300 bg-white shadow-none",
        interactive: "border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-gray-300 cursor-pointer",
        primary: "border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10",
        success: "border border-green-200 bg-gradient-to-br from-green-50 to-green-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface CardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant }),
          // Enhanced interactivity
          hover && 'hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02]',
          hover && touchFeedback.card,
          // Animation entrance
          animations.fadeInUp,
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  spacing?: 'default' | 'tight' | 'loose'
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, spacing = 'default', ...props }, ref) => {
    const spacings = {
      default: 'space-y-2 p-6',
      tight: 'space-y-1 p-4',
      loose: 'space-y-3 p-8',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col',
          spacings[spacing],
          className
        )}
        {...props}
      />
    )
  }
)
CardHeader.displayName = 'CardHeader'

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  size?: 'sm' | 'default' | 'lg' | 'xl'
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, size = 'default', ...props }, ref) => {
    const sizes = {
      sm: 'text-base font-semibold',
      default: 'text-lg font-semibold',
      lg: 'text-xl font-bold', 
      xl: 'text-2xl font-bold',
    }

    return (
      <h3
        ref={ref}
        className={cn(
          'leading-tight tracking-tight text-gray-900',
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm leading-relaxed text-gray-600', className)}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  spacing?: 'default' | 'tight' | 'loose'
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, spacing = 'default', ...props }, ref) => {
    const spacings = {
      default: 'px-6 pb-6',
      tight: 'px-4 pb-4',
      loose: 'px-8 pb-8',
    }

    return (
      <div 
        ref={ref} 
        className={cn(
          spacings[spacing],
          className
        )} 
        {...props} 
      />
    )
  }
)
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-between px-6 py-4',
        'border-t border-gray-100 bg-gray-50/50 rounded-b-2xl',
        className
      )}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

// New specialized card components for common patterns
interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon?: React.ReactNode
}

const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, subtitle, trend, trendValue, icon, ...props }, ref) => (
    <Card ref={ref} variant="elevated" hover className="text-center" {...props}>
      <CardContent spacing="loose">
        {icon && (
          <div className="mb-3 flex justify-center">
            <div className="p-2 rounded-full bg-primary-50 text-primary-600">
              {icon}
            </div>
          </div>
        )}
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="text-sm font-medium text-gray-700 mb-1">{title}</div>
        {subtitle && (
          <div className="text-xs text-gray-500">{subtitle}</div>
        )}
        {trend && trendValue && (
          <div className={cn(
            'mt-2 text-xs font-medium flex items-center justify-center gap-1',
            trend === 'up' && 'text-green-600',
            trend === 'down' && 'text-red-600', 
            trend === 'neutral' && 'text-gray-600'
          )}>
            {trend === 'up' && '↗'}
            {trend === 'down' && '↘'}
            {trend === 'neutral' && '→'}
            {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  )
)
StatCard.displayName = 'StatCard'

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  StatCard 
}