import { GameManager } from "./game-manager";
import { handleWebSocket } from "./websocket-handler";

const PORT = parseInt(process.env.PORT || "3000");
const gameManager = new GameManager();

const server = Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  fetch(req, server) {
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
      return new Response("OK", { status: 200, headers: corsHeaders });
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

    // WebSocket upgrade
    if (url.pathname === "/ws") {
      const code = url.searchParams.get("sessionCode");
      const userId = url.searchParams.get("userId");

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

console.log(`WebSocket server running on 0.0.0.0:${PORT}`);