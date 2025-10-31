import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { sessionId } = await params

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

    // Find the session and verify ownership
    const session = await prisma.gameSession.findFirst({
      where: { 
        id: sessionId,
        createdById: user.id
      },
      include: {
        playerBoards: {
          include: {
            user: true
          }
        },
        revealedLocations: {
          include: {
            location: true
          },
          orderBy: {
            revealIndex: 'asc'
          }
        },
        _count: {
          select: {
            playerBoards: true
          }
        }
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      session: {
        id: session.id,
        code: session.code,
        status: session.status,
        revealInterval: session.revealInterval,
        currentRevealIndex: session.currentRevealIndex,
        maxReveals: session.maxReveals,
        playerCount: session._count.playerBoards,
        createdAt: session.createdAt,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        players: session.playerBoards.map(board => ({
          id: board.user.id,
          name: board.user.name || board.user.email,
          isReady: board.isReady
        }))
      },
      revealedLocations: session.revealedLocations.map(revealed => ({
        id: revealed.id,
        locationId: revealed.locationId,
        locationName: revealed.location.name,
        revealIndex: revealed.revealIndex,
        revealedAt: revealed.revealedAt
      }))
    })
  } catch (error) {
    console.error('Error fetching session details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
