import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ isAdmin: false });
    }

    // Find the user in our database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { isAdmin: true }
    });

    if (!user) {
      return NextResponse.json({ isAdmin: false });
    }

    return NextResponse.json({ isAdmin: user.isAdmin });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false });
  }
}