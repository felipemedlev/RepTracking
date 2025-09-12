"use client"

import * as React from "react"
import { MoreVertical, Play, Clock, Target, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "./Card"
import { Button } from "./Button"
import { Badge } from "./Badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu"

interface ExerciseSet {
  weight?: number
  reps?: number
  time?: number
  distance?: number
  completed?: boolean
}

interface ExerciseCardProps {
  name: string
  category?: string
  sets: ExerciseSet[]
  targetSets?: number
  targetReps?: number
  targetWeight?: number
  restTime?: number
  notes?: string
  isActive?: boolean
  isCompleted?: boolean
  onStart?: () => void
  onComplete?: () => void
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

export function ExerciseCard({
  name,
  category,
  sets = [],
  targetSets,
  targetReps,
  targetWeight,
  restTime,
  notes,
  isActive = false,
  isCompleted = false,
  onStart,
  onComplete,
  onEdit,
  onDelete,
  className
}: ExerciseCardProps) {
  const completedSets = sets.filter(set => set.completed).length
  const totalSets = sets.length || targetSets || 0
  const progressPercentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0

  const formatWeight = (weight?: number) => {
    if (!weight) return 'BW'
    return weight % 1 === 0 ? `${weight} lbs` : `${weight.toFixed(1)} lbs`
  }

  const getCardVariant = () => {
    if (isCompleted) return 'success'
    if (isActive) return 'primary'
    return 'default'
  }

  const getProgressColor = () => {
    if (isCompleted) return 'bg-green-500'
    if (progressPercentage > 75) return 'bg-blue-500'
    if (progressPercentage > 50) return 'bg-yellow-500'
    return 'bg-gray-300'
  }

  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        isActive && "ring-2 ring-primary shadow-lg scale-[1.02]",
        isCompleted && "bg-green-50 border-green-200",
        className
      )}
      variant={getCardVariant()}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-lg text-gray-900 truncate">
                {name}
              </h3>
              {isActive && (
                <Badge variant="primary" className="text-xs animate-pulse">
                  Active
                </Badge>
              )}
              {isCompleted && (
                <Badge variant="success" className="text-xs">
                  ✓ Done
                </Badge>
              )}
            </div>
            
            {category && (
              <p className="text-sm text-muted-foreground mb-2">{category}</p>
            )}

            {/* Progress bar */}
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    getProgressColor()
                  )}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600 min-w-max">
                {completedSets}/{totalSets} sets
              </span>
            </div>
          </div>

          {/* Action menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  Edit Exercise
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  Remove
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Target/Stats Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            {targetWeight && (
              <div className="flex items-center space-x-1 text-blue-600">
                <Target className="h-3 w-3" />
                <span>{formatWeight(targetWeight)}</span>
              </div>
            )}
            {targetReps && (
              <div className="flex items-center space-x-1 text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>{targetReps} reps</span>
              </div>
            )}
            {restTime && (
              <div className="flex items-center space-x-1 text-orange-600">
                <Clock className="h-3 w-3" />
                <span>{restTime}s</span>
              </div>
            )}
          </div>
        </div>

        {/* Sets preview */}
        {sets.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Sets</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sets.slice(0, 6).map((set, index) => (
                <div 
                  key={index}
                  className={cn(
                    "p-2 rounded-lg border text-center text-xs",
                    set.completed 
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  )}
                >
                  <div className="font-medium">
                    {set.weight ? formatWeight(set.weight) : 'BW'}
                  </div>
                  <div>
                    {set.reps && `${set.reps} reps`}
                    {set.time && `${set.time}s`}
                    {set.distance && `${set.distance}m`}
                  </div>
                </div>
              ))}
              {sets.length > 6 && (
                <div className="p-2 rounded-lg border-2 border-dashed border-gray-300 text-center text-xs text-gray-500 flex items-center justify-center">
                  +{sets.length - 6} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="p-2 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">{notes}</p>
          </div>
        )}

        {/* Action button */}
        <div className="pt-2">
          {!isCompleted ? (
            <Button
              onClick={isActive ? onComplete : onStart}
              className="w-full"
              size="lg"
              variant={isActive ? "success" : "default"}
              leftIcon={<Play className="h-4 w-4" />}
              hapticFeedback
            >
              {isActive ? "Complete Set" : "Start Exercise"}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              disabled
            >
              Exercise Complete ✓
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}