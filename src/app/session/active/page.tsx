'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header, BackButton } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface Exercise {
  id: string
  name: string
  category: string
}

interface WorkoutExercise {
  id: string
  exercise: Exercise
  targetSets: number
  targetReps: number
  restSeconds: number
  order: number
}

interface Set {
  id: string
  exerciseId: string
  reps: number
  weight?: number
  restTime?: number
  createdAt: string
}

interface WorkoutSession {
  id: string
  startedAt: string
  completedAt?: string
  workoutPlan: {
    name: string
    workoutExercises: WorkoutExercise[]
  }
  sets: Set[]
}

interface PreviousSession {
  sessionId: string
  date: string
  workoutPlan: string
  sets: {
    reps: number
    weight?: number
  }[]
  maxWeight: number
  totalSets: number
  totalReps: number
}

export default function SessionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan')
  
  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSetData, setCurrentSetData] = useState({
    reps: '',
    weight: ''
  })
  const [restTimer, setRestTimer] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submittingSet, setSubmittingSet] = useState(false)
  const [previousSessions, setPreviousSessions] = useState<PreviousSession[]>([])
  const [showPreviousData, setShowPreviousData] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [customRestTime, setCustomRestTime] = useState<number | null>(null)
  const [notification, setNotification] = useState<{ type: 'error' | 'success' | 'info', message: string } | null>(null)
  const timerRef = useRef<NodeJS.Timeout>()
  const notificationTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (planId) {
      startWorkoutSession()
    } else {
      router.push('/workouts')
    }

    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission)
      })
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current)
      }
    }
  }, [planId, router])

  useEffect(() => {
    if (isResting && restTimer > 0) {
      timerRef.current = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            // Get current exercise name for notification
            const currentExercise = session?.workoutPlan.workoutExercises[currentExerciseIndex]
            const exerciseName = currentExercise?.exercise.name || 'your exercise'
            
            // Trigger notifications and vibration
            onRestComplete(exerciseName)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isResting, restTimer, session, currentExerciseIndex])

  useEffect(() => {
    if (session && session.workoutPlan.workoutExercises.length > 0) {
      fetchPreviousSessionData()
    }
  }, [currentExerciseIndex, session])

  // Crumble notification functions
  const showNotification = (type: 'error' | 'success' | 'info', message: string) => {
    setNotification({ type, message })
    
    // Clear existing timeout
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current)
    }
    
    // Auto-hide after 3 seconds
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  const dismissNotification = () => {
    setNotification(null)
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current)
    }
  }

  // Vibration and notification functions
  const triggerVibration = () => {
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      // Pattern: vibrate for 200ms, pause 100ms, vibrate 200ms, pause 100ms, vibrate 200ms
      navigator.vibrate([200, 100, 200, 100, 200])
    }
  }

  const showRestCompleteNotification = (exerciseName: string) => {
    if (notificationPermission === 'granted') {
      const notification = new Notification('Rest Complete! 💪', {
        body: `Time to continue with ${exerciseName}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'rest-complete',
        silent: false,
        requireInteraction: true
      })
      
      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000)
    }
  }

  const onRestComplete = (exerciseName: string) => {
    // Trigger vibration
    triggerVibration()
    
    // Show notification
    showRestCompleteNotification(exerciseName)
    
    // Reset rest state
    setIsResting(false)
    setRestTimer(0)
  }

  const fetchPreviousSessionData = async () => {
    if (!session) return
    
    const currentExercise = session.workoutPlan.workoutExercises[currentExerciseIndex]
    try {
      const response = await fetch(`/api/exercises/${currentExercise.exercise.id}/previous-sessions?limit=3`)
      if (response.ok) {
        const data = await response.json()
        setPreviousSessions(data)
      }
    } catch (error) {
      console.error('Error fetching previous session data:', error)
    }
  }

  const startWorkoutSession = async () => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutPlanId: planId,
        }),
      })

      if (response.ok) {
        const sessionData = await response.json()
        // Ensure sets array exists
        if (!sessionData.sets) {
          sessionData.sets = []
        }
        setSession(sessionData)
        
        // Set initial reps target for the first exercise
        if (sessionData.workoutPlan.workoutExercises.length > 0) {
          setCurrentSetData(prev => ({
            ...prev,
            reps: sessionData.workoutPlan.workoutExercises[0].targetReps.toString()
          }))
        }
      } else {
        router.push('/workouts')
      }
    } catch (error) {
      console.error('Error starting workout session:', error)
      router.push('/workouts')
    } finally {
      setLoading(false)
    }
  }

  const submitSet = async () => {
    if (!session || !currentSetData.reps) return

    const currentExercise = session.workoutPlan.workoutExercises[currentExerciseIndex]
    const currentExerciseSets = getExerciseSets(currentExercise.exercise.id)
    
    // Weight validation: require weight for first set, or if exercise typically uses weight
    const isFirstSet = currentExerciseSets.length === 0
    const isWeightedExercise = currentExercise.exercise.category !== 'bodyweight' && 
                              !currentExercise.exercise.name.toLowerCase().includes('push-up') &&
                              !currentExercise.exercise.name.toLowerCase().includes('pull-up') &&
                              !currentExercise.exercise.name.toLowerCase().includes('dip')
    
    if (isFirstSet && isWeightedExercise && (!currentSetData.weight || currentSetData.weight === '')) {
      showNotification('error', 'Please enter a weight for this exercise')
      // Error vibration
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 100, 100]) // Error pattern
      }
      return
    }

    setSubmittingSet(true)
    try {
      const response = await fetch('/api/sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.id,
          exerciseId: currentExercise.exercise.id,
          reps: parseInt(currentSetData.reps),
          weight: currentSetData.weight ? parseFloat(currentSetData.weight) : undefined,
        }),
      })

      if (response.ok) {
        const newSet = await response.json()
        
        // Success vibration feedback
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]) // Success pattern
        }
        
        // Update session with new set
        setSession(prev => prev ? {
          ...prev,
          sets: [...prev.sets, newSet]
        } : null)

        // Show success notification
        showNotification('success', `Set ${currentExerciseSets.length + 1} logged successfully!`)

        // Start rest timer (use custom rest time if set, otherwise default)
        const restDuration = customRestTime || currentExercise.restSeconds
        setRestTimer(restDuration)
        setIsResting(true)

        // Reset form but keep weight for next set
        setCurrentSetData(prev => ({
          reps: currentExercise.targetReps.toString(),
          weight: prev.weight // Keep the same weight
        }))
      }
    } catch (error) {
      console.error('Error submitting set:', error)
    } finally {
      setSubmittingSet(false)
    }
  }

  const skipRest = () => {
    // Light haptic feedback when skipping rest
    if ('vibrate' in navigator) {
      navigator.vibrate(50) // Short vibration
    }
    setIsResting(false)
    setRestTimer(0)
  }

  const nextExercise = () => {
    if (currentExerciseIndex < session!.workoutPlan.workoutExercises.length - 1) {
      const nextIndex = currentExerciseIndex + 1
      setCurrentExerciseIndex(nextIndex)
      
      // Set target reps for next exercise
      setCurrentSetData({
        reps: session!.workoutPlan.workoutExercises[nextIndex].targetReps.toString(),
        weight: ''
      })
    }
  }

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      const prevIndex = currentExerciseIndex - 1
      setCurrentExerciseIndex(prevIndex)
      
      // Set target reps for previous exercise
      setCurrentSetData({
        reps: session!.workoutPlan.workoutExercises[prevIndex].targetReps.toString(),
        weight: ''
      })
    }
  }

  const finishWorkout = async () => {
    if (!session) return

    try {
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completedAt: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        router.push('/workouts')
      }
    } catch (error) {
      console.error('Error finishing workout:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getExerciseSets = (exerciseId: string) => {
    return session?.sets?.filter(set => set.exerciseId === exerciseId) || []
  }

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <Header
          title="Loading Workout..."
          leftAction={<BackButton onClick={() => router.push('/workouts')} />}
        />
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="bg-white min-h-screen">
        <Header
          title="Workout Not Found"
          leftAction={<BackButton onClick={() => router.push('/workouts')} />}
        />
      </div>
    )
  }

  const currentExercise = session.workoutPlan.workoutExercises[currentExerciseIndex]
  const currentExerciseSets = getExerciseSets(currentExercise.exercise.id)

  return (
    <div className="bg-white min-h-screen">
      <Header
        title={session.workoutPlan.name}
        leftAction={
          <BackButton 
            onClick={() => {
              if (confirm('Are you sure you want to exit this workout? Your progress will be saved.')) {
                finishWorkout()
              }
            }} 
          />
        }
        rightAction={
          <Button
            size="sm"
            onClick={finishWorkout}
            variant="outline"
          >
            Finish
          </Button>
        }
      />

      {/* Crumble Notification */}
      {notification && (
        <div className={`fixed top-20 left-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center justify-between ${
          notification.type === 'error' ? 'bg-red-50 border border-red-200' :
          notification.type === 'success' ? 'bg-green-50 border border-green-200' :
          'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center">
            <span className={`text-2xl mr-3 ${
              notification.type === 'error' ? 'text-red-600' :
              notification.type === 'success' ? 'text-green-600' :
              'text-blue-600'
            }`}>
              {notification.type === 'error' ? '⚠️' : notification.type === 'success' ? '✅' : 'ℹ️'}
            </span>
            <span className={`text-sm font-medium ${
              notification.type === 'error' ? 'text-red-800' :
              notification.type === 'success' ? 'text-green-800' :
              'text-blue-800'
            }`}>
              {notification.message}
            </span>
          </div>
          <button
            onClick={dismissNotification}
            className={`ml-4 text-lg font-bold ${
              notification.type === 'error' ? 'text-red-600 hover:text-red-800' :
              notification.type === 'success' ? 'text-green-600 hover:text-green-800' :
              'text-blue-600 hover:text-blue-800'
            }`}
          >
            ×
          </button>
        </div>
      )}

      <div className="p-4 space-y-6">
        {/* Exercise Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {currentExercise.exercise.name}
              </CardTitle>
              <span className="text-sm text-gray-500">
                {currentExerciseIndex + 1} of {session.workoutPlan.workoutExercises.length}
              </span>
            </div>
            <p className="text-sm text-gray-600 capitalize">
              {currentExercise.exercise.category}
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm text-gray-600 mb-4">
              <span>Target: {currentExercise.targetSets} × {currentExercise.targetReps}</span>
              <span>Completed: {currentExerciseSets.length} sets</span>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousExercise}
                disabled={currentExerciseIndex === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextExercise}
                disabled={currentExerciseIndex === session.workoutPlan.workoutExercises.length - 1}
                className="flex-1"
              >
                Next Exercise
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Previous Performance */}
        {previousSessions.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-blue-900">Previous Performance</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreviousData(!showPreviousData)}
                >
                  <svg className={`w-4 h-4 transform transition-transform ${showPreviousData ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showPreviousData ? (
                <div className="space-y-3">
                  {previousSessions.map((prevSession, index) => (
                    <div key={prevSession.sessionId} className="p-3 bg-white rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(prevSession.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-sm text-blue-600 font-medium">
                          {prevSession.totalSets} sets • {prevSession.totalReps} reps
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Max Weight:</span>
                          <div className="font-semibold">{prevSession.maxWeight > 0 ? `${prevSession.maxWeight} lbs` : 'Bodyweight'}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Sets:</span>
                          <div className="font-semibold">{prevSession.totalSets}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Avg Reps:</span>
                          <div className="font-semibold">{Math.round(prevSession.totalReps / prevSession.totalSets)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2">
                  <div className="text-sm text-blue-800 mb-1">
                    Last session: <span className="font-semibold">{previousSessions[0].maxWeight > 0 ? `${previousSessions[0].maxWeight} lbs` : 'Bodyweight'}</span>
                  </div>
                  <div className="text-xs text-blue-600">
                    {previousSessions[0].totalSets} sets × {Math.round(previousSessions[0].totalReps / previousSessions[0].totalSets)} reps avg
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Rest Timer */}
        {isResting && (
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {formatTime(restTimer)}
                </div>
                <p className="text-sm text-orange-700 mb-1">Rest between sets</p>
                {notificationPermission === 'granted' && (
                  <p className="text-xs text-orange-600 mb-3">
                    🔔 You'll get notified when rest is complete
                  </p>
                )}
                {notificationPermission === 'denied' && (
                  <p className="text-xs text-orange-600 mb-3">
                    📳 Vibration enabled
                  </p>
                )}
                {notificationPermission === 'default' && (
                  <p className="text-xs text-orange-600 mb-3">
                    📳 Vibration enabled
                  </p>
                )}
                
                {/* Rest Time Adjustment Controls */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <button
                    onClick={() => setRestTimer(prev => Math.max(prev - 30, 0))}
                    className="px-2 py-1 text-sm bg-orange-200 text-orange-800 rounded hover:bg-orange-300"
                  >
                    -30s
                  </button>
                  <button
                    onClick={() => setRestTimer(prev => prev + 30)}
                    className="px-2 py-1 text-sm bg-orange-200 text-orange-800 rounded hover:bg-orange-300"
                  >
                    +30s
                  </button>
                </div>

                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    onClick={skipRest}
                    variant="outline"
                  >
                    Skip Rest
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Set Entry */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Record Set</CardTitle>
              {!isResting && (
                <div className="text-xs text-gray-500">
                  Rest: {customRestTime || session!.workoutPlan.workoutExercises[currentExerciseIndex].restSeconds}s
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Reps"
                type="number"
                min="1"
                value={currentSetData.reps}
                onChange={(e) => setCurrentSetData(prev => ({ ...prev, reps: e.target.value }))}
                placeholder="12"
              />
              <Input
                label="Weight (lbs)"
                type="number"
                min="0"
                step="0.5"
                value={currentSetData.weight}
                onChange={(e) => setCurrentSetData(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="135"
              />
            </div>

            {/* Rest Time Adjustment */}
            {!isResting && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Next Rest Duration</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const current = customRestTime || session!.workoutPlan.workoutExercises[currentExerciseIndex].restSeconds
                        setCustomRestTime(Math.max(current - 30, 30))
                      }}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      -30s
                    </button>
                    <span className="text-sm min-w-[3rem] text-center">
                      {customRestTime || session!.workoutPlan.workoutExercises[currentExerciseIndex].restSeconds}s
                    </span>
                    <button
                      onClick={() => {
                        const current = customRestTime || session!.workoutPlan.workoutExercises[currentExerciseIndex].restSeconds
                        setCustomRestTime(current + 30)
                      }}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      +30s
                    </button>
                  </div>
                </div>
                {customRestTime && customRestTime !== session!.workoutPlan.workoutExercises[currentExerciseIndex].restSeconds && (
                  <button
                    onClick={() => setCustomRestTime(null)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Reset to default ({session!.workoutPlan.workoutExercises[currentExerciseIndex].restSeconds}s)
                  </button>
                )}
              </div>
            )}

            <Button
              onClick={submitSet}
              disabled={!currentSetData.reps || submittingSet}
              isLoading={submittingSet}
              className="w-full"
              size="lg"
            >
              Log Set
            </Button>
          </CardContent>
        </Card>

        {/* Previous Sets */}
        {currentExerciseSets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Sets Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentExerciseSets.map((set, index) => (
                  <div
                    key={set.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <span className="font-medium">Set {index + 1}</span>
                    <div className="text-sm text-gray-600">
                      {set.reps} reps
                      {set.weight && ` @ ${set.weight} lbs`}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}