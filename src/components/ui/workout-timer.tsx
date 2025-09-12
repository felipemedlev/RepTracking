"use client"

import * as React from "react"
import { Play, Pause, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./Button"
import { Card } from "./Card"

interface WorkoutTimerProps {
  initialSeconds?: number
  autoStart?: boolean
  onComplete?: () => void
  variant?: 'rest' | 'exercise' | 'stopwatch'
  className?: string
}

export function WorkoutTimer({
  initialSeconds = 90,
  autoStart = false,
  onComplete,
  variant = 'rest',
  className
}: WorkoutTimerProps) {
  const [seconds, setSeconds] = React.useState(initialSeconds)
  const [isRunning, setIsRunning] = React.useState(autoStart)
  const [isCompleted, setIsCompleted] = React.useState(false)

  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsCompleted(true)
            onComplete?.()
            // Haptic feedback for completion
            if ('vibrate' in navigator) {
              navigator.vibrate([100, 50, 100, 50, 100])
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, seconds, onComplete])

  const toggleTimer = () => {
    setIsRunning(!isRunning)
    setIsCompleted(false)
  }

  const resetTimer = () => {
    setSeconds(initialSeconds)
    setIsRunning(false)
    setIsCompleted(false)
  }

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'rest':
        return {
          card: "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100",
          timer: "text-blue-900",
          glow: seconds <= 10 && isRunning ? "timer-glow shadow-blue-500/50" : "",
          progress: "stroke-blue-500"
        }
      case 'exercise':
        return {
          card: "border-green-200 bg-gradient-to-br from-green-50 to-green-100",
          timer: "text-green-900",
          glow: seconds <= 10 && isRunning ? "timer-glow shadow-green-500/50" : "",
          progress: "stroke-green-500"
        }
      default:
        return {
          card: "border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100",
          timer: "text-gray-900",
          glow: "",
          progress: "stroke-gray-500"
        }
    }
  }

  const styles = getVariantStyles()
  const progress = ((initialSeconds - seconds) / initialSeconds) * 100

  return (
    <Card className={cn("p-6 text-center", styles.card, styles.glow, className)}>
      {/* Circular Progress */}
      <div className="relative mx-auto mb-6 h-32 w-32">
        <svg className="h-32 w-32 -rotate-90 transform" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className={cn("transition-all duration-1000 ease-linear", styles.progress)}
            strokeDasharray={`${progress * 2.827} ${282.7 - (progress * 2.827)}`}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Timer display */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center text-3xl font-bold",
          styles.timer,
          isCompleted && "animate-pulse"
        )}>
          {formatTime(seconds)}
        </div>
      </div>

      {/* Status text */}
      <div className="mb-4 text-sm font-medium text-muted-foreground">
        {isCompleted ? (
          <span className="text-green-600 font-semibold">Complete! 🎉</span>
        ) : isRunning ? (
          <span>Timer running...</span>
        ) : (
          <span>Timer paused</span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-3">
        <Button
          size="icon"
          variant={isRunning ? "secondary" : "default"}
          onClick={toggleTimer}
          className="h-12 w-12"
          hapticFeedback
        >
          {isRunning ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>
        
        <Button
          size="icon"
          variant="outline"
          onClick={resetTimer}
          className="h-12 w-12"
          hapticFeedback
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>

      {/* Quick time adjustments */}
      <div className="mt-4 flex justify-center space-x-2">
        {[30, 60, 90, 120, 180].map((time) => (
          <Button
            key={time}
            size="sm"
            variant="ghost"
            onClick={() => {
              setSeconds(time)
              setIsCompleted(false)
              if (isRunning) setIsRunning(false)
            }}
            className={cn(
              "h-8 px-2 text-xs",
              time === initialSeconds && "bg-accent"
            )}
          >
            {time}s
          </Button>
        ))}
      </div>
    </Card>
  )
}