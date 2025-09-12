import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: "sm" | "default" | "lg" | "xl"
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = "default", ...props }, ref) => {
    const sizes = {
      sm: "h-8 w-8",
      default: "h-10 w-10", 
      lg: "h-12 w-12",
      xl: "h-16 w-16",
    }

    const textSizes = {
      sm: "text-xs",
      default: "text-sm",
      lg: "text-base", 
      xl: "text-lg",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full",
          sizes[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            className="aspect-square h-full w-full object-cover"
            src={src}
            alt={alt}
          />
        ) : (
          <div className={cn(
            "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 font-semibold text-primary-50",
            textSizes[size]
          )}>
            {fallback}
          </div>
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

export { Avatar }