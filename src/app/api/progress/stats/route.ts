import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total workouts
    const totalWorkouts = await prisma.session.count({
      where: {
        userId: session.user.id,
        completedAt: { not: null },
      },
    })

    // Get all sets with exercise and session info
    const sets = await prisma.set.findMany({
      where: {
        session: {
          userId: session.user.id,
          completedAt: { not: null },
        },
      },
      include: {
        exercise: {
          select: {
            name: true,
          },
        },
        session: {
          select: {
            startedAt: true,
          },
        },
      },
      orderBy: {
        completedAt: 'asc',
      },
    })

    // Calculate total volume and average weight
    const totalVolume = sets.reduce((sum, set) => {
      return sum + (set.weight || 0) * (set.reps || 0)
    }, 0)

    const weightSets = sets.filter(set => set.weight && set.weight > 0)
    const averageWeight = weightSets.length > 0 
      ? weightSets.reduce((sum, set) => sum + (set.weight || 0), 0) / weightSets.length
      : 0

    // Group sets by date for volume progress
    const volumeByDate = new Map<string, number>()
    sets.forEach(set => {
      const date = new Date(set.session.startedAt).toISOString().split('T')[0]
      const volume = (set.weight || 0) * (set.reps || 0)
      volumeByDate.set(date, (volumeByDate.get(date) || 0) + volume)
    })

    const volumeProgress = Array.from(volumeByDate.entries())
      .map(([date, volume]) => ({ date, volume }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30) // Last 30 data points

    // Group sets by exercise for strength progress
    const exerciseMaxWeights = new Map<string, Array<{ date: string, weight: number }>>()
    weightSets.forEach(set => {
      const exerciseName = set.exercise.name
      const date = new Date(set.session.startedAt).toISOString().split('T')[0]
      const weight = set.weight || 0

      if (!exerciseMaxWeights.has(exerciseName)) {
        exerciseMaxWeights.set(exerciseName, [])
      }

      const existing = exerciseMaxWeights.get(exerciseName)!.find(item => item.date === date)
      if (existing) {
        existing.weight = Math.max(existing.weight, weight)
      } else {
        exerciseMaxWeights.get(exerciseName)!.push({ date, weight })
      }
    })

    const strengthProgress = Array.from(exerciseMaxWeights.entries())
      .flatMap(([exercise, data]) => 
        data.map(({ date, weight }) => ({ date, weight, exercise }))
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-100) // Last 100 data points

    // Exercise statistics
    const exerciseStatsMap = new Map<string, {
      maxWeight: number
      totalSets: number
      totalReps: number
    }>()

    sets.forEach(set => {
      const exerciseName = set.exercise.name
      if (!exerciseStatsMap.has(exerciseName)) {
        exerciseStatsMap.set(exerciseName, {
          maxWeight: 0,
          totalSets: 0,
          totalReps: 0,
        })
      }

      const stats = exerciseStatsMap.get(exerciseName)!
      stats.maxWeight = Math.max(stats.maxWeight, set.weight || 0)
      stats.totalSets += 1
      stats.totalReps += (set.reps || 0)
    })

    const exerciseStats = Array.from(exerciseStatsMap.entries())
      .map(([exercise, stats]) => ({
        exercise,
        maxWeight: stats.maxWeight,
        totalSets: stats.totalSets,
        averageReps: Math.round(stats.totalReps / stats.totalSets),
      }))
      .sort((a, b) => b.maxWeight - a.maxWeight)

    const progressStats = {
      totalVolume,
      averageWeight,
      totalWorkouts,
      volumeProgress,
      strengthProgress,
      exerciseStats,
    }

    return NextResponse.json(progressStats)
  } catch (error) {
    console.error('Error fetching progress stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}