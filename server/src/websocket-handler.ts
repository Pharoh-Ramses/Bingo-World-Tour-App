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
          try {
            if (ws.readyState === 1) {
              ws.send(
                JSON.stringify({ type: "error", message: "Invalid session code" }),
              );
            }
          } catch (error) {
            console.error(`Error sending error message:`, error);
          }
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
            revealedLocations: session.revealedLocations.map((r) => ({
              id: r.id,
              locationId: r.locationId,
              locationName: r.location.name,
              revealIndex: r.revealIndex,
              revealedAt: r.revealedAt.toISOString()
            })),
          },
        };

        console.log(`Sending initial message:`, JSON.stringify(initialMessage, null, 2));
        try {
          if (ws.readyState === 1) { // WebSocket.OPEN
            ws.send(JSON.stringify(initialMessage));
          } else {
            console.warn(`WebSocket not open, readyState: ${ws.readyState}`);
          }
        } catch (error) {
          console.error(`Error sending initial message:`, error);
          ws.close();
          return;
        }

        // Broadcast player-joined to all OTHER clients
        if (userId) {
          try {
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

            const playerInfo = {
              userId: userId,
              userName: playerBoard?.user.name || undefined,
              isReady: playerBoard?.isReady || false,
              joinedAt: playerBoard?.joinedAt.toISOString() || new Date().toISOString(),
            };

            // Broadcast to all clients EXCEPT the one that just joined
            gameManager.broadcastExcept(
              code,
              ws,
              {
                type: "player-joined",
                data: playerInfo,
              }
            );
            console.log(`Broadcasted player-joined for userId: ${userId}`);
          } catch (error) {
            console.error("Error fetching player info for broadcast:", error);
          }
        }

        // Start game if not already active
        if (session.status === "ACTIVE" && !gameManager.getGame(code)) {
          console.log(`Starting game for session: ${code}`);
          await gameManager.startGame(code);
        }

        console.log(`Client successfully connected to session ${code}`);
      } catch (error) {
        console.error("Error in WebSocket open:", error);
        try {
          if (ws.readyState === 1) {
            ws.send(JSON.stringify({ type: "error", message: "Connection failed" }));
          }
        } catch (sendError) {
          console.error("Error sending error message:", sendError);
        }
        try {
          ws.close();
        } catch (closeError) {
          console.error("Error closing WebSocket:", closeError);
        }
      }
    },

    async message(ws: ServerWebSocket<WebSocketData>, message: string) {
      const { code } = ws.data;

      try {
        const data = JSON.parse(message);

        switch (data.type) {
          case "ping":
            try {
              if (ws.readyState === 1) {
                ws.send(JSON.stringify({ type: "pong" }));
              }
            } catch (error) {
              console.error("Error sending pong:", error);
            }
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
        try {
          if (ws.readyState === 1) {
            ws.send(
              JSON.stringify({ type: "error", message: "Invalid message format" }),
            );
          }
        } catch (sendError) {
          console.error("Error sending error message:", sendError);
        }
      }
    },

    close(ws: ServerWebSocket<WebSocketData>) {
      const { code, userId } = ws.data;
      console.log(`WebSocket closed for session: ${code}, userId: ${userId}`);

      // Remove client from game manager
      gameManager.removeClient(code, ws);
      console.log(`Client disconnected from session ${code}`);

      // Broadcast player-left to all remaining clients
      if (userId) {
        try {
          gameManager.broadcast(code, {
            type: "player-left",
            data: { userId },
          });
          console.log(`Broadcasted player-left for userId: ${userId}`);
        } catch (error) {
          console.error("Error broadcasting player-left:", error);
        }
      }
    },

    error(ws: ServerWebSocket<WebSocketData>, error: Error) {
      const { code } = ws.data;
      console.error(`WebSocket error for session ${code}:`, error);
    },
  };
}