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

    // Get revealed locations for this session
    const revealedLocations = await prisma.revealedLocation.findMany({
      where: { sessionId: session.id },
      include: {
        location: true
      },
      orderBy: {
        revealIndex: 'asc'
      }
    })

    return NextResponse.json({
      revealedLocations: revealedLocations.map(revealed => ({
        id: revealed.id,
        locationId: revealed.locationId,
        locationName: revealed.location.name,
        revealIndex: revealed.revealIndex,
        revealedAt: revealed.revealedAt
      }))
    })
  } catch (error) {
    console.error('Error fetching revealed locations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
