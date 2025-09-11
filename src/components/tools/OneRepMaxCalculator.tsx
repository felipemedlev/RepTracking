'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface OneRepMaxResult {
  formula: string
  value: number
  percentage: number
}

interface PercentageRow {
  percentage: number
  weight: number
  reps: string
}

export function OneRepMaxCalculator() {
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [results, setResults] = useState<OneRepMaxResult[]>([])
  const [percentageTable, setPercentageTable] = useState<PercentageRow[]>([])

  const calculateOneRepMax = () => {
    const w = parseFloat(weight)
    const r = parseInt(reps)

    if (!w || !r || w <= 0 || r <= 0 || r > 30) return

    // Different 1RM formulas
    const formulas = [
      {
        name: 'Brzycki',
        calculate: (weight: number, reps: number) => weight * (36 / (37 - reps))
      },
      {
        name: 'Epley',
        calculate: (weight: number, reps: number) => weight * (1 + reps / 30)
      },
      {
        name: 'McGlothin',
        calculate: (weight: number, reps: number) => weight * Math.pow(100 / (101.3 - 2.67123 * reps), 1)
      },
      {
        name: 'Lombardi',
        calculate: (weight: number, reps: number) => weight * Math.pow(reps, 0.1)
      }
    ]

    const calculatedResults: OneRepMaxResult[] = formulas.map(formula => ({
      formula: formula.name,
      value: Math.round(formula.calculate(w, r) * 10) / 10,
      percentage: 100
    }))

    // Calculate average 1RM
    const average1RM = calculatedResults.reduce((sum, result) => sum + result.value, 0) / calculatedResults.length
    
    setResults(calculatedResults)

    // Generate percentage table based on average 1RM
    const percentages = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50]
    const repRanges = {
      100: '1',
      95: '2-3',
      90: '3-4',
      85: '5-6',
      80: '6-8',
      75: '8-10',
      70: '10-12',
      65: '12-15',
      60: '15-18',
      55: '18-20',
      50: '20+'
    }

    const table: PercentageRow[] = percentages.map(percentage => ({
      percentage,
      weight: Math.round(average1RM * (percentage / 100) * 10) / 10,
      reps: repRanges[percentage as keyof typeof repRanges]
    }))

    setPercentageTable(table)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    calculateOneRepMax()
  }

  const reset = () => {
    setWeight('')
    setReps('')
    setResults([])
    setPercentageTable([])
  }

  return (
    <div className="space-y-6">
      {/* Calculator Input */}
      <Card>
        <CardHeader>
          <CardTitle>One Rep Max Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Weight (lbs)"
                type="number"
                min="1"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="225"
                required
              />
              <Input
                label="Reps Performed"
                type="number"
                min="1"
                max="30"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="8"
                required
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                type="submit"
                disabled={!weight || !reps}
                className="flex-1"
              >
                Calculate 1RM
              </Button>
              {results.length > 0 && (
                <Button type="button" variant="outline" onClick={reset}>
                  Reset
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 1RM Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Estimated 1RM Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{result.formula} Formula</div>
                  </div>
                  <div className="text-lg font-bold text-primary-600">
                    {result.value} lbs
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-lg">
                <div>
                  <div className="font-semibold text-primary-900">Average</div>
                </div>
                <div className="text-xl font-bold text-primary-600">
                  {Math.round((results.reduce((sum, r) => sum + r.value, 0) / results.length) * 10) / 10} lbs
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Percentage Table */}
      {percentageTable.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Training Percentages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-700 border-b pb-2">
                <div>% of 1RM</div>
                <div>Weight (lbs)</div>
                <div>Rep Range</div>
              </div>
              {percentageTable.map((row, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-3 gap-4 text-sm py-2 rounded ${
                    row.percentage === 100 
                      ? 'bg-primary-50 font-semibold text-primary-900'
                      : index % 2 === 0 
                        ? 'bg-gray-50' 
                        : ''
                  }`}
                >
                  <div>{row.percentage}%</div>
                  <div className="font-medium">{row.weight}</div>
                  <div className="text-gray-600">{row.reps}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 mb-2">How to Use</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>1. Enter your data:</strong> Input the weight you lifted and how many reps you completed.
            </p>
            <p>
              <strong>2. View results:</strong> See your estimated 1RM calculated using different proven formulas.
            </p>
            <p>
              <strong>3. Use the percentage table:</strong> Plan your training using different intensities based on your 1RM.
            </p>
            <p className="text-xs mt-3">
              <strong>Note:</strong> These are estimates. Always prioritize proper form and safety when lifting heavy weights.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}