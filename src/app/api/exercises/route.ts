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

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let whereClause: any = {
      OR: [
        { isCustom: false }, // Default exercises
        { userId: session.user.id }, // User's custom exercises
      ],
    }

    if (category) {
      whereClause.category = category
    }

    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive',
      }
    }

    const exercises = await prisma.exercise.findMany({
      where: whereClause,
      orderBy: [
        { isCustom: 'asc' }, // Default exercises first
        { name: 'asc' },
      ],
    })

    return NextResponse.json(exercises)
  } catch (error) {
    console.error('Error fetching exercises:', error)
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
    const { name, category } = body

    if (!name || !category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 })
    }

    const validCategories = ['push', 'pull', 'legs', 'core']
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    const exercise = await prisma.exercise.create({
      data: {
        name,
        category,
        isCustom: true,
        userId: session.user.id,
      },
    })

    return NextResponse.json(exercise, { status: 201 })
  } catch (error) {
    console.error('Error creating exercise:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}