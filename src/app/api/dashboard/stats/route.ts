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

    // Get total number of workout sessions
    const totalWorkouts = await prisma.session.count({
      where: {
        userId: session.user.id,
        completedAt: { not: null }, // Only completed sessions
      },
    })

    // Get total sets and reps
    const setStats = await prisma.set.aggregate({
      where: {
        session: {
          userId: session.user.id,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        reps: true,
      },
    })

    // Get recent sessions
    const recentSessions = await prisma.session.findMany({
      where: {
        userId: session.user.id,
        completedAt: { not: null }, // Only completed sessions
      },
      include: {
        workoutPlan: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            sets: true,
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
      take: 5,
    })

    const dashboardStats = {
      totalWorkouts,
      totalSets: setStats._count.id || 0,
      totalReps: setStats._sum.reps || 0,
      recentSessions,
    }

    return NextResponse.json(dashboardStats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}