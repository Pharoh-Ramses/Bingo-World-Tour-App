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
        status: 'PAUSED'
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or not paused' },
        { status: 404 }
      )
    }

    // Update session status to ACTIVE
    const updatedSession = await prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        status: 'ACTIVE'
      }
    })

    return NextResponse.json({
      session: {
        id: updatedSession.id,
        code: updatedSession.code,
        status: updatedSession.status
      }
    })
  } catch (error) {
    console.error('Error resuming session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
