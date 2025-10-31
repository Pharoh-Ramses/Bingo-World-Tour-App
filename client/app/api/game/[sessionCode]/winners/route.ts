import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionCode: string }> }
) {
  try {
    const { sessionCode } = await params

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

    // Get winners for this session
    const winners = await prisma.winner.findMany({
      where: { sessionId: session.id },
      include: {
        user: true
      },
      orderBy: {
        place: 'asc'
      }
    })

    return NextResponse.json({
      winners: winners.map(winner => ({
        id: winner.id,
        userId: winner.userId,
        userName: winner.user.name || winner.user.email,
        place: winner.place,
        winPattern: winner.winPattern,
        wonAt: winner.wonAt
      }))
    })
  } catch (error) {
    console.error('Error fetching winners:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
