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

    // Clean up old incomplete sessions (older than 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    await prisma.session.deleteMany({
      where: {
        userId: session.user.id,
        completedAt: null,
        startedAt: {
          lt: twentyFourHoursAgo,
        },
      },
    })

    const { searchParams } = new URL(request.url)
    const workoutPlanId = searchParams.get('workoutPlanId')

    const whereClause: Record<string, unknown> = {
      userId: session.user.id,
    }

    if (workoutPlanId) {
      whereClause.workoutPlanId = workoutPlanId
    }

    const sessions = await prisma.session.findMany({
      where: whereClause,
      select: {
        id: true,
        startedAt: true,
        completedAt: true,
        workoutPlanId: true,
        workoutPlan: {
          select: {
            name: true,
          },
        },
        sets: {
          include: {
            exercise: {
              select: {
                name: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { workoutPlanId, notes } = body

    if (!workoutPlanId) {
      return NextResponse.json({ error: 'Workout plan ID is required' }, { status: 400 })
    }

    // Verify the workout plan belongs to the user
    const workoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        id: workoutPlanId,
        userId: session.user.id,
      },
    })

    if (!workoutPlan) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 })
    }

    const newSession = await prisma.session.create({
      data: {
        userId: session.user.id,
        workoutPlanId,
        // Note: startedAt has @default(now()) in schema, so we don't need to set it explicitly
      },
      include: {
        workoutPlan: {
          select: {
            name: true,
            workoutExercises: {
              include: {
                exercise: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        sets: {
          include: {
            exercise: {
              select: {
                name: true,
                category: true,
              },
            },
          },
          orderBy: {
            completedAt: 'asc',
          },
        },
      },
    })

    return NextResponse.json(newSession, { status: 201 })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}