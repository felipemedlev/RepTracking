'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header, BackButton } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

const oneRepMaxFormulas = {
  epley: (weight: number, reps: number) => weight * (1 + reps / 30),
  brzycki: (weight: number, reps: number) => weight / (1.0278 - 0.0278 * reps),
  mcglothin: (weight: number, reps: number) => weight * (100 / (101.3 - 2.67123 * reps)),
  lombardi: (weight: number, reps: number) => weight * Math.pow(reps, 0.10),
}

const percentages = [
  { percent: 100, label: '1RM' },
  { percent: 95, label: '95%' },
  { percent: 90, label: '90%' },
  { percent: 85, label: '85%' },
  { percent: 80, label: '80%' },
  { percent: 75, label: '75%' },
  { percent: 70, label: '70%' },
  { percent: 65, label: '65%' },
  { percent: 60, label: '60%' },
]

export default function OneRepMaxCalculator() {
  const router = useRouter()
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [results, setResults] = useState<{ [key: string]: number } | null>(null)

  const calculateOneRepMax = () => {
    const w = parseFloat(weight)
    const r = parseInt(reps)

    if (!w || !r || w <= 0 || r <= 0 || r > 20) {
      return
    }

    const calculatedResults = Object.entries(oneRepMaxFormulas).reduce((acc, [name, formula]) => {
      acc[name] = formula(w, r)
      return acc
    }, {} as { [key: string]: number })

    setResults(calculatedResults)
  }

  const getAverageOneRepMax = () => {
    if (!results) return 0
    const values = Object.values(results)
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  const reset = () => {
    setWeight('')
    setReps('')
    setResults(null)
  }

  return (
    <div className="bg-white min-h-screen">
      <Header
        title="1RM Calculator"
        leftAction={<BackButton onClick={() => router.back()} />}
      />

      <div className="p-4 space-y-6">
        {/* Calculator Form */}
        <Card>
          <CardHeader>
            <CardTitle>Calculate Your 1 Rep Max</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Weight (lbs)"
                type="number"
                step="2.5"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="225"
              />
              <Input
                label="Reps Performed"
                type="number"
                min="1"
                max="20"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="8"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={calculateOneRepMax}
                disabled={!weight || !reps}
                className="flex-1"
              >
                Calculate 1RM
              </Button>
              <Button
                variant="outline"
                onClick={reset}
                disabled={!weight && !reps && !results}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <>
            {/* Average 1RM */}
            <Card className="bg-primary-50 border-primary-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {getAverageOneRepMax().toFixed(1)} lbs
                </div>
                <div className="text-sm text-primary-800">
                  Estimated 1 Rep Max (Average)
                </div>
              </CardContent>
            </Card>

            {/* Individual Formula Results */}
            <Card>
              <CardHeader>
                <CardTitle>Formula Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(results).map(([formula, value]) => (
                    <div key={formula} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900">
                        {value.toFixed(1)} lbs
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {formula}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Training Percentages */}
            <Card>
              <CardHeader>
                <CardTitle>Training Percentages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {percentages.map((item) => {
                    const weight = (getAverageOneRepMax() * item.percent) / 100
                    return (
                      <div
                        key={item.percent}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium text-gray-900">
                          {item.label}
                        </span>
                        <span className="text-primary-600 font-semibold">
                          {weight.toFixed(1)} lbs
                        </span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              How to Use
            </h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Enter the weight and reps from your recent set</p>
              <p>• Best accuracy with 3-8 reps at 85-95% effort</p>
              <p>• Results are estimates - always prioritize safety</p>
              <p>• Use training percentages to plan your workouts</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}