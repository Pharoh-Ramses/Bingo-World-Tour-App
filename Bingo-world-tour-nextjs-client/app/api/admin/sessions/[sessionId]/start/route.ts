import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(
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
        createdById: user.id,
        status: 'WAITING'
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or not in waiting status' },
        { status: 404 }
      )
    }

    // Validate that locations exist in database
    const locationCount = await prisma.location.count()
    if (locationCount === 0) {
      return NextResponse.json(
        { error: 'Cannot start game: No locations available. Please add locations first.' },
        { status: 400 }
      )
    }

    // Update session status to ACTIVE
    const updatedSession = await prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        status: 'ACTIVE',
        startedAt: new Date()
      }
    })

    // Trigger WebSocket server to start the game and broadcast to clients
    try {
      const wsServerUrl = process.env.WEBSOCKET_SERVER_URL || 'http://localhost:3001'
      const response = await fetch(`${wsServerUrl}/start-game`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionCode: updatedSession.code }),
      })

      if (!response.ok) {
        console.error('Failed to notify WebSocket server:', await response.text())
        // Don't fail the request, game is already started in DB
      } else {
        console.log(`Successfully triggered game start for session: ${updatedSession.code}`)
      }
    } catch (error) {
      console.error('Error calling WebSocket server:', error)
      // Don't fail the request, game is already started in DB
    }

    return NextResponse.json({
      session: {
        id: updatedSession.id,
        code: updatedSession.code,
        status: updatedSession.status,
        startedAt: updatedSession.startedAt
      }
    })
  } catch (error) {
    console.error('Error starting session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
