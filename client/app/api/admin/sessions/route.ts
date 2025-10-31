import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { generateSessionCode } from '@/lib/game-logic'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get all sessions created by this user
    const sessions = await prisma.gameSession.findMany({
      where: { createdById: user.id },
      include: {
        _count: {
          select: {
            playerBoards: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      sessions: sessions.map(session => ({
        id: session.id,
        code: session.code,
        status: session.status,
        revealInterval: session.revealInterval,
        currentRevealIndex: session.currentRevealIndex,
        playerCount: session._count.playerBoards,
        createdAt: session.createdAt,
        startedAt: session.startedAt,
        endedAt: session.endedAt
      }))
    })
  } catch (error) {
    console.error('Error fetching admin sessions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { revealInterval } = await request.json()

    // Validate reveal interval
    if (![2, 5, 10, 15].includes(revealInterval)) {
      return NextResponse.json(
        { error: 'Invalid reveal interval' },
        { status: 400 }
      )
    }

    // Find user in database (should exist via webhook)
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please sign out and sign back in.' },
        { status: 404 }
      )
    }

    // Generate unique session code
    let sessionCode: string
    let attempts = 0
    do {
      sessionCode = generateSessionCode()
      attempts++
      
      if (attempts > 10) {
        return NextResponse.json(
          { error: 'Unable to generate unique session code' },
          { status: 500 }
        )
      }
    } while (await prisma.gameSession.findUnique({ where: { code: sessionCode } }))

    // Create the session
    const session = await prisma.gameSession.create({
      data: {
        code: sessionCode,
        revealInterval,
        createdById: user.id
      }
    })

    return NextResponse.json({
      session: {
        id: session.id,
        code: session.code,
        status: session.status,
        revealInterval: session.revealInterval,
        createdAt: session.createdAt
      }
    })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}