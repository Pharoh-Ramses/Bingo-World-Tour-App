import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { hasBingo, findWinningPatterns } from '@/lib/game-logic'

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
    const { winningPattern, selectedTiles } = await request.json()

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

    if (session.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Game is not active' },
        { status: 400 }
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

    // Check if player already won
    const existingWin = await prisma.winner.findFirst({
      where: {
        sessionId: session.id,
        userId: user.id
      }
    })

    if (existingWin) {
      return NextResponse.json(
        { error: 'You have already won this game' },
        { status: 400 }
      )
    }

    // Get revealed locations
    const revealedLocations = await prisma.revealedLocation.findMany({
      where: { sessionId: session.id },
      select: { locationId: true }
    })

    const revealedIds = revealedLocations.map(r => r.locationId)

    // Validate the BINGO
    if (!playerBoard.boardLayout || !Array.isArray(playerBoard.boardLayout)) {
      return NextResponse.json(
        { error: 'Invalid board layout' },
        { status: 400 }
      )
    }

    const revealedTiles = (playerBoard.boardLayout as (string | null)[]).map(locationId => 
      locationId ? revealedIds.includes(locationId) : false
    )

    if (!hasBingo(selectedTiles, revealedTiles)) {
      return NextResponse.json(
        { error: 'Invalid BINGO - pattern not complete' },
        { status: 400 }
      )
    }

    const patterns = findWinningPatterns(selectedTiles, revealedTiles)
    if (!patterns.includes(winningPattern)) {
      return NextResponse.json(
        { error: 'Invalid BINGO - pattern does not match' },
        { status: 400 }
      )
    }

    // Count existing winners to determine place
    const winnerCount = await prisma.winner.count({
      where: { sessionId: session.id }
    })

    const place = winnerCount + 1

    // Create winner record
    const winner = await prisma.winner.create({
      data: {
        sessionId: session.id,
        userId: user.id,
        boardId: playerBoard.id,
        winPattern: winningPattern,
        place: place
      }
    })

    return NextResponse.json({
      success: true,
      winner: {
        id: winner.id,
        place: winner.place,
        winPattern: winner.winPattern,
        wonAt: winner.wonAt
      }
    })
  } catch (error) {
    console.error('Error submitting BINGO:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
