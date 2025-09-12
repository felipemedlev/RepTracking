'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'

interface WorkoutPlan {
  id: string
  name: string
  description?: string
  createdAt: string
  workoutExercises: {
    id: string
    targetSets: number
    targetReps: number
    exercise: {
      name: string
      category: string
    }
  }[]
  _count: {
    sessions: number
  }
}

export default function WorkoutsPage() {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchWorkoutPlans()
  }, [])

  const fetchWorkoutPlans = async () => {
    try {
      const response = await fetch('/api/workouts')
      if (response.ok) {
        const data = await response.json()
        setWorkoutPlans(data)
      }
    } catch (error) {
      console.error('Error fetching workout plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteWorkoutPlan = async (id: string) => {
    try {
      const response = await fetch(`/api/workouts/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setWorkoutPlans(plans => plans.filter(plan => plan.id !== id))
      }
    } catch (error) {
      console.error('Error deleting workout plan:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <Header title="Workout Plans" />
        <div className="px-4 py-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <Header 
        title="Workout Plans" 
        rightAction={
          <Button 
            size="sm"
            onClick={() => router.push('/workouts/new')}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Plan
          </Button>
        }
      />

      <div className="px-4 py-6">
        {workoutPlans.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No workout plans yet</h3>
            <p className="text-gray-600 mb-6">Create your first workout plan to get started</p>
            <Button onClick={() => router.push('/workouts/new')}>
              Create Your First Plan
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {workoutPlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      {plan.description && (
                        <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => router.push(`/workouts/${plan.id}/edit`)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this workout plan?')) {
                            deleteWorkoutPlan(plan.id)
                          }
                        }}
                      >
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span>{plan.workoutExercises.length} exercises</span>
                    <span>{plan._count.sessions} sessions completed</span>
                    <span>Created {formatDate(plan.createdAt)}</span>
                  </div>
                  
                  {plan.workoutExercises.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Exercises:</div>
                      <div className="flex flex-wrap gap-2">
                        {plan.workoutExercises.slice(0, 4).map((workoutExercise) => (
                          <span 
                            key={workoutExercise.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                          >
                            {workoutExercise.exercise.name} ({workoutExercise.targetSets}×{workoutExercise.targetReps})
                          </span>
                        ))}
                        {plan.workoutExercises.length > 4 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-500">
                            +{plan.workoutExercises.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <Button 
                      className="flex-1"
                      onClick={() => router.push(`/session/active?plan=${plan.id}`)}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2-10h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Start Workout
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => router.push(`/workouts/${plan.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}