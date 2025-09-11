import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

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
    const { reps, weight, restTime, notes } = body

    // Verify the set belongs to the user through the session
    const existingSet = await prisma.set.findFirst({
      where: {
        id: params.id,
        session: {
          userId: session.user.id,
        },
      },
    })

    if (!existingSet) {
      return NextResponse.json({ error: 'Set not found' }, { status: 404 })
    }

    const updatedSet = await prisma.set.update({
      where: { id: params.id },
      data: {
        reps: reps !== undefined ? parseInt(reps) : undefined,
        weight: weight !== undefined ? (weight ? parseFloat(weight) : null) : undefined,
        restTime: restTime !== undefined ? (restTime ? parseInt(restTime) : null) : undefined,
        notes: notes !== undefined ? (notes || null) : undefined,
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

    return NextResponse.json(updatedSet)
  } catch (error) {
    console.error('Error updating set:', error)
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

    // Verify ownership through session and delete
    const deletedSet = await prisma.set.deleteMany({
      where: {
        id: params.id,
        session: {
          userId: session.user.id,
        },
      },
    })

    if (deletedSet.count === 0) {
      return NextResponse.json({ error: 'Set not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Set deleted successfully' })
  } catch (error) {
    console.error('Error deleting set:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}