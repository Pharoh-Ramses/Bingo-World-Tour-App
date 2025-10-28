import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      locations: locations.map(location => ({
        id: location.id,
        name: location.name,
        description: location.description,
        imageUrl: location.imageUrl,
        category: location.category
      }))
    })
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
