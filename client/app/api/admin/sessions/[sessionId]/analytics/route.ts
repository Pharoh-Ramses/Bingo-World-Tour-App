import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { userId } = await auth();
    const { sessionId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get session with analytics data
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        playerBoards: {
          include: {
            user: true,
            locations: {
              where: { isSelected: true }
            }
          }
        },
        winners: {
          include: {
            user: true
          },
          orderBy: { place: 'asc' }
        }
      }
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Calculate analytics
    const totalPlayers = session.playerBoards.length;
    const activePlayers = session.playerBoards.filter(pb => pb.isReady).length;
    const totalTilesMarked = session.playerBoards.reduce((sum, pb) =>
      sum + pb.locations.length, 0);
    
    const averageBoardCompletion = totalPlayers > 0 ?
      (session.playerBoards.reduce((sum, pb) =>
        sum + (pb.locations.length / 24), 0) / totalPlayers) * 100 : 0;

    const engagementScore = Math.min(100, (totalTilesMarked / (totalPlayers * 12)) * 100);

    const analyticsData = {
      totalPlayers,
      activePlayers,
      tilesMarkedPerMinute: totalTilesMarked / Math.max(1, (Date.now() - session.createdAt.getTime()) / 60000),
      averageTimeToMark: 0, // Placeholder - would need additional tracking
      peakActivityTime: new Date(), // Would be calculated from timestamps
      engagementScore,
      startTime: session.createdAt,
      lastActivityTime: new Date(),
      currentRevealIndex: session.currentRevealIndex,
      totalReveals: session.maxReveals,
      winnersCount: session.winners.length,
      averageBoardCompletion,
      playerBreakdown: session.playerBoards.map(pb => ({
        userId: pb.userId,
        name: pb.user?.name || 'Unknown',
        tilesMarked: pb.locations.length,
        completionPercentage: (pb.locations.length / 24) * 100,
        isReady: pb.isReady,
        joinTime: pb.joinedAt
      })),
      winners: session.winners.map(w => ({
        place: w.place,
        userId: w.userId,
        userName: w.user?.name || 'Unknown',
        winPattern: w.winPattern,
        claimedAt: w.wonAt,
        boardCompletion: 100 // Winners have completed boards by definition
      }))
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}