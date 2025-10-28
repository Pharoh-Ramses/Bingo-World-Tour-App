# WebSocket Server for BINGO World Tour

## Project Structure

Create a separate directory `bingo-ws-server/` with:

```
bingo-ws-server/
├── package.json
├── tsconfig.json
├── .env
├── prisma/
│   └── schema.prisma (copy from Next.js app)
├── src/
│   ├── index.ts (main server entry)
│   ├── game-manager.ts (game state & timers)
│   ├── websocket-handler.ts (WS connection logic)
│   ├── types.ts (shared types)
│   └── utils/
│       ├── prisma.ts (Prisma client)
│       └── validation.ts (session code validation)
```

## Phase 1: Project Setup

### 1.1 Initialize Bun Project

Create `package.json`:

```json
{
  "name": "bingo-ws-server",
  "version": "1.0.0",
  "scripts": {
    "dev": "bun --watch src/index.ts",
    "start": "bun src/index.ts",
    "db:generate": "prisma generate",
    "db:push": "prisma db push"
  },
  "dependencies": {
    "@prisma/client": "latest",
    "prisma": "latest"
  },
  "devDependencies": {
    "bun-types": "latest"
  }
}
```

### 1.2 Copy Prisma Schema

Copy `prisma/schema.prisma` from Next.js app to maintain same models.

### 1.3 Environment Variables

Create `.env`:

```
DATABASE_URL="postgresql://..."
PORT=3001
NODE_ENV=development
```

## Phase 2: Core Server Setup

### 2.1 Main Server (`src/index.ts`)

Create Bun WebSocket server:

```typescript
import { GameManager } from "./game-manager";
import { handleWebSocket } from "./websocket-handler";

const PORT = process.env.PORT || 3001;
const gameManager = new GameManager();

const server = Bun.serve({
  port: PORT,
  fetch(req, server) {
    const url = new URL(req.url);

    // Health check endpoint
    if (url.pathname === "/health") {
      return new Response("OK", { status: 200 });
    }

    // WebSocket upgrade
    if (url.pathname === "/ws") {
      const sessionCode = url.searchParams.get("sessionCode");
      const userId = url.searchParams.get("userId");

      if (!sessionCode) {
        return new Response("Session code required", { status: 400 });
      }

      const upgraded = server.upgrade(req, {
        data: { sessionCode, userId },
      });

      return upgraded
        ? undefined
        : new Response("Upgrade failed", { status: 500 });
    }

    return new Response("Not found", { status: 404 });
  },
  websocket: handleWebSocket(gameManager),
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);
```

### 2.2 Prisma Client (`src/utils/prisma.ts`)

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

## Phase 3: Game Manager

### 3.1 Game Manager Class (`src/game-manager.ts`)

Manages game state and reveal timers:

