import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { userId } = await auth();
    const { sessionId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const exportOptions = {
      format: searchParams.get('format') || 'csv',
      dataTypes: searchParams.getAll('dataTypes') || ['players', 'winners', 'engagement']
    };

    // Get session data
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

    // Compile export data
    const exportData = {
      eventInfo: {
        eventName: `Bingo World Tour - ${session.code}`,
        date: session.createdAt,
        duration: session.endedAt ? 
          Math.floor((session.endedAt.getTime() - session.createdAt.getTime()) / 60000) : 
          Math.floor((Date.now() - session.createdAt.getTime()) / 60000),
        totalPlayers: session.playerBoards.length,
        winners: session.winners.map(w => ({
          place: w.place,
          name: w.user.name,
          email: w.user.email,
          winPattern: w.winPattern,
          claimedAt: w.wonAt
        }))
      },
      playerData: session.playerBoards.map(pb => ({
        name: pb.user.name,
        email: pb.user.email,
        joinTime: pb.joinedAt,
        completionTime: null, // Not tracked in schema
        finalScore: pb.locations.length,
        isReady: pb.isReady
      })),
      engagementMetrics: {
        totalTilesMarked: session.playerBoards.reduce((sum, pb) =>
          sum + pb.locations.length, 0),
        averageGameTime: new Date(),
        peakActivityTime: new Date(),
        engagementScore: 0 // Would be calculated from analytics
      }
    };

    // Generate CSV content
    const csvContent = generateCSV(exportData, exportOptions);
    
    // Create filename
    const filename = `bingo_export_${session.code}_${new Date().toISOString().split('T')[0]}.${exportOptions.format}`;
    
    // Return appropriate response based on format
    if (exportOptions.format === 'csv') {
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    } else if (exportOptions.format === 'json') {
      return NextResponse.json(exportData, {
        headers: {
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });

  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to generate export" },
      { status: 500 }
    );
  }
}

interface ExportData {
  eventInfo: {
    eventName: string;
    date: Date;
    duration: number;
    totalPlayers: number;
    winners: Array<{
      place: number;
      name: string | null;
      email: string;
      winPattern: string;
      claimedAt: Date;
    }>;
  };
  playerData: Array<{
    name: string | null;
    email: string;
    joinTime: Date;
    completionTime: Date | null;
    finalScore: number;
    isReady: boolean;
  }>;
  engagementMetrics: {
    totalTilesMarked: number;
    averageGameTime: Date;
    peakActivityTime: Date;
    engagementScore: number;
  };
}

interface ExportOptions {
  format: string;
  dataTypes: string[];
}

function generateCSV(data: ExportData, options: ExportOptions): string {
  const headers = [];
  const rows = [];

  // Player data
  if (options.dataTypes.includes('players')) {
    headers.push('Player Name', 'Email', 'Join Time', 'Completion Time', 'Final Score', 'Is Ready');
    data.playerData.forEach((player) => {
      rows.push([
        player.name,
        player.email || '',
        player.joinTime,
        player.completionTime || '',
        player.finalScore,
        player.isReady
      ]);
    });
  }

  // Winner data
  if (options.dataTypes.includes('winners')) {
    if (rows.length > 0) rows.push([]); // Add blank row separator
    headers.push('Winner Place', 'Winner Name', 'Winner Email', 'Win Pattern', 'Claimed At');
    data.eventInfo.winners.forEach((winner) => {
      rows.push([
        winner.place,
        winner.name,
        winner.email,
        winner.winPattern,
        winner.claimedAt
      ]);
    });
  }

  // Event info
  if (options.dataTypes.includes('engagement')) {
    if (rows.length > 0) rows.push([]); // Add blank row separator
    headers.push('Event Name', 'Date', 'Duration (minutes)', 'Total Players', 'Total Tiles Marked');
    rows.push([
      data.eventInfo.eventName,
      data.eventInfo.date,
      data.eventInfo.duration,
      data.eventInfo.totalPlayers,
      data.engagementMetrics.totalTilesMarked
    ]);
  }

  // Combine headers and rows
  const allRows = [headers, ...rows];
  
  return allRows
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}