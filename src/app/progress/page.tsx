'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header, BackButton } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface ProgressStats {
  totalVolume: number
  averageWeight: number
  totalWorkouts: number
  strengthProgress: Array<{
    date: string
    weight: number
    exercise: string
  }>
  volumeProgress: Array<{
    date: string
    volume: number
  }>
  exerciseStats: Array<{
    exercise: string
    maxWeight: number
    totalSets: number
    averageReps: number
  }>
}

export default function ProgressPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedExercise, setSelectedExercise] = useState<string>('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    
    if (status === 'authenticated') {
      fetchProgressStats()
    }
  }, [status, router])

  const fetchProgressStats = async () => {
    try {
      const response = await fetch('/api/progress/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching progress stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="bg-white min-h-screen">
        <Header
          title="Progress Analytics"
          leftAction={<BackButton onClick={() => router.back()} />}
        />
        <div className="p-4 space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null // Will redirect
  }

  return (
    <div className="bg-white min-h-screen">
      <Header
        title="Progress Analytics"
        leftAction={<BackButton onClick={() => router.back()} />}
        rightAction={
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push('/metrics')}
          >
            Body Metrics
          </Button>
        }
      />

      <div className="p-4 space-y-6">
        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-lg font-bold text-primary-600">
                  {Math.round(stats.totalVolume).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Total Volume (lbs)</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-lg font-bold text-primary-600">
                  {Math.round(stats.averageWeight)}
                </div>
                <div className="text-xs text-gray-600">Avg Weight (lbs)</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-lg font-bold text-primary-600">
                  {stats.totalWorkouts}
                </div>
                <div className="text-xs text-gray-600">Total Workouts</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Volume Progress Chart */}
        {stats && stats.volumeProgress.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Volume Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.volumeProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [`${Math.round(value).toLocaleString()} lbs`, 'Volume']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exercise Performance */}
        {stats && stats.exerciseStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Exercise Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.exerciseStats.slice(0, 8)} margin={{ bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="exercise" 
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        if (name === 'maxWeight') return [`${value} lbs`, 'Max Weight']
                        if (name === 'totalSets') return [value, 'Total Sets']
                        if (name === 'averageReps') return [value, 'Avg Reps']
                        return [value, name]
                      }}
                    />
                    <Bar dataKey="maxWeight" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Strength Progress Chart */}
        {stats && stats.strengthProgress.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Strength Progress</CardTitle>
                <select
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All Exercises</option>
                  {Array.from(new Set(stats.strengthProgress.map(item => item.exercise))).map(exercise => (
                    <option key={exercise} value={exercise}>{exercise}</option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={selectedExercise === 'all' 
                      ? stats.strengthProgress
                      : stats.strengthProgress.filter(item => item.exercise === selectedExercise)
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number, name: string, props: any) => [
                        `${value} lbs`,
                        props.payload.exercise
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Data Message */}
        {stats && stats.totalWorkouts === 0 && (
          <Card className="bg-gray-50">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Progress Data Yet</h3>
              <p className="text-gray-600 mb-4">
                Complete some workouts to see your progress analytics and charts.
              </p>
              <Button onClick={() => router.push('/workouts')}>
                Start Your First Workout
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}