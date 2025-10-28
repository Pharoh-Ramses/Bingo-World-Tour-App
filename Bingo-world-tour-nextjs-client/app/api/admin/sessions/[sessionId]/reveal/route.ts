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
        status: 'ACTIVE'
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or not active' },
        { status: 404 }
      )
    }

    // Check if we've reached max reveals
    if (session.currentRevealIndex >= session.maxReveals) {
      return NextResponse.json(
        { error: 'Maximum reveals reached' },
        { status: 400 }
      )
    }

    // Get all locations that haven't been revealed yet
    const revealedLocationIds = await prisma.revealedLocation.findMany({
      where: { sessionId },
      select: { locationId: true }
    })

    const revealedIds = revealedLocationIds.map(r => r.locationId)

    // Get a random unrevealed location
    const availableLocations = await prisma.location.findMany({
      where: {
        id: { notIn: revealedIds }
      }
    })

    if (availableLocations.length === 0) {
      return NextResponse.json(
        { error: 'No more locations to reveal' },
        { status: 400 }
      )
    }

    // Select random location
    const randomLocation = availableLocations[Math.floor(Math.random() * availableLocations.length)]

    // Create revealed location record
    const revealedLocation = await prisma.revealedLocation.create({
      data: {
        sessionId,
        locationId: randomLocation.id,
        revealIndex: session.currentRevealIndex + 1
      },
      include: {
        location: true
      }
    })

    // Update session reveal index
    await prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        currentRevealIndex: session.currentRevealIndex + 1
      }
    })

    return NextResponse.json({
      revealedLocation: {
        id: revealedLocation.id,
        locationId: revealedLocation.locationId,
        locationName: revealedLocation.location.name,
        revealIndex: revealedLocation.revealIndex,
        revealedAt: revealedLocation.revealedAt
      }
    })
  } catch (error) {
    console.error('Error revealing location:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
