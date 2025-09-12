import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { weight, bodyFatPercentage, recordedAt } = body

    if (!weight && !bodyFatPercentage) {
      return NextResponse.json(
        { error: 'At least one metric (weight or body fat percentage) is required' },
        { status: 400 }
      )
    }

    // Validate weight
    if (weight !== undefined && (weight <= 0 || weight > 1000)) {
      return NextResponse.json(
        { error: 'Weight must be between 0 and 1000 lbs' },
        { status: 400 }
      )
    }

    // Validate body fat percentage
    if (bodyFatPercentage !== undefined && (bodyFatPercentage < 0 || bodyFatPercentage > 100)) {
      return NextResponse.json(
        { error: 'Body fat percentage must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Check if the metric exists and belongs to the user
    const existingMetric = await prisma.bodyMetric.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingMetric) {
      return NextResponse.json({ error: 'Metric not found' }, { status: 404 })
    }

    const updatedMetric = await prisma.bodyMetric.update({
      where: { id },
      data: {
        weight: weight || null,
        bodyFatPercentage: bodyFatPercentage || null,
        recordedAt: recordedAt ? new Date(recordedAt) : existingMetric.recordedAt,
      },
    })

    return NextResponse.json(updatedMetric)
  } catch (error) {
    console.error('Error updating metric:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if the metric exists and belongs to the user
    const existingMetric = await prisma.bodyMetric.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingMetric) {
      return NextResponse.json({ error: 'Metric not found' }, { status: 404 })
    }

    await prisma.bodyMetric.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Metric deleted successfully' })
  } catch (error) {
    console.error('Error deleting metric:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}