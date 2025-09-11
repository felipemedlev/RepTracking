'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header, BackButton } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ExerciseSelector } from '@/components/workout/ExerciseSelector'

interface Exercise {
  id: string
  name: string
  category: string
  isCustom: boolean
}

interface WorkoutExercise {
  exercise: Exercise
  targetSets: number
  targetReps: number
  restSeconds: number
}

export default function NewWorkoutPlanPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([])
  const [showExerciseSelector, setShowExerciseSelector] = useState(false)
  const [loading, setLoading] = useState(false)

  const selectedExerciseIds = workoutExercises.map(we => we.exercise.id)

  const handleExerciseSelect = (exercise: Exercise) => {
    if (selectedExerciseIds.includes(exercise.id)) {
      // Remove exercise
      setWorkoutExercises(prev => prev.filter(we => we.exercise.id !== exercise.id))
    } else {
      // Add exercise with default values
      const newWorkoutExercise: WorkoutExercise = {
        exercise,
        targetSets: 3,
        targetReps: 10,
        restSeconds: 60,
      }
      setWorkoutExercises(prev => [...prev, newWorkoutExercise])
    }
  }

  const updateWorkoutExercise = (exerciseId: string, field: keyof Omit<WorkoutExercise, 'exercise'>, value: number) => {
    setWorkoutExercises(prev =>
      prev.map(we =>
        we.exercise.id === exerciseId ? { ...we, [field]: value } : we
      )
    )
  }

  const moveExercise = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= workoutExercises.length) return
    
    const newExercises = [...workoutExercises]
    const [movedExercise] = newExercises.splice(fromIndex, 1)
    newExercises.splice(toIndex, 0, movedExercise)
    setWorkoutExercises(newExercises)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || workoutExercises.length === 0) return

    setLoading(true)
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          exercises: workoutExercises.map(we => ({
            exerciseId: we.exercise.id,
            targetSets: we.targetSets,
            targetReps: we.targetReps,
            restSeconds: we.restSeconds,
          })),
        }),
      })

      if (response.ok) {
        router.push('/workouts')
      }
    } catch (error) {
      console.error('Error creating workout plan:', error)
    } finally {
      setLoading(false)
    }
  }

  if (showExerciseSelector) {
    return (
      <div className="bg-white min-h-screen">
        <Header
          title="Select Exercises"
          leftAction={
            <BackButton onClick={() => setShowExerciseSelector(false)} />
          }
          rightAction={
            <Button
              size="sm"
              onClick={() => setShowExerciseSelector(false)}
              disabled={workoutExercises.length === 0}
            >
              Done ({workoutExercises.length})
            </Button>
          }
        />
        
        <div className="p-4">
          <ExerciseSelector
            onExerciseSelect={handleExerciseSelect}
            selectedExercises={selectedExerciseIds}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <Header
        title="New Workout Plan"
        leftAction={
          <BackButton onClick={() => router.back()} />
        }
        rightAction={
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!name.trim() || workoutExercises.length === 0 || loading}
            isLoading={loading}
          >
            Save
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Plan Name"
              placeholder="e.g., Push Day A, Upper Body, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                placeholder="Add notes about this workout plan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        {/* Exercises */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Exercises ({workoutExercises.length})</CardTitle>
              <Button
                type="button"
                size="sm"
                onClick={() => setShowExerciseSelector(true)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Exercises
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {workoutExercises.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m0 0l7-7 7 7z" />
                  </svg>
                </div>
                <p className="mb-3">No exercises added yet</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowExerciseSelector(true)}
                >
                  Add Your First Exercise
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {workoutExercises.map((workoutExercise, index) => (
                  <Card key={workoutExercise.exercise.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{workoutExercise.exercise.name}</h4>
                        <span className="text-xs text-gray-500 capitalize">
                          {workoutExercise.exercise.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveExercise(index, index - 1)}
                          disabled={index === 0}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveExercise(index, index + 1)}
                          disabled={index === workoutExercises.length - 1}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setWorkoutExercises(prev => prev.filter((_, i) => i !== index))}
                        >
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Sets</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={workoutExercise.targetSets}
                          onChange={(e) => updateWorkoutExercise(
                            workoutExercise.exercise.id, 
                            'targetSets', 
                            parseInt(e.target.value) || 1
                          )}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Reps</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={workoutExercise.targetReps}
                          onChange={(e) => updateWorkoutExercise(
                            workoutExercise.exercise.id, 
                            'targetReps', 
                            parseInt(e.target.value) || 1
                          )}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Rest (sec)</label>
                        <input
                          type="number"
                          min="0"
                          max="600"
                          step="15"
                          value={workoutExercise.restSeconds}
                          onChange={(e) => updateWorkoutExercise(
                            workoutExercise.exercise.id, 
                            'restSeconds', 
                            parseInt(e.target.value) || 0
                          )}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  )
}