```typescript
import { prisma } from "./utils/prisma";
import type { GameSession, Location } from "@prisma/client";

interface ActiveGame {
  sessionId: string;
  sessionCode: string;
  revealIntervalMinutes: number;
  startedAt: Date;
  timer: Timer | null;
  revealedLocationIds: string[];
  allLocationIds: string[];
  clients: Set<any>; // WebSocket clients
}

export class GameManager {
  private activeGames: Map<string, ActiveGame> = new Map();

  async startGame(sessionCode: string) {
    const session = await prisma.gameSession.findUnique({
      where: { sessionCode },
      include: { revealedLocations: true },
    });

    if (!session || session.status !== "ACTIVE") {
      throw new Error("Invalid session");
    }

    // Get all location IDs
    const locations = await prisma.location.findMany({ select: { id: true } });
    const allLocationIds = locations.map((l) => l.id);
    const revealedLocationIds = session.revealedLocations.map(
      (r) => r.locationId,
    );

    const game: ActiveGame = {
      sessionId: session.id,
      sessionCode: session.sessionCode,
      revealIntervalMinutes: session.revealIntervalMinutes,
      startedAt: session.startedAt!,
      timer: null,
      revealedLocationIds,
      allLocationIds,
      clients: new Set(),
    };

    // Start auto-reveal timer
    this.startRevealTimer(game);
    this.activeGames.set(sessionCode, game);

    return game;
  }

  private startRevealTimer(game: ActiveGame) {
    const intervalMs = game.revealIntervalMinutes * 60 * 1000;

    game.timer = setInterval(async () => {
      await this.revealNextLocation(game);
    }, intervalMs);
  }

  async revealNextLocation(game: ActiveGame) {
    const unrevealed = game.allLocationIds.filter(
      (id) => !game.revealedLocationIds.includes(id),
    );

    if (unrevealed.length === 0) {
      await this.endGame(game.sessionCode);
      return;
    }

    // Random location selection
    const randomIndex = Math.floor(Math.random() * unrevealed.length);
    const locationId = unrevealed[randomIndex];

    // Save to database
    await prisma.revealedLocation.create({
      data: {
        sessionId: game.sessionId,
        locationId,
        revealedAt: new Date(),
      },
    });

    // Get location details
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    game.revealedLocationIds.push(locationId);

    // Broadcast to all clients
    this.broadcast(game, {
      type: "location-revealed",
      data: location,
    });
  }

  async manualReveal(sessionCode: string) {
    const game = this.activeGames.get(sessionCode);
    if (!game) throw new Error("Game not found");

    await this.revealNextLocation(game);
  }

  async pauseGame(sessionCode: string) {
    const game = this.activeGames.get(sessionCode);
    if (!game || !game.timer) return;

    clearInterval(game.timer);
    game.timer = null;

    await prisma.gameSession.update({
      where: { sessionCode },
      data: { status: "PAUSED" },
    });

    this.broadcast(game, { type: "game-paused" });
  }

  async resumeGame(sessionCode: string) {
    const game = this.activeGames.get(sessionCode);
    if (!game) return;

    this.startRevealTimer(game);

    await prisma.gameSession.update({
      where: { sessionCode },
      data: { status: "ACTIVE" },
    });

    this.broadcast(game, { type: "game-resumed" });
  }

  async endGame(sessionCode: string) {
    const game = this.activeGames.get(sessionCode);
    if (!game) return;

    if (game.timer) {
      clearInterval(game.timer);
    }

    await prisma.gameSession.update({
      where: { sessionCode },
      data: { status: "ENDED", endedAt: new Date() },
    });

    this.broadcast(game, { type: "game-ended" });
    this.activeGames.delete(sessionCode);
  }

  addClient(sessionCode: string, client: any) {
    const game = this.activeGames.get(sessionCode);
    if (game) {
      game.clients.add(client);
    }
  }

  removeClient(sessionCode: string, client: any) {
    const game = this.activeGames.get(sessionCode);
    if (game) {
      game.clients.delete(client);
    }
  }

  private broadcast(game: ActiveGame, message: any) {
    const payload = JSON.stringify(message);
    game.clients.forEach((client) => {
      client.send(payload);
    });
  }

  getGame(sessionCode: string) {
    return this.activeGames.get(sessionCode);
  }
}
```

## Phase 4: WebSocket Handler

### 4.1 WebSocket Handler (`src/websocket-handler.ts`)

