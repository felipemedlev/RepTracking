"use client"

import * as React from "react"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./Button"
import { Input } from "./Input"

interface SetInputProps {
  label: string
  value: number | string
  onChange: (value: number | string) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  disabled?: boolean
  placeholder?: string
  type?: 'weight' | 'reps' | 'time' | 'distance'
  className?: string
}

export function SetInput({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  unit,
  disabled = false,
  placeholder,
  type = 'reps',
  className
}: SetInputProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  
  const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value
  
  const increment = () => {
    const newValue = numericValue + step
    if (!max || newValue <= max) {
      onChange(newValue)
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10)
      }
    }
  }

  const decrement = () => {
    const newValue = numericValue - step
    if (newValue >= min) {
      onChange(newValue)
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    if (type === 'weight' || type === 'distance') {
      // Allow decimal values
      onChange(inputValue)
    } else {
      // Integer values only
      const parsed = parseInt(inputValue) || 0
      onChange(parsed)
    }
  }

  const getTypeStyles = () => {
    switch (type) {
      case 'weight':
        return {
          bg: "bg-gradient-to-r from-blue-50 to-indigo-50",
          border: "border-blue-200 focus-within:border-blue-400",
          button: "text-blue-600 hover:bg-blue-100"
        }
      case 'reps':
        return {
          bg: "bg-gradient-to-r from-green-50 to-emerald-50", 
          border: "border-green-200 focus-within:border-green-400",
          button: "text-green-600 hover:bg-green-100"
        }
      case 'time':
        return {
          bg: "bg-gradient-to-r from-orange-50 to-yellow-50",
          border: "border-orange-200 focus-within:border-orange-400", 
          button: "text-orange-600 hover:bg-orange-100"
        }
      case 'distance':
        return {
          bg: "bg-gradient-to-r from-purple-50 to-pink-50",
          border: "border-purple-200 focus-within:border-purple-400",
          button: "text-purple-600 hover:bg-purple-100"
        }
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200 focus-within:border-gray-400",
          button: "text-gray-600 hover:bg-gray-100"
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div className={cn(
        "flex items-center rounded-xl border-2 transition-all duration-200",
        styles.bg,
        styles.border,
        disabled && "opacity-50 cursor-not-allowed",
        isFocused && "shadow-md scale-[1.02]"
      )}>
        {/* Decrement button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={decrement}
          disabled={disabled || numericValue <= min}
          className={cn(
            "h-12 w-12 rounded-l-xl rounded-r-none border-0 flex-shrink-0",
            styles.button
          )}
          hapticFeedback
        >
          <Minus className="h-4 w-4" />
        </Button>

        {/* Input field */}
        <div className="flex-1 relative">
          <Input
            type="number"
            value={value}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className={cn(
              "border-0 bg-transparent text-center text-lg font-semibold h-12 rounded-none focus:ring-0 focus:border-0",
              "focus-visible:ring-0 focus-visible:ring-offset-0"
            )}
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
              {unit}
            </span>
          )}
        </div>

        {/* Increment button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={increment}
          disabled={disabled || (max !== undefined && numericValue >= max)}
          className={cn(
            "h-12 w-12 rounded-r-xl rounded-l-none border-0 flex-shrink-0",
            styles.button
          )}
          hapticFeedback
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick increment buttons for weight */}
      {type === 'weight' && (
        <div className="flex justify-center space-x-1">
          {[2.5, 5, 10, 25, 45].map((increment) => (
            <Button
              key={increment}
              size="sm"
              variant="ghost"
              onClick={() => onChange(numericValue + increment)}
              disabled={disabled}
              className="h-7 px-2 text-xs"
            >
              +{increment}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}