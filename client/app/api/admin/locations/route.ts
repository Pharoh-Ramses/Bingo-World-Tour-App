import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()

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

    // Get all locations
    const locations = await prisma.location.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      locations: locations.map(location => ({
        id: location.id,
        name: location.name,
        description: location.description,
        imageUrl: location.imageUrl,
        category: location.category,
        createdAt: location.createdAt
      }))
    })
  } catch (error) {
    console.error('Error fetching admin locations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

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

    // Check if location name already exists
    const existingLocation = await prisma.location.findUnique({
      where: { name: name.trim() }
    })

    if (existingLocation) {
      return NextResponse.json(
        { error: 'A location with this name already exists' },
        { status: 409 }
      )
    }

    // Create the location
    const location = await prisma.location.create({
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
        createdAt: location.createdAt
      }
    })
  } catch (error) {
    console.error('Error creating location:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}