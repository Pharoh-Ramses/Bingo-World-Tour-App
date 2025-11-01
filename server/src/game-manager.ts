import { prisma } from "./utils/prisma";
import type { GameSession, Location } from "@prisma/client";

interface ActiveGame {
  sessionId: string;
  code: string;
  revealInterval: number;
  startedAt: Date;
  timer: ReturnType<typeof setTimeout> | null;
  currentRevealIndex: number;
  maxReveals: number;
  allLocationIds: string[];
  clients: Set<any>; // WebSocket clients
}

export class GameManager {
  private activeGames: Map<string, ActiveGame> = new Map();

  async startGame(code: string) {
    try {
      const session = await prisma.gameSession.findUnique({
        where: { code },
        include: { revealedLocations: { orderBy: { revealIndex: 'asc' } } },
      });

      if (!session || session.status !== "ACTIVE") {
        throw new Error("Invalid session");
      }

      // Get all location IDs
      const locations = await prisma.location.findMany({ select: { id: true } });
      const allLocationIds = locations.map((l) => l.id);

      // Validate that locations exist
      if (allLocationIds.length === 0) {
        throw new Error("Cannot start game: No locations available in database");
      }

      // Check if game already exists and preserve existing clients
      const existingGame = this.activeGames.get(code);
      const existingClients = existingGame?.clients || new Set();

      const game: ActiveGame = {
        sessionId: session.id,
        code: session.code,
        revealInterval: session.revealInterval,
        startedAt: session.startedAt!,
        timer: null,
        currentRevealIndex: session.currentRevealIndex,
        maxReveals: session.maxReveals,
        allLocationIds,
        clients: existingClients, // Preserve existing clients
      };

      // Start auto-reveal timer
      this.startRevealTimer(game);
      this.activeGames.set(code, game);

      // Reveal the first location immediately
      const revealedLocationData = await this.revealNextLocation(game);
      console.log(`Revealed initial location for session: ${code}`);

      // Broadcast game-started with location data to all connected clients
      this.broadcast(game, { 
        type: "game-started",
        ...(revealedLocationData && { location: revealedLocationData })
      });
      console.log(`Broadcasted game-started for session: ${code}`);

      return game;
    } catch (error) {
      console.error("Error starting game:", error);
      throw error;
    }
  }

  private startRevealTimer(game: ActiveGame) {
    const scheduleNextReveal = () => {
      game.timer = setTimeout(async () => {
        await this.revealNextLocation(game);
        if (this.activeGames.has(game.code)) {
          scheduleNextReveal(); // Recurse for next reveal
        }
      }, game.revealInterval * 60 * 1000);
    };
    scheduleNextReveal();
  }

