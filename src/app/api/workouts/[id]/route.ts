import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        id: params.id,
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
    })

    if (!workoutPlan) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 })
    }

    return NextResponse.json(workoutPlan)
  } catch (error) {
    console.error('Error fetching workout plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, exercises } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Verify ownership
    const existingPlan = await prisma.workoutPlan.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingPlan) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 })
    }

    // Update workout plan and exercises in a transaction
    const updatedPlan = await prisma.$transaction(async (tx) => {
      // Update the workout plan
      const plan = await tx.workoutPlan.update({
        where: { id: params.id },
        data: {
          name,
          description: description || null,
        },
      })

      // Delete existing exercises
      await tx.workoutExercise.deleteMany({
        where: { workoutPlanId: params.id },
      })

      // Create new exercises if provided
      if (exercises && Array.isArray(exercises) && exercises.length > 0) {
        await tx.workoutExercise.createMany({
          data: exercises.map((exercise: any, index: number) => ({
            workoutPlanId: params.id,
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

    // Fetch the complete updated workout plan
    const completeWorkoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: params.id },
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

    return NextResponse.json(completeWorkoutPlan)
  } catch (error) {
    console.error('Error updating workout plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership and delete
    const deletedPlan = await prisma.workoutPlan.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (deletedPlan.count === 0) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Workout plan deleted successfully' })
  } catch (error) {
    console.error('Error deleting workout plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}