```typescript
import type { ServerWebSocket } from "bun";
import type { GameManager } from "./game-manager";
import { prisma } from "./utils/prisma";

interface WebSocketData {
  sessionCode: string;
  userId?: string;
}

export function handleWebSocket(gameManager: GameManager) {
  return {
    async open(ws: ServerWebSocket<WebSocketData>) {
      const { sessionCode, userId } = ws.data;

      // Validate session code
      const session = await prisma.gameSession.findUnique({
        where: { sessionCode },
        include: { revealedLocations: { include: { location: true } } },
      });

      if (!session) {
        ws.send(
          JSON.stringify({ type: "error", message: "Invalid session code" }),
        );
        ws.close();
        return;
      }

      // Add client to game
      gameManager.addClient(sessionCode, ws);

      // Send initial game state
      ws.send(
        JSON.stringify({
          type: "connected",
          data: {
            sessionId: session.id,
            sessionCode: session.sessionCode,
            status: session.status,
            revealedLocations: session.revealedLocations.map((r) => r.location),
          },
        }),
      );

      // Start game if not already active
      if (session.status === "ACTIVE" && !gameManager.getGame(sessionCode)) {
        await gameManager.startGame(sessionCode);
      }

      console.log(`Client connected to session ${sessionCode}`);
    },

    async message(ws: ServerWebSocket<WebSocketData>, message: string) {
      const { sessionCode } = ws.data;

      try {
        const data = JSON.parse(message);

        switch (data.type) {
          case "ping":
            ws.send(JSON.stringify({ type: "pong" }));
            break;

          case "manual-reveal":
            // Admin-triggered manual reveal
            await gameManager.manualReveal(sessionCode);
            break;

          case "pause":
            await gameManager.pauseGame(sessionCode);
            break;

          case "resume":
            await gameManager.resumeGame(sessionCode);
            break;

          case "end":
            await gameManager.endGame(sessionCode);
            break;

          case "bingo-claimed":
            // Broadcast bingo claim to all players
            const game = gameManager.getGame(sessionCode);
            if (game) {
              gameManager.broadcast(game, {
                type: "winner-found",
                data: { userId: data.userId, place: data.place },
              });
            }
            break;

          default:
            console.warn("Unknown message type:", data.type);
        }
      } catch (error) {
        console.error("Error handling message:", error);
        ws.send(
          JSON.stringify({ type: "error", message: "Invalid message format" }),
        );
      }
    },

    close(ws: ServerWebSocket<WebSocketData>) {
      const { sessionCode } = ws.data;
      gameManager.removeClient(sessionCode, ws);
      console.log(`Client disconnected from session ${sessionCode}`);
    },

    error(ws: ServerWebSocket<WebSocketData>, error: Error) {
      console.error("WebSocket error:", error);
    },
  };
}
```

## Phase 5: Types & Utilities

### 5.1 Types (`src/types.ts`)

```typescript
export interface WSMessage {
  type:
    | "location-revealed"
    | "game-paused"
    | "game-resumed"
    | "game-ended"
    | "winner-found"
    | "connected"
    | "error";
  data?: any;
  message?: string;
}

export interface ClientMessage {
  type: "ping" | "manual-reveal" | "pause" | "resume" | "end" | "bingo-claimed";
  userId?: string;
  place?: number;
}
```

## Phase 6: Next.js Integration

### 6.1 WebSocket Client Hook (`lib/useWebSocket.ts` in Next.js app)

```typescript
import { useEffect, useRef, useState } from "react";

export function useWebSocket(sessionCode: string, userId?: string) {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    const wsUrl = `ws://localhost:3001/ws?sessionCode=${sessionCode}${userId ? `&userId=${userId}` : ""}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setLastMessage(message);
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket disconnected");
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.current?.close();
    };
  }, [sessionCode, userId]);

  const send = (message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return { isConnected, lastMessage, send };
}
```

### 6.2 Update Game Pages

In `app/game/[sessionCode]/play/page.tsx`, replace fetch polling with:

```typescript
const { isConnected, lastMessage } = useWebSocket(sessionCode, user?.id);

useEffect(() => {
  if (lastMessage?.type === "location-revealed") {
    // Update revealed locations state
    setRevealedLocations((prev) => [...prev, lastMessage.data]);
  }
  // Handle other message types...
}, [lastMessage]);
```

## Phase 7: Deployment Considerations

### 7.1 Environment Setup

- Development: `bun run dev` (auto-restart on changes)
- Production: `bun run start`
- Database: Ensure PostgreSQL connection from WS server

### 7.2 CORS & Security

Add origin validation if needed:

```typescript
// In fetch handler
const origin = req.headers.get("origin");
if (origin && !allowedOrigins.includes(origin)) {
  return new Response("Forbidden", { status: 403 });
}
```

### 7.3 Process Management

Use PM2 or systemd for production deployment to auto-restart on crashes.

## Testing Plan

1. **Connection Test**: Verify clients can connect with valid session codes
2. **Auto-reveal Test**: Confirm locations reveal at correct intervals
3. **Manual Reveal Test**: Admin can trigger reveals before timer
4. **Pause/Resume Test**: Verify timer stops and restarts correctly
5. **Multiple Sessions Test**: Ensure isolated game state per session
6. **Disconnect Handling**: Clients can reconnect without data loss
7. **End Game Test**: All resources cleaned up properly

## Key Benefits

- **Performance**: Bun's native WebSocket support is extremely fast
- **Simplicity**: Direct database access, no API proxy needed
- **Real-time**: True bidirectional communication
- **Scalability**: Can handle many concurrent connections
- **Separation**: Game logic isolated from Next.js app
