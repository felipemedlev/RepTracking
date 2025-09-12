'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header, BackButton } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface UserStats {
  totalWorkouts: number
  totalSets: number
  totalReps: number
  totalVolume: number
  averageSessionDuration: number
  strongestLifts: {
    exercise: string
    maxWeight: number
  }[]
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    
    if (status === 'authenticated') {
      fetchUserStats()
      setFormData({
        name: session.user?.name || '',
        email: session.user?.email || ''
      })
    }
  }, [status, session, router])

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut({ callbackUrl: '/' })
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="bg-white min-h-screen">
        <Header
          title="Profile"
          leftAction={<BackButton onClick={() => router.back()} />}
        />
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
        title="Profile"
        leftAction={<BackButton onClick={() => router.back()} />}
        rightAction={
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        }
      />

      <div className="p-4 space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600">
                  {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <Input
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                />
                <Input
                  label="Email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                  disabled
                />
                <div className="flex space-x-3">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      // TODO: Implement profile update
                      setIsEditing(false)
                    }}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-gray-900">{session?.user?.name || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-gray-900">{session?.user?.email}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fitness Stats */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle>Your Fitness Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{stats.totalWorkouts}</div>
                  <div className="text-sm text-gray-600">Workouts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{stats.totalSets}</div>
                  <div className="text-sm text-gray-600">Total Sets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{stats.totalReps.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Reps</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {Math.round(stats.totalVolume).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Volume (lbs)</div>
                </div>
              </div>

              {stats.strongestLifts && stats.strongestLifts.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Personal Records</h4>
                  <div className="space-y-2">
                    {stats.strongestLifts.slice(0, 3).map((lift, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{lift.exercise}</span>
                        <span className="text-primary-600 font-semibold">{lift.maxWeight} lbs</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              size="lg"
              className="w-full justify-start bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-0 hover:from-blue-100 hover:to-indigo-100 hover:shadow-md transition-all duration-200"
              onClick={() => router.push('/metrics')}
            >
              <div className="flex items-center justify-start w-full">
                <div className="p-2 bg-blue-600 text-white rounded-lg mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold">Body Metrics</div>
                  <div className="text-sm opacity-70">Track your measurements</div>
                </div>
              </div>
            </Button>
            
            <Button
              size="lg"
              className="w-full justify-start bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-0 hover:from-purple-100 hover:to-pink-100 hover:shadow-md transition-all duration-200"
              onClick={() => router.push('/tools')}
            >
              <div className="flex items-center justify-start w-full">
                <div className="p-2 bg-purple-600 text-white rounded-lg mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold">Fitness Tools</div>
                  <div className="text-sm opacity-70">Calculators and utilities</div>
                </div>
              </div>
            </Button>
            
            <Button
              size="lg"
              className="w-full justify-start bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-0 hover:from-green-100 hover:to-emerald-100 hover:shadow-md transition-all duration-200"
              onClick={() => router.push('/progress')}
            >
              <div className="flex items-center justify-start w-full">
                <div className="p-2 bg-green-600 text-white rounded-lg mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold">Progress Analytics</div>
                  <div className="text-sm opacity-70">View your fitness stats</div>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              className="w-full justify-start bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-0 hover:from-red-100 hover:to-rose-100 hover:shadow-md transition-all duration-200"
              onClick={handleSignOut}
            >
              <div className="flex items-center justify-start w-full">
                <div className="p-2 bg-red-600 text-white rounded-lg mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold">Sign Out</div>
                  <div className="text-sm opacity-70">End your session</div>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}