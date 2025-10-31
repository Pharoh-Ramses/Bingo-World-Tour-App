import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionCode: string }> }
) {
  try {
    const { sessionCode } = await params

    // Validate session code format
    if (!/^[A-Z0-9]{6}$/.test(sessionCode)) {
      return NextResponse.json(
        { error: 'Invalid session code format' },
        { status: 400 }
      )
    }

    // Find the session
    const session = await prisma.gameSession.findUnique({
      where: { code: sessionCode },
      include: {
        playerBoards: {
          include: {
            user: true
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

    // Return session info
    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('Error fetching session status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
