import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionCode: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { sessionCode } = await params

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

    // Find the session
    const session = await prisma.gameSession.findUnique({
      where: { code: sessionCode }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Find player's board
    const playerBoard = await prisma.playerBoard.findUnique({
      where: {
        userId_sessionId: {
          userId: user.id,
          sessionId: session.id
        }
      }
    })

    if (!playerBoard) {
      return NextResponse.json(
        { error: 'Player board not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      board: {
        id: playerBoard.id,
        boardLayout: playerBoard.boardLayout,
        isReady: playerBoard.isReady
      }
    })
  } catch (error) {
    console.error('Error fetching player board:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
