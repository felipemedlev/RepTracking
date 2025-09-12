import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, exerciseId, reps, weight } = body

    if (!sessionId || !exerciseId || reps === undefined) {
      return NextResponse.json(
        { error: 'Session ID, exercise ID, and reps are required' },
        { status: 400 }
      )
    }

    // Verify the session belongs to the user
    const workoutSession = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
    })

    if (!workoutSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Verify the exercise exists
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    })

    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
    }

    // Get the next set number for this exercise in this session
    const existingSets = await prisma.set.count({
      where: {
        sessionId,
        exerciseId,
      },
    })

    const newSet = await prisma.set.create({
      data: {
        sessionId,
        exerciseId,
        setNumber: existingSets + 1,
        reps: parseInt(reps),
        weight: weight ? parseFloat(weight) : null,
        completedAt: new Date(),
      },
      include: {
        exercise: {
          select: {
            name: true,
            category: true,
          },
        },
      },
    })

    return NextResponse.json(newSet, { status: 201 })
  } catch (error) {
    console.error('Error creating set:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}