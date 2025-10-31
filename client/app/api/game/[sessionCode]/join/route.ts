import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(
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
    const { boardLayout } = await request.json()

    // Validate session code format
    if (!/^[A-Z0-9]{6}$/.test(sessionCode)) {
      return NextResponse.json(
        { error: 'Invalid session code format' },
        { status: 400 }
      )
    }

    // Validate board layout
    if (!Array.isArray(boardLayout) || boardLayout.length !== 25) {
      return NextResponse.json(
        { error: 'Invalid board layout' },
        { status: 400 }
      )
    }

    // Check if exactly 24 locations are placed (excluding center)
    const placedLocations = boardLayout.filter((loc, index) => loc && index !== 12)
    if (placedLocations.length !== 24) {
      return NextResponse.json(
        { error: 'Must place exactly 24 locations on the board' },
        { status: 400 }
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

    if (session.status !== 'WAITING') {
      return NextResponse.json(
        { error: 'Session is not accepting new players' },
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

    // Check if user already has a board for this session
    const existingBoard = await prisma.playerBoard.findUnique({
      where: {
        userId_sessionId: {
          userId: user.id,
          sessionId: session.id
        }
      }
    })

    if (existingBoard) {
      return NextResponse.json(
        { error: 'You already have a board for this session' },
        { status: 400 }
      )
    }

    // Create player board
    const playerBoard = await prisma.playerBoard.create({
      data: {
        userId: user.id,
        sessionId: session.id,
        boardLayout: boardLayout,
        isReady: true
      }
    })

    // Create board location records
    const boardLocationData = boardLayout
      .map((locationId, position) => {
        if (locationId && position !== 12) { // Skip center position
          return {
            boardId: playerBoard.id,
            locationId: locationId,
            position: position
          }
        }
        return null
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)

    if (boardLocationData.length > 0) {
      await prisma.playerBoardLocation.createMany({
        data: boardLocationData
      })
    }

    return NextResponse.json({
      success: true,
      boardId: playerBoard.id
    })
  } catch (error) {
    console.error('Error joining session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
