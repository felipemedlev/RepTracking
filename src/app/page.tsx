'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Header } from "@/components/layout/Header"

interface DashboardStats {
  totalWorkouts: number
  totalSets: number
  totalReps: number
  recentSessions: {
    id: string
    startTime: string
    endTime?: string
    workoutPlan: {
      name: string
    }
    _count: {
      sets: number
    }
  }[]
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardStats()
    } else {
      setLoading(false)
    }
  }, [status])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getSessionDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return ''
    const start = new Date(startTime)
    const end = new Date(endTime)
    const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60))
    return `${duration} min`
  }
  if (status === 'loading' || loading) {
    return (
      <div className="bg-white">
        <Header title="RepTracking" subtitle="Loading..." />
        <div className="px-4 py-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <Header 
        title={session?.user?.name ? `Welcome back, ${session.user.name.split(' ')[0]}` : "RepTracking"}
        subtitle={session ? "Ready to crush your workout?" : "Track your fitness journey"}
        rightAction={
          !session ? (
            <Button
              size="sm"
              onClick={() => router.push('/login')}
              variant="outline"
            >
              Sign In
            </Button>
          ) : undefined
        }
      />
      
      <div className="px-4 py-6 space-y-6">
        {/* Quick Stats */}
        {session && stats && (
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary-600">
                  {stats.totalWorkouts}
                </div>
                <div className="text-xs text-gray-600">Sessions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary-600">
                  {stats.totalSets}
                </div>
                <div className="text-xs text-gray-600">Total Sets</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary-600">
                  {stats.totalReps.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Total Reps</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Start Workout Button */}
        <div className="space-y-4">
          <Button 
            className="w-full h-14 text-lg font-semibold"
            onClick={() => router.push('/workouts')}
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            {session ? 'Start Workout' : 'View Workouts'}
          </Button>
          
          {session && (
            <Button 
              variant="outline" 
              className="w-full h-12"
              onClick={() => router.push('/progress')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Progress
            </Button>
          )}
        </div>

        {/* Recent Sessions */}
        {session && stats && stats.recentSessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => router.push(`/sessions/${session.id}`)}
                  >
                    <div>
                      <div className="font-medium">{session.workoutPlan.name}</div>
                      <div className="text-sm text-gray-600">
                        {formatDate(session.startTime)}
                        {session.endTime && ` • ${getSessionDuration(session.startTime, session.endTime)}`}
                      </div>
                    </div>
                    <div className="text-sm text-primary-600 font-medium">
                      {session._count.sets} sets
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Welcome/Guest Message */}
        <Card className={session ? "bg-primary-50 border-primary-200" : "bg-blue-50 border-blue-200"}>
          <CardContent className="p-4">
            <h3 className={`font-semibold mb-2 ${session ? 'text-primary-900' : 'text-blue-900'}`}>
              {session ? `Welcome back, ${session.user?.name?.split(' ')[0]}!` : 'Welcome to RepTracking!'}
            </h3>
            <p className={`text-sm ${session ? 'text-primary-800' : 'text-blue-800'}`}>
              {session 
                ? "Ready to push your limits? Start a new workout or check your progress."
                : "Your mobile-first gym companion. Sign in to track workouts, monitor progress, and achieve your fitness goals."
              }
            </p>
            {!session && (
              <div className="mt-3 space-x-2">
                <Button size="sm" onClick={() => router.push('/register')}>
                  Sign Up
                </Button>
                <Button size="sm" variant="outline" onClick={() => router.push('/login')}>
                  Sign In
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