  async revealNextLocation(game: ActiveGame): Promise<any> {
    try {
      // Sync currentRevealIndex with database before checking limits
      try {
        const session = await prisma.gameSession.findUnique({
          where: { id: game.sessionId },
          select: { currentRevealIndex: true },
        });
        if (session) {
          game.currentRevealIndex = session.currentRevealIndex;
          console.log(`Synced currentRevealIndex from DB: ${game.currentRevealIndex}`);
        }
      } catch (syncError) {
        console.error(`Error syncing currentRevealIndex for session ${game.code}:`, syncError);
        // Continue with existing value
      }

      console.log(`revealNextLocation called for session ${game.code}: currentIndex=${game.currentRevealIndex}, maxReveals=${game.maxReveals}`);

      if (game.currentRevealIndex >= game.maxReveals) {
        console.log(`Max reveals reached for session ${game.code}, ending game`);
        await this.endGame(game.code);
        return null;
      }

      // Get revealed location IDs to exclude
      let revealed;
      try {
        revealed = await prisma.revealedLocation.findMany({
          where: { sessionId: game.sessionId },
          select: { locationId: true },
        });
      } catch (dbError) {
        console.error(`Database error fetching revealed locations for session ${game.code}:`, dbError);
        return null; // Don't crash, just skip this reveal
      }

      const revealedIds = revealed.map(r => r.locationId);

      const unrevealed = game.allLocationIds.filter(
        (id) => !revealedIds.includes(id),
      );

      console.log(`Session ${game.code}: Total locations=${game.allLocationIds.length}, Revealed=${revealedIds.length}, Unrevealed=${unrevealed.length}`);

      if (unrevealed.length === 0) {
        console.error(`No unrevealed locations available for session ${game.code}. Total locations: ${game.allLocationIds.length}, Revealed: ${revealedIds.length}`);
        await this.endGame(game.code);
        return null;
      }

      // Random location selection
      const randomIndex = Math.floor(Math.random() * unrevealed.length);
      const locationId = unrevealed[randomIndex];

      // Increment reveal index
      game.currentRevealIndex++;

      // Save to database
      try {
        await prisma.revealedLocation.create({
          data: {
            sessionId: game.sessionId,
            locationId,
            revealIndex: game.currentRevealIndex,
            revealedAt: new Date(),
          },
        });
      } catch (dbError) {
        console.error(`Database error creating revealed location for session ${game.code}:`, dbError);
        // Rollback the increment
        game.currentRevealIndex--;
        return null;
      }

      // Update session's currentRevealIndex
      try {
        await prisma.gameSession.update({
          where: { id: game.sessionId },
          data: { currentRevealIndex: game.currentRevealIndex },
        });
      } catch (dbError) {
        console.error(`Database error updating session for ${game.code}:`, dbError);
        // Continue anyway - the reveal was created
      }

      // Get location details
      let location;
      try {
        location = await prisma.location.findUnique({
          where: { id: locationId },
        });
      } catch (dbError) {
        console.error(`Database error fetching location ${locationId}:`, dbError);
        return null;
      }

      if (!location) {
        console.error(`Location not found: ${locationId}`);
        return null;
      }

      // Get the revealed location record to get the exact revealIndex and revealedAt
      let revealedLocation;
      try {
        revealedLocation = await prisma.revealedLocation.findFirst({
          where: {
            sessionId: game.sessionId,
            locationId: locationId,
            revealIndex: game.currentRevealIndex,
          },
          orderBy: { revealedAt: 'desc' },
        });
      } catch (dbError) {
        console.error(`Database error fetching revealed location record:`, dbError);
        // Continue with default values
      }

      // Prepare location data for broadcast
      const locationData = {
        ...location,
        revealIndex: game.currentRevealIndex,
        revealedAt: revealedLocation?.revealedAt.toISOString() || new Date().toISOString(),
      };

      // Broadcast to all clients with revealIndex and revealedAt
      try {
        this.broadcast(game, {
          type: "location-revealed",
          data: locationData,
        });
        console.log(`Broadcasted location-revealed for session ${game.code}: ${location.name} (index ${game.currentRevealIndex})`);
      } catch (broadcastError) {
        console.error(`Error broadcasting location reveal for session ${game.code}:`, broadcastError);
        // Continue - the location was revealed in DB
      }

      // Return location data for use in game-started message
      return locationData;
    } catch (error) {
      console.error("Error revealing next location:", error);
      // Log but don't crash - the server should continue running
      return null;
    }
  }

  async manualReveal(code: string) {
    const game = this.activeGames.get(code);
    if (!game) {
      // If game not in memory, try to load it from database
      const session = await prisma.gameSession.findUnique({
        where: { code },
        include: { revealedLocations: { orderBy: { revealIndex: 'asc' } } },
      });

      if (!session || session.status !== "ACTIVE") {
        throw new Error("Game not found or not active");
      }

      // Get all location IDs
      const locations = await prisma.location.findMany({ select: { id: true } });
      const allLocationIds = locations.map((l) => l.id);

      // Create game object with existing clients if any
      const existingGame = this.activeGames.get(code);
      const existingClients = existingGame?.clients || new Set();

      const newGame: ActiveGame = {
        sessionId: session.id,
        code: session.code,
        revealInterval: session.revealInterval,
        startedAt: session.startedAt!,
        timer: existingGame?.timer || null,
        currentRevealIndex: session.currentRevealIndex,
        maxReveals: session.maxReveals,
        allLocationIds,
        clients: existingClients,
      };

      // Start timer if game was active but not in memory
      if (!existingGame && session.status === "ACTIVE") {
        this.startRevealTimer(newGame);
      }

      this.activeGames.set(code, newGame);
      
      // Now reveal the location
      await this.revealNextLocation(newGame);
    } else {
      // Sync currentRevealIndex before revealing
      await this.revealNextLocation(game);
    }
  }

