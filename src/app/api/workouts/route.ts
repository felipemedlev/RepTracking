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

    const workoutPlans = await prisma.workoutPlan.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        workoutExercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            sessions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(workoutPlans)
  } catch (error) {
    console.error('Error fetching workout plans:', error)
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
    const { name, description, exercises } = body

    if (!name || !Array.isArray(exercises)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create workout plan with exercises in a transaction
    const workoutPlan = await prisma.$transaction(async (tx) => {
      const plan = await tx.workoutPlan.create({
        data: {
          name,
          description: description || null,
          userId: session.user.id,
        },
      })

      // Create workout exercises
      if (exercises.length > 0) {
        await tx.workoutExercise.createMany({
          data: exercises.map((exercise: any, index: number) => ({
            workoutPlanId: plan.id,
            exerciseId: exercise.exerciseId,
            targetSets: exercise.targetSets,
            targetReps: exercise.targetReps,
            restSeconds: exercise.restSeconds,
            order: index,
          })),
        })
      }

      return plan
    })

    // Fetch the complete workout plan with exercises
    const completeWorkoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: workoutPlan.id },
      include: {
        workoutExercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    return NextResponse.json(completeWorkoutPlan, { status: 201 })
  } catch (error) {
    console.error('Error creating workout plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}