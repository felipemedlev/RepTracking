'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent, StatCard } from "@/components/ui/Card"
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
        {/* Enhanced Quick Stats with StatCard */}
        {session && stats && (
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              title="Sessions"
              value={stats.totalWorkouts}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            />
            <StatCard
              title="Total Sets" 
              value={stats.totalSets}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
            <StatCard
              title="Total Reps"
              value={stats.totalReps}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
          </div>
        )}

        {/* Enhanced Action Buttons */}
        <div className="space-y-4">
          <Button 
            size="xl"
            className="w-full"
            onClick={() => router.push('/workouts')}
            hapticFeedback={true}
            leftIcon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          >
            {session ? 'Start Workout' : 'View Workouts'}
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => session ? router.push('/metrics') : router.push('/login')}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            >
              Body Metrics
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => router.push('/calculator')}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              }
            >
              1RM Calculator
            </Button>
          </div>
        </div>

        {/* Enhanced Recent Sessions */}
        {session && stats && stats.recentSessions.length > 0 && (
          <Card variant="elevated" hover>
            <CardHeader>
              <CardTitle size="lg">Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentSessions.map((sessionData) => (
                  <div
                    key={sessionData.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl cursor-pointer hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50 transition-all duration-200 border border-gray-100 hover:border-primary-200 active:scale-[0.99]"
                    onClick={() => router.push(`/sessions/${sessionData.id}`)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{sessionData.workoutPlan.name}</div>
                        <div className="text-sm text-gray-600">
                          {formatDate(sessionData.startTime)}
                          {sessionData.endTime && ` • ${getSessionDuration(sessionData.startTime, sessionData.endTime)}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-primary-600 font-semibold">
                        {sessionData._count.sets} sets
                      </div>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
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
