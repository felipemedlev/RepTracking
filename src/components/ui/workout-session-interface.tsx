"use client"

import * as React from "react"
import { 
  Play, 
  Pause, 
  Check, 
  Plus, 
  Timer, 
  Dumbbell, 
  Target, 
  TrendingUp,
  MoreHorizontal,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./Button"
import { Card, CardContent, CardHeader, CardTitle } from "./Card"
import { WorkoutTimer } from "./workout-timer"
import { SetInput } from "./set-input"
import { ExerciseCard } from "./exercise-card"
import { Badge } from "./Badge"
import { Progress } from "./Progress"
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "./sheet"
import { useToast } from "./use-toast"

interface WorkoutSet {
  id: string
  weight?: number
  reps?: number
  time?: number
  completed: boolean
  restTime?: number
}

interface Exercise {
  id: string
  name: string
  category: string
  sets: WorkoutSet[]
  targetSets: number
  targetReps?: number
  targetWeight?: number
  restTime: number
  notes?: string
  isActive: boolean
  isCompleted: boolean
}

interface WorkoutSessionInterfaceProps {
  workoutName: string
  exercises: Exercise[]
  onUpdateSet: (exerciseId: string, setId: string, data: Partial<WorkoutSet>) => void
  onCompleteSet: (exerciseId: string, setId: string) => void
  onAddSet: (exerciseId: string) => void
  onStartExercise: (exerciseId: string) => void
  onCompleteExercise: (exerciseId: string) => void
  onEndWorkout: () => void
  sessionStartTime: Date
}

export function WorkoutSessionInterface({
  workoutName,
  exercises,
  onUpdateSet,
  onCompleteSet,
  onAddSet,
  onStartExercise,
  onCompleteExercise,
  onEndWorkout,
  sessionStartTime
}: WorkoutSessionInterfaceProps) {
  const { toast } = useToast()
  const [currentExerciseId, setCurrentExerciseId] = React.useState<string | null>(null)
  const [restTimerVisible, setRestTimerVisible] = React.useState(false)
  const [sessionDuration, setSessionDuration] = React.useState(0)

  const currentExercise = exercises.find(ex => ex.id === currentExerciseId)
  const completedExercises = exercises.filter(ex => ex.isCompleted).length
  const totalSets = exercises.reduce((total, ex) => total + ex.sets.length, 0)
  const completedSets = exercises.reduce((total, ex) => total + ex.sets.filter(set => set.completed).length, 0)
  const workoutProgress = exercises.length > 0 ? (completedExercises / exercises.length) * 100 : 0

  // Update session duration every second
  React.useEffect(() => {
    const interval = setInterval(() => {
      setSessionDuration(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [sessionStartTime])

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleCompleteSet = (exerciseId: string, setId: string) => {
    onCompleteSet(exerciseId, setId)
    
    // Show rest timer after completing a set
    const exercise = exercises.find(ex => ex.id === exerciseId)
    if (exercise && exercise.restTime > 0) {
      setRestTimerVisible(true)
      toast({
        title: "Set Complete! 💪",
        description: `Rest for ${exercise.restTime} seconds`,
        variant: "success"
      })
    }
  }

  const handleStartExercise = (exerciseId: string) => {
    setCurrentExerciseId(exerciseId)
    onStartExercise(exerciseId)
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header with session stats */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200 safe-area-inset">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{workoutName}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center space-x-1">
                  <Timer className="h-4 w-4" />
                  <span>{formatDuration(sessionDuration)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="h-4 w-4" />
                  <span>{completedSets}/{totalSets} sets</span>
                </div>
              </div>
            </div>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom">
                <SheetHeader>
                  <SheetTitle>Session Settings</SheetTitle>
                  <SheetDescription>
                    Adjust your workout session preferences
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 mt-6">
                  <Button 
                    variant="destructive" 
                    onClick={onEndWorkout}
                    className="w-full"
                  >
                    End Workout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Workout Progress</span>
              <span>{Math.round(workoutProgress)}%</span>
            </div>
            <Progress value={workoutProgress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Rest timer overlay */}
      {restTimerVisible && currentExercise && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            <WorkoutTimer
              initialSeconds={currentExercise.restTime}
              variant="rest"
              autoStart
              onComplete={() => {
                setRestTimerVisible(false)
                toast({
                  title: "Rest Complete!",
                  description: "Ready for your next set",
                  variant: "success"
                })
              }}
            />
            <Button 
              variant="outline" 
              onClick={() => setRestTimerVisible(false)}
              className="w-full mt-4"
            >
              Skip Rest
            </Button>
          </div>
        </div>
      )}

      {/* Exercises list */}
      <div className="px-4 py-6 space-y-4">
        {exercises.map((exercise, index) => (
          <Card key={exercise.id} 
            variant={exercise.isActive ? "primary" : exercise.isCompleted ? "success" : "default"}
            className="overflow-hidden"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {index + 1}
                    </Badge>
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    {exercise.isActive && (
                      <Badge className="animate-pulse">
                        Active
                      </Badge>
                    )}
                    {exercise.isCompleted && (
                      <Badge variant="success">
                        ✓ Complete
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{exercise.category}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Exercise stats */}
              <div className="flex justify-between text-sm">
                <div className="flex items-center space-x-4">
                  {exercise.targetWeight && (
                    <div className="flex items-center space-x-1 text-blue-600">
                      <Dumbbell className="h-3 w-3" />
                      <span>{exercise.targetWeight} lbs</span>
                    </div>
                  )}
                  {exercise.targetReps && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>{exercise.targetReps} reps</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1 text-orange-600">
                    <Timer className="h-3 w-3" />
                    <span>{exercise.restTime}s rest</span>
                  </div>
                </div>
              </div>

              {/* Sets */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Sets</h4>
                {exercise.sets.map((set, setIndex) => (
                  <Card key={set.id} className={cn(
                    "p-4 transition-all duration-200",
                    set.completed ? "bg-green-50 border-green-200" : "bg-white"
                  )}>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={set.completed ? "success" : "secondary"}>
                        Set {setIndex + 1}
                      </Badge>
                      {set.completed && <Check className="h-4 w-4 text-green-600" />}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <SetInput
                        label="Weight"
                        value={set.weight || ''}
                        onChange={(value) => onUpdateSet(exercise.id, set.id, { weight: Number(value) })}
                        type="weight"
                        unit="lbs"
                        disabled={set.completed}
                      />
                      <SetInput
                        label="Reps"
                        value={set.reps || ''}
                        onChange={(value) => onUpdateSet(exercise.id, set.id, { reps: Number(value) })}
                        type="reps"
                        disabled={set.completed}
                      />
                    </div>
                    
                    {!set.completed && (
                      <Button
                        onClick={() => handleCompleteSet(exercise.id, set.id)}
                        disabled={!set.weight || !set.reps}
                        className="w-full"
                        size="lg"
                        hapticFeedback
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Complete Set
                      </Button>
                    )}
                  </Card>
                ))}
                
                {/* Add set button */}
                {!exercise.isCompleted && (
                  <Button
                    onClick={() => onAddSet(exercise.id)}
                    variant="outline"
                    className="w-full h-12 border-dashed"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Set
                  </Button>
                )}
              </div>

              {/* Exercise actions */}
              <div className="pt-4 border-t">
                {!exercise.isCompleted ? (
                  !exercise.isActive ? (
                    <Button
                      onClick={() => handleStartExercise(exercise.id)}
                      className="w-full"
                      size="lg"
                      leftIcon={<Play className="h-4 w-4" />}
                      hapticFeedback
                    >
                      Start Exercise
                    </Button>
                  ) : (
                    <Button
                      onClick={() => onCompleteExercise(exercise.id)}
                      variant="success"
                      className="w-full"
                      size="lg"
                      leftIcon={<Check className="h-4 w-4" />}
                      hapticFeedback
                    >
                      Complete Exercise
                    </Button>
                  )
                ) : (
                  <div className="text-center py-2">
                    <Badge variant="success" className="text-sm">
                      ✅ Exercise Complete
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Floating action button for ending workout */}
      {completedExercises === exercises.length && (
        <div className="fixed bottom-20 right-4 z-30">
          <Button
            onClick={onEndWorkout}
            size="lg"
            className="rounded-full shadow-2xl animate-bounce"
            hapticFeedback
          >
            🎉 Finish Workout
          </Button>
        </div>
      )}
    </div>
  )
}