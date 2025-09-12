'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header, BackButton } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface BodyMetric {
  id: string
  weight?: number
  bodyFatPercentage?: number
  recordedAt: string
}

interface MetricsData {
  metrics: BodyMetric[]
  latestWeight?: number
  latestBodyFat?: number
}

export default function MetricsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMetric, setEditingMetric] = useState<BodyMetric | null>(null)
  const [formData, setFormData] = useState({
    weight: '',
    bodyFatPercentage: '',
    recordedAt: new Date().toISOString().split('T')[0], // Default to today
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    
    if (status === 'authenticated') {
      fetchMetricsData()
    }
  }, [status, router])

  const fetchMetricsData = async () => {
    try {
      const response = await fetch('/api/metrics')
      if (response.ok) {
        const data = await response.json()
        setMetricsData(data)
      }
    } catch (error) {
      console.error('Error fetching metrics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.weight && !formData.bodyFatPercentage) {
      return
    }

    setSubmitting(true)
    try {
      const url = editingMetric ? `/api/metrics/${editingMetric.id}` : '/api/metrics'
      const method = editingMetric ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weight: formData.weight ? parseFloat(formData.weight) : undefined,
          bodyFatPercentage: formData.bodyFatPercentage ? parseFloat(formData.bodyFatPercentage) : undefined,
          recordedAt: formData.recordedAt,
        }),
      })

      if (response.ok) {
        resetForm()
        fetchMetricsData()
      }
    } catch (error) {
      console.error('Error saving metrics:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (metric: BodyMetric) => {
    setEditingMetric(metric)
    setFormData({
      weight: metric.weight?.toString() || '',
      bodyFatPercentage: metric.bodyFatPercentage?.toString() || '',
      recordedAt: metric.recordedAt.split('T')[0], // Convert to YYYY-MM-DD format
    })
    setShowAddForm(true)
  }

  const handleDelete = async (metricId: string) => {
    if (!confirm('Are you sure you want to delete this metric entry?')) {
      return
    }

    try {
      const response = await fetch(`/api/metrics/${metricId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchMetricsData()
      }
    } catch (error) {
      console.error('Error deleting metric:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      weight: '',
      bodyFatPercentage: '',
      recordedAt: new Date().toISOString().split('T')[0],
    })
    setShowAddForm(false)
    setEditingMetric(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="bg-white min-h-screen">
        <Header
          title="Body Metrics"
          leftAction={<BackButton onClick={() => router.back()} />}
        />
        <div className="p-4 space-y-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
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
        title="Body Metrics"
        leftAction={<BackButton onClick={() => router.back()} />}
        rightAction={
          <Button
            size="sm"
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add
          </Button>
        }
      />

      <div className="p-4 space-y-6">
        {/* Add Metrics Form */}
        {showAddForm && (
          <Card className="border-primary-200 bg-primary-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingMetric ? 'Edit Metrics' : 'Add New Metrics'}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Date"
                  type="date"
                  value={formData.recordedAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, recordedAt: e.target.value }))}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Weight (lbs)"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1000"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="185.5"
                  />
                  <Input
                    label="Body Fat %"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.bodyFatPercentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, bodyFatPercentage: e.target.value }))}
                    placeholder="15.2"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    isLoading={submitting}
                    disabled={submitting || (!formData.weight && !formData.bodyFatPercentage)}
                    className="flex-1"
                  >
                    {editingMetric ? 'Update Metrics' : 'Save Metrics'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Current Stats */}
        {metricsData && (
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary-600">
                  {metricsData.latestWeight ? `${metricsData.latestWeight} lbs` : '—'}
                </div>
                <div className="text-sm text-gray-600">Current Weight</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary-600">
                  {metricsData.latestBodyFat ? `${metricsData.latestBodyFat}%` : '—'}
                </div>
                <div className="text-sm text-gray-600">Body Fat %</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Weight Progress Chart */}
        {metricsData && metricsData.metrics.filter(m => m.weight).length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Weight Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricsData.metrics.filter(m => m.weight)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="recordedAt"
                      tick={{ fontSize: 12 }}
                      tickFormatter={formatDate}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [`${value} lbs`, 'Weight']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
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

        {/* Body Fat Progress Chart */}
        {metricsData && metricsData.metrics.filter(m => m.bodyFatPercentage).length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Body Fat Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricsData.metrics.filter(m => m.bodyFatPercentage)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="recordedAt"
                      tick={{ fontSize: 12 }}
                      tickFormatter={formatDate}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      domain={['dataMin - 2', 'dataMax + 2']}
                    />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [`${value}%`, 'Body Fat']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="bodyFatPercentage" 
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

        {/* Recent Entries */}
        {metricsData && metricsData.metrics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metricsData.metrics.slice(0, 10).map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm text-gray-600">
                        {new Date(metric.recordedAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="flex space-x-4 text-sm mt-1">
                        {metric.weight && (
                          <span className="font-medium text-primary-600">
                            {metric.weight} lbs
                          </span>
                        )}
                        {metric.bodyFatPercentage && (
                          <span className="font-medium text-green-600">
                            {metric.bodyFatPercentage}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(metric)}
                        className="p-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(metric.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Data Message */}
        {metricsData && metricsData.metrics.length === 0 && !showAddForm && (
          <Card className="bg-gray-50">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Metrics Recorded</h3>
              <p className="text-gray-600 mb-4">
                Start tracking your body metrics to see your progress over time.
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                Add Your First Entry
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}