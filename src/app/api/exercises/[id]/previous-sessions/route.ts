import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    // Get previous sessions for this exercise
    const previousSets = await prisma.set.findMany({
      where: {
        exerciseId: id,
        session: {
          userId: session.user.id,
          completedAt: { not: null }, // Only completed sessions
        },
      },
      include: {
        session: {
          select: {
            startedAt: true,
            workoutPlan: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: limit * 10, // Get more sets to group by session
    })

    // Group sets by session and get the most recent sessions
    const sessionMap = new Map()
    previousSets.forEach(set => {
      const sessionKey = set.sessionId
      if (!sessionMap.has(sessionKey)) {
        sessionMap.set(sessionKey, {
          sessionId: set.sessionId,
          date: set.session.startedAt,
          workoutPlan: set.session.workoutPlan.name,
          sets: [],
        })
      }
      sessionMap.get(sessionKey).sets.push({
        reps: set.reps,
        weight: set.weight,
      })
    })

    // Convert to array, sort by date, and limit results
    const previousSessions = Array.from(sessionMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
      .map(session => ({
        ...session,
        maxWeight: Math.max(...session.sets.map((s: any) => s.weight || 0)),
        totalSets: session.sets.length,
        totalReps: session.sets.reduce((sum: number, s: any) => sum + s.reps, 0),
      }))

    return NextResponse.json(previousSessions)
  } catch (error) {
    console.error('Error fetching previous sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}