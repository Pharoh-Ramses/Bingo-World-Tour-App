import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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

    // Get the location
    const location = await prisma.location.findUnique({
      where: { id }
    })

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      location: {
        id: location.id,
        name: location.name,
        description: location.description,
        imageUrl: location.imageUrl,
        category: location.category,
        createdAt: location.createdAt,
        updatedAt: location.updatedAt
      }
    })
  } catch (error) {
    console.error('Error fetching location:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, description, imageUrl, category } = await request.json()

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    // Validate category if provided
    const validCategories = ['city', 'natural', 'cultural', 'adventure', 'unique']
    if (category && !validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be one of: city, natural, cultural, adventure, unique' },
        { status: 400 }
      )
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please sign out and sign back in.' },
        { status: 404 }
      )
    }

    // Check if location exists
    const existingLocation = await prisma.location.findUnique({
      where: { id }
    })

    if (!existingLocation) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      )
    }

    // Check if another location with the same name exists (excluding current location)
    if (name.trim() !== existingLocation.name) {
      const nameConflict = await prisma.location.findUnique({
        where: { name: name.trim() }
      })

      if (nameConflict) {
        return NextResponse.json(
          { error: 'A location with this name already exists' },
          { status: 409 }
        )
      }
    }

    // Update the location
    const location = await prisma.location.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        category: category || null
      }
    })

    return NextResponse.json({
      location: {
        id: location.id,
        name: location.name,
        description: location.description,
        imageUrl: location.imageUrl,
        category: location.category,
        createdAt: location.createdAt,
        updatedAt: location.updatedAt
      }
    })
  } catch (error) {
    console.error('Error updating location:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please sign out and sign back in.' },
        { status: 404 }
      )
    }

    // Check if location exists
    const location = await prisma.location.findUnique({
      where: { id }
    })

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      )
    }

    // Check if location is being used in any active game sessions
    const activeSessions = await prisma.gameSession.findMany({
      where: {
        status: { in: ['WAITING', 'ACTIVE', 'PAUSED'] },
        revealedLocations: {
          some: {
            locationId: id
          }
        }
      }
    })

    if (activeSessions.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete location that is being used in active game sessions' },
        { status: 409 }
      )
    }

    // Delete the location
    await prisma.location.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Location deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting location:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}