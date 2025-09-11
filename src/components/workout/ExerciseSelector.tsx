'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'

interface Exercise {
  id: string
  name: string
  category: string
  isCustom: boolean
}

interface ExerciseSelectorProps {
  onExerciseSelect: (exercise: Exercise) => void
  selectedExercises: string[]
}

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'push', label: 'Push (Chest, Shoulders, Triceps)' },
  { value: 'pull', label: 'Pull (Back, Biceps)' },
  { value: 'legs', label: 'Legs (Quads, Hamstrings, Glutes)' },
  { value: 'core', label: 'Core/Abs' },
]

export function ExerciseSelector({ onExerciseSelect, selectedExercises }: ExerciseSelectorProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    fetchExercises()
  }, [selectedCategory, search])

  const fetchExercises = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      if (search) params.append('search', search)

      const response = await fetch(`/api/exercises?${params}`)
      if (response.ok) {
        const data = await response.json()
        setExercises(data)
      }
    } catch (error) {
      console.error('Error fetching exercises:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      push: 'bg-red-100 text-red-800',
      pull: 'bg-blue-100 text-blue-800',
      legs: 'bg-green-100 text-green-800',
      core: 'bg-purple-100 text-purple-800',
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="space-y-3">
        <Input
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
              className="text-xs"
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {exercises.map((exercise) => (
          <Card 
            key={exercise.id}
            className={`cursor-pointer transition-colors ${
              selectedExercises.includes(exercise.id) 
                ? 'bg-primary-50 border-primary-200' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onExerciseSelect(exercise)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{exercise.name}</span>
                    {exercise.isCustom && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(exercise.category)}`}>
                      {exercise.category}
                    </span>
                  </div>
                </div>
                
                {selectedExercises.includes(exercise.id) && (
                  <div className="text-primary-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {exercises.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No exercises found. Try adjusting your search or filter.
          </div>
        )}
      </div>
    </div>
  )
}