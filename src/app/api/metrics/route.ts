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

    const metrics = await prisma.bodyMetric.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        recordedAt: 'desc',
      },
    })

    // Get latest weight and body fat
    const latestWeight = metrics.find(m => m.weight)?.weight
    const latestBodyFat = metrics.find(m => m.bodyFatPercentage)?.bodyFatPercentage

    return NextResponse.json({
      metrics,
      latestWeight,
      latestBodyFat,
    })
  } catch (error) {
    console.error('Error fetching metrics:', error)
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

    const metric = await prisma.bodyMetric.create({
      data: {
        userId: session.user.id,
        weight: weight || null,
        bodyFatPercentage: bodyFatPercentage || null,
        recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
      },
    })

    return NextResponse.json(metric, { status: 201 })
  } catch (error) {
    console.error('Error creating metric:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}