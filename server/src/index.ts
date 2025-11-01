import { GameManager } from "./game-manager";
import { handleWebSocket } from "./websocket-handler";
import { prisma } from "./utils/prisma";

const PORT = parseInt(process.env.PORT || "3000");
const gameManager = new GameManager();

// Global error handlers to prevent crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - log and continue
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Log error but don't exit - let Fly.io handle restart if needed
  // Exiting here could cause restart loops
  // Instead, log and continue, hoping the error was recoverable
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

const server = Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req, server) {
    const url = new URL(req.url);
    
    // Add CORS headers for all responses
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    // Health check endpoint
    if (url.pathname === "/health") {
      try {
        // Check database connectivity
        await prisma.$queryRaw`SELECT 1`;
        return new Response(JSON.stringify({ status: "OK", database: "connected" }), { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      } catch (error) {
        console.error("Health check failed - database error:", error);
        return new Response(JSON.stringify({ status: "ERROR", database: "disconnected", error: error instanceof Error ? error.message : "Unknown error" }), { 
          status: 503, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
    }

    // Start game endpoint (called by Next.js API route)
    if (url.pathname === "/start-game" && req.method === "POST") {
      try {
        const body = await req.json();
        const { sessionCode } = body;

        if (!sessionCode) {
          return new Response(
            JSON.stringify({ error: "Session code required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`HTTP request to start game for session: ${sessionCode}`);

        // Start the game which will broadcast to all connected clients
        await gameManager.startGame(sessionCode);

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("Error starting game via HTTP:", error);
        return new Response(
          JSON.stringify({ error: error instanceof Error ? error.message : "Failed to start game" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Player ready endpoint (called by Next.js API route when player joins/becomes ready)
    if (url.pathname === "/player-ready" && req.method === "POST") {
      try {
        const body = await req.json();
        const { sessionCode, userId } = body;

        if (!sessionCode || !userId) {
          return new Response(
            JSON.stringify({ error: "Session code and user ID required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`HTTP request to notify player ready for session: ${sessionCode}, userId: ${userId}`);

        // Broadcast player-ready to all connected clients
        await gameManager.broadcastPlayerReady(sessionCode, userId);

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("Error broadcasting player ready via HTTP:", error);
        return new Response(
          JSON.stringify({ error: error instanceof Error ? error.message : "Failed to broadcast player ready" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // WebSocket upgrade
    if (url.pathname === "/ws") {
      const code = url.searchParams.get("sessionCode");
      const userId = url.searchParams.get("userId") || undefined;

      console.log(`WebSocket connection attempt: sessionCode=${code}, userId=${userId}`);

      if (!code) {
        console.log("WebSocket connection rejected: No session code provided");
        return new Response("Session code required", { status: 400, headers: corsHeaders });
      }

      const upgraded = server.upgrade(req, {
        data: { code, userId },
      });

      if (upgraded) {
        console.log(`WebSocket upgrade successful for session: ${code}`);
        return undefined;
      } else {
        console.log(`WebSocket upgrade failed for session: ${code}`);
        return new Response("Upgrade failed", { status: 500, headers: corsHeaders });
      }
    }

    return new Response("Not found", { status: 404, headers: corsHeaders });
  },
  websocket: handleWebSocket(gameManager),
});

// Test database connection on startup
prisma.$connect()
  .then(() => {
    console.log("Database connected successfully");
    console.log(`WebSocket server running on 0.0.0.0:${PORT}`);
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
    console.log(`WebSocket server running on 0.0.0.0:${PORT} (database connection failed)`);
  });