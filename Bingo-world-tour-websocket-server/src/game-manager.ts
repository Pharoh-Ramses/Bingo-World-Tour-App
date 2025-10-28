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

      const game: ActiveGame = {
        sessionId: session.id,
        code: session.code,
        revealInterval: session.revealInterval,
        startedAt: session.startedAt!,
        timer: null,
        currentRevealIndex: session.currentRevealIndex,
        maxReveals: session.maxReveals,
        allLocationIds,
        clients: new Set(),
      };

      // Start auto-reveal timer
      this.startRevealTimer(game);
      this.activeGames.set(code, game);

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

  async revealNextLocation(game: ActiveGame) {
    try {
      if (game.currentRevealIndex >= game.maxReveals) {
        await this.endGame(game.code);
        return;
      }

      // Get revealed location IDs to exclude
      const revealed = await prisma.revealedLocation.findMany({
        where: { sessionId: game.sessionId },
        select: { locationId: true },
      });
      const revealedIds = revealed.map(r => r.locationId);

      const unrevealed = game.allLocationIds.filter(
        (id) => !revealedIds.includes(id),
      );

      if (unrevealed.length === 0) {
        await this.endGame(game.code);
        return;
      }

      // Random location selection
      const randomIndex = Math.floor(Math.random() * unrevealed.length);
      const locationId = unrevealed[randomIndex];

      // Increment reveal index
      game.currentRevealIndex++;

      // Save to database
      await prisma.revealedLocation.create({
        data: {
          sessionId: game.sessionId,
          locationId,
          revealIndex: game.currentRevealIndex,
          revealedAt: new Date(),
        },
      });

      // Update session's currentRevealIndex
      await prisma.gameSession.update({
        where: { id: game.sessionId },
        data: { currentRevealIndex: game.currentRevealIndex },
      });

      // Get location details
      const location = await prisma.location.findUnique({
        where: { id: locationId },
      });

      // Broadcast to all clients
      this.broadcast(game, {
        type: "location-revealed",
        data: location,
      });
    } catch (error) {
      console.error("Error revealing next location:", error);
      // Optionally broadcast error or retry
    }
  }

  async manualReveal(code: string) {
    const game = this.activeGames.get(code);
    if (!game) throw new Error("Game not found");

    await this.revealNextLocation(game);
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

  broadcast(game: ActiveGame, message: any) {
    const payload = JSON.stringify(message);
    game.clients.forEach((client) => {
      client.send(payload);
    });
  }

  getGame(code: string) {
    return this.activeGames.get(code);
  }
}