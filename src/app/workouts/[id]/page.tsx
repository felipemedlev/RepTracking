'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header, BackButton } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
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

interface WorkoutPlan {
  id: string
  name: string
  description?: string
  workoutExercises: WorkoutExercise[]
  _count: {
    sessions: number
  }
}

export default function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const resolvedParams = use(params)
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    
    if (status === 'authenticated') {
      fetchWorkoutPlan()
    }
  }, [status, router])

  const fetchWorkoutPlan = async () => {
    try {
      const response = await fetch(`/api/workouts/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setWorkoutPlan(data)
      } else if (response.status === 404) {
        router.push('/workouts')
      }
    } catch (error) {
      console.error('Error fetching workout plan:', error)
      router.push('/workouts')
    } finally {
      setLoading(false)
    }
  }

  const startWorkout = () => {
    router.push(`/session/active?plan=${resolvedParams.id}`)
  }

  const editWorkout = () => {
    router.push(`/workouts/${resolvedParams.id}/edit`)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="bg-white min-h-screen">
        <Header
          title="Loading..."
          leftAction={<BackButton onClick={() => router.push('/workouts')} />}
        />
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !workoutPlan) {
    return null
  }

  return (
    <div className="bg-white min-h-screen">
      <Header
        title={workoutPlan.name}
        leftAction={<BackButton onClick={() => router.push('/workouts')} />}
        rightAction={
          <Button
            size="sm"
            variant="outline"
            onClick={editWorkout}
          >
            Edit
          </Button>
        }
      />

      <div className="p-4 space-y-6">
        {/* Workout Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{workoutPlan.name}</CardTitle>
                {workoutPlan.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {workoutPlan.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">
                  {workoutPlan._count.sessions}
                </div>
                <div className="text-xs text-gray-500">Sessions</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {workoutPlan.workoutExercises.length}
                </div>
                <div className="text-sm text-gray-600">Exercises</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {workoutPlan.workoutExercises.reduce((sum, we) => sum + we.targetSets, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Sets</div>
              </div>
            </div>
            
            <Button 
              onClick={startWorkout}
              className="w-full"
              size="lg"
            >
              Start Workout
            </Button>
          </CardContent>
        </Card>

        {/* Exercise List */}
        <Card>
          <CardHeader>
            <CardTitle>Exercises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workoutPlan.workoutExercises
                .sort((a, b) => a.order - b.order)
                .map((workoutExercise, index) => (
                <div 
                  key={workoutExercise.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {workoutExercise.exercise.name}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {workoutExercise.exercise.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {workoutExercise.targetSets} × {workoutExercise.targetReps}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.floor(workoutExercise.restSeconds / 60)}:{(workoutExercise.restSeconds % 60).toString().padStart(2, '0')} rest
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}