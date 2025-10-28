import type { ServerWebSocket } from "bun";
import type { GameManager } from "./game-manager";
import { prisma } from "./utils/prisma";

interface WebSocketData {
  code: string;
  userId?: string;
}

export function handleWebSocket(gameManager: GameManager) {
  return {
    async open(ws: ServerWebSocket<WebSocketData>) {
      const { code, userId } = ws.data;
      console.log(`WebSocket opened for session: ${code}, userId: ${userId}`);

      try {
        // Validate session code
        console.log(`Looking up session with code: ${code}`);
        const session = await prisma.gameSession.findUnique({
          where: { code },
          include: { revealedLocations: { include: { location: true }, orderBy: { revealIndex: 'asc' } } },
        });

        if (!session) {
          console.log(`Session not found for code: ${code}`);
          ws.send(
            JSON.stringify({ type: "error", message: "Invalid session code" }),
          );
          ws.close();
          return;
        }

        console.log(`Session found: ${session.id}, status: ${session.status}`);

        // Add client to game
        gameManager.addClient(code, ws);
        console.log(`Client added to game manager for session: ${code}`);

        // Send initial game state
        const initialMessage = {
          type: "connected",
          data: {
            sessionId: session.id,
            code: session.code,
            status: session.status,
            revealedLocations: session.revealedLocations.map((r) => r.location),
          },
        };
        
        console.log(`Sending initial message:`, JSON.stringify(initialMessage, null, 2));
        ws.send(JSON.stringify(initialMessage));

        // Start game if not already active
        if (session.status === "ACTIVE" && !gameManager.getGame(code)) {
          console.log(`Starting game for session: ${code}`);
          await gameManager.startGame(code);
        }

        console.log(`Client successfully connected to session ${code}`);
      } catch (error) {
        console.error("Error in WebSocket open:", error);
        ws.send(JSON.stringify({ type: "error", message: "Connection failed" }));
        ws.close();
      }
    },

    async message(ws: ServerWebSocket<WebSocketData>, message: string) {
      const { code } = ws.data;

      try {
        const data = JSON.parse(message);

        switch (data.type) {
          case "ping":
            ws.send(JSON.stringify({ type: "pong" }));
            break;

          case "manual-reveal":
            // Admin-triggered manual reveal
            await gameManager.manualReveal(code);
            break;

          case "pause":
            await gameManager.pauseGame(code);
            break;

          case "resume":
            await gameManager.resumeGame(code);
            break;

          case "end":
            // Always try to end the game (handles database updates and active games)
            await gameManager.endGame(code);

            // Additionally broadcast to any waiting clients (for WAITING sessions)
            const waitingGame = gameManager.getGame(code);
            if (waitingGame) {
              gameManager.broadcast(waitingGame, { type: "game-ended" });
            }
            break;

          case "bingo-claimed":
            // Broadcast bingo claim to all players
            const game = gameManager.getGame(code);
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
      const { code } = ws.data;
      console.log(`WebSocket closed for session: ${code}, code: ${ws.readyState}`);
      gameManager.removeClient(code, ws);
      console.log(`Client disconnected from session ${code}`);
    },

    error(ws: ServerWebSocket<WebSocketData>, error: Error) {
      const { code } = ws.data;
      console.error(`WebSocket error for session ${code}:`, error);
    },
  };
}