  async pauseGame(code: string) {
    try {
      const game = this.activeGames.get(code);
      if (!game || !game.timer) return;

      clearTimeout(game.timer);
      game.timer = null;

      await prisma.gameSession.update({
        where: { code },
        data: { status: "PAUSED" },
      });

      this.broadcast(game, { type: "game-paused" });
    } catch (error) {
      console.error("Error pausing game:", error);
    }
  }

  async resumeGame(code: string) {
    try {
      const game = this.activeGames.get(code);
      if (!game) return;

      this.startRevealTimer(game);

      await prisma.gameSession.update({
        where: { code },
        data: { status: "ACTIVE" },
      });

      this.broadcast(game, { type: "game-resumed" });
    } catch (error) {
      console.error("Error resuming game:", error);
    }
  }

  async endGame(code: string) {
    try {
      const game = this.activeGames.get(code);
      if (!game) return;

      if (game.timer) {
        clearTimeout(game.timer);
      }

      await prisma.gameSession.update({
        where: { code },
        data: { status: "ENDED", endedAt: new Date() },
      });

      this.broadcast(game, { type: "game-ended" });
      this.activeGames.delete(code);
    } catch (error) {
      console.error("Error ending game:", error);
    }
  }

  addClient(code: string, client: any) {
    let game = this.activeGames.get(code);
    if (!game) {
      // Create a waiting game for clients to join
      game = {
        sessionId: '',
        code: code,
        revealInterval: 0,
        startedAt: new Date(),
        timer: null,
        currentRevealIndex: 0,
        maxReveals: 0,
        allLocationIds: [],
        clients: new Set(),
      };
      this.activeGames.set(code, game);
      console.log(`Created waiting game for session: ${code}`);
    }
    game.clients.add(client);
    console.log(`Added client to game for session: ${code}, total clients: ${game.clients.size}`);
  }

  removeClient(code: string, client: any) {
    const game = this.activeGames.get(code);
    if (game) {
      game.clients.delete(client);
    }
  }

  broadcast(gameOrCode: ActiveGame | string, message: any) {
    const game = typeof gameOrCode === 'string'
      ? this.activeGames.get(gameOrCode)
      : gameOrCode;

    if (!game) return;

    const payload = JSON.stringify(message);
    const closedClients: any[] = [];
    
    game.clients.forEach((client) => {
      try {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(payload);
        } else {
          closedClients.push(client);
        }
      } catch (error) {
        console.error(`Error broadcasting to client:`, error);
        closedClients.push(client);
      }
    });

    // Remove closed clients
    closedClients.forEach((client) => {
      game.clients.delete(client);
    });
  }

  broadcastExcept(code: string, excludeClient: any, message: any) {
    const game = this.activeGames.get(code);
    if (!game) return;

    const payload = JSON.stringify(message);
    const closedClients: any[] = [];
    
    game.clients.forEach((client) => {
      if (client !== excludeClient) {
        try {
          if (client.readyState === 1) { // WebSocket.OPEN
            client.send(payload);
          } else {
            closedClients.push(client);
          }
        } catch (error) {
          console.error(`Error broadcasting to client:`, error);
          closedClients.push(client);
        }
      }
    });

    // Remove closed clients
    closedClients.forEach((client) => {
      game.clients.delete(client);
    });
  }

  async broadcastPlayerReady(code: string, userId: string) {
    try {
      // Get the game session to find the player board
      const session = await prisma.gameSession.findUnique({
        where: { code },
      });

      if (!session) {
        console.error(`Session not found for code: ${code}`);
        return;
      }

      // Fetch player board info to get user details and ready status
      const playerBoard = await prisma.playerBoard.findUnique({
        where: {
          userId_sessionId: {
            userId: userId,
            sessionId: session.id,
          },
        },
        include: {
          user: true,
        },
      });

      if (!playerBoard) {
        console.error(`Player board not found for userId: ${userId}, sessionId: ${session.id}`);
        return;
      }

      const playerInfo = {
        userId: userId,
        userName: playerBoard.user.name || undefined,
        isReady: playerBoard.isReady,
        joinedAt: playerBoard.joinedAt.toISOString(),
      };

      // Broadcast player-ready to all connected clients
      this.broadcast(code, {
        type: "player-ready",
        data: playerInfo,
      });

      console.log(`Broadcasted player-ready for userId: ${userId}, isReady: ${playerBoard.isReady}`);
    } catch (error) {
      console.error(`Error broadcasting player ready for session ${code}:`, error);
    }
  }

  getGame(code: string) {
    return this.activeGames.get(code);
  }
}