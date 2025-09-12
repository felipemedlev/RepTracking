'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface SessionData {
  id: string
  startedAt: string
  completedAt: string | null
  workoutPlanId: string
  workoutPlan: {
    name: string
  }
  sets: {
    id: string
    exercise: {
      name: string
      category: string
    }
    weight: number | null
    reps: number | null
  }[]
}

export default function SessionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'active' | 'recent'>('active')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    
    if (status === 'authenticated') {
      fetchSessions()
    }
  }, [status, router])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const activeSessions = sessions.filter(s => !s.completedAt)
  const recentSessions = sessions.filter(s => s.completedAt).slice(0, 10)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays < 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
  }

  const getSessionDuration = (startTime: string, endTime: string | null) => {
    if (!endTime) {
      const start = new Date(startTime)
      const now = new Date()
      const duration = Math.round((now.getTime() - start.getTime()) / (1000 * 60))
      return `${duration} min (ongoing)`
    }
    const start = new Date(startTime)
    const end = new Date(endTime)
    const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60))
    return `${duration} min`
  }

  const getTotalVolume = (sets: SessionData['sets']) => {
    return sets.reduce((total, set) => {
      return total + ((set.weight || 0) * (set.reps || 0))
    }, 0)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="bg-white min-h-screen">
        <Header title="Sessions" />
        <div className="p-4 space-y-4">
          {[...Array(3)].map((_, i) => (
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

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="bg-white min-h-screen">
      <Header 
        title="Workout Sessions"
        rightAction={
          activeSessions.length === 0 ? (
            <Button
              size="sm"
              onClick={() => router.push('/workouts')}
            >
              Start Workout
            </Button>
          ) : undefined
        }
      />

      <div className="p-4 space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'active' 
                ? 'bg-white text-gray-900 shadow' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('active')}
          >
            Active ({activeSessions.length})
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'recent' 
                ? 'bg-white text-gray-900 shadow' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('recent')}
          >
            Recent ({recentSessions.length})
          </button>
        </div>

        {/* Active Sessions */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            {activeSessions.length === 0 ? (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">No Active Sessions</h3>
                  <p className="text-blue-700 mb-4">Start a new workout to begin tracking your session</p>
                  <Button onClick={() => router.push('/workouts')}>
                    Start New Workout
                  </Button>
                </CardContent>
              </Card>
            ) : (
              activeSessions.map((sessionData) => (
                <Card key={sessionData.id} className="border-green-200 bg-green-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-green-900">{sessionData.workoutPlan.name}</CardTitle>
                        <p className="text-sm text-green-700">
                          Started {formatDate(sessionData.startedAt)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-900">{sessionData.sets.length}</div>
                        <div className="text-xs text-green-700">Sets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-900">
                          {getTotalVolume(sessionData.sets).toLocaleString()}
                        </div>
                        <div className="text-xs text-green-700">Volume (lbs)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-900">
                          {getSessionDuration(sessionData.startedAt, sessionData.completedAt)}
                        </div>
                        <div className="text-xs text-green-700">Duration</div>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => router.push(`/session/active?plan=${sessionData.workoutPlanId}&sessionId=${sessionData.id}`)}
                    >
                      Continue Session
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Recent Sessions */}
        {activeTab === 'recent' && (
          <div className="space-y-4">
            {recentSessions.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p>No workout sessions yet</p>
                </CardContent>
              </Card>
            ) : (
              recentSessions.map((sessionData) => (
                <Card key={sessionData.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{sessionData.workoutPlan.name}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {formatDate(sessionData.completedAt!)} • {getSessionDuration(sessionData.startedAt, sessionData.completedAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{sessionData.sets.length} sets</div>
                        <div className="text-xs text-gray-500">
                          {getTotalVolume(sessionData.sets).toLocaleString()} lbs
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(new Set(sessionData.sets.map(s => s.exercise.name))).slice(0, 3).map((exerciseName, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {exerciseName}
                        </span>
                      ))}
                      {Array.from(new Set(sessionData.sets.map(s => s.exercise.name))).length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          +{Array.from(new Set(sessionData.sets.map(s => s.exercise.name))).length - 3} more
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}