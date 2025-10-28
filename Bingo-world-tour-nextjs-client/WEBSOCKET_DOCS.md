### Client Documentation for BINGO World Tour WebSocket Server

#### Overview

The WebSocket server provides real-time updates for BINGO game sessions. Clients connect via WebSocket to receive live location reveals, game state changes, and winner announcements. The server
runs on port 3001 by default.

#### Connecting to the Server

• WebSocket URL: ws:localhost:3001/ws?sessionCode={SESSION_CODE}&userId={USER_ID} (development) or ws:your-domain.com:3001/ws?sessionCode={SESSION_CODE}&userId={USER_ID} (production)
• Parameters:
 • sessionCode: Required 6-character alphanumeric code for the game session.
 • userId: Optional user identifier for personalized features.
• Example: ws:localhost:3001/ws?sessionCode=ABC123&userId=user123

#### Message Types

##### Incoming Messages (from Server)

All messages are JSON objects with a type field.

• connected: Sent on successful connection.
{
  "type": "connected",
  "data": {
    "sessionId": "session-uuid",
    "sessionCode": "ABC123",
    "status": "ACTIVE",
    "revealedLocations": [{ "id": "loc1", "name": "Location 1", ... }]
  }
}

• location-revealed: A new location is revealed.
{
  "type": "location-revealed",
  "data": { "id": "loc1", "name": "Location 1", "latitude": 0, "longitude": 0, ... }
}

• game-paused: Game is paused.
{ "type": "game-paused" }

• game-resumed: Game is resumed.
{ "type": "game-resumed" }

• game-ended: Game has ended.
{ "type": "game-ended" }

• winner-found: A player claimed BINGO.
{
  "type": "winner-found",
  "data": { "userId": "user123", "place": 1 }
}

• error: An error occurred.
{
  "type": "error",
  "message": "Invalid session code"
}


##### Outgoing Messages (to Server)

Send JSON messages to control the game (admin features).

• ping: Keep connection alive.
{ "type": "ping" }
Response: { "type": "pong" }
• manual-reveal: Trigger immediate location reveal (admin only).
{ "type": "manual-reveal" }

• pause: Pause the game.
{ "type": "pause" }

• resume: Resume the game.
{ "type": "resume" }

• end: End the game.
{ "type": "end" }

• bingo-claimed: Announce a winner.
{
  "type": "bingo-claimed",
  "userId": "user123",
  "place": 1
}


#### Usage Example (JavaScript)

const ws = new WebSocket('ws:localhost:3001/ws?sessionCode=ABC123&userId=user123');

ws.onopen = () => console.log('Connected');
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'location-revealed') {
     Update UI with new location
  }
};
ws.onclose = () => console.log('Disconnected');

 Send a ping
ws.send(JSON.stringify({ type: 'ping' }));

#### Error Handling

• Invalid session codes result in immediate disconnection with an error message.
• Network issues may cause disconnections; clients should reconnect automatically.
• Rate limiting or connection limits may apply in production.

#### Health Check

• GET /health returns OK for server status.

#### Development vs. Production Differences

• Development:
 • Run with bun run dev (auto-restarts on changes).
 • NODE_ENV=development (enables Prisma debug logging and global client reuse).
 • Localhost only, no security restrictions.
 • Full error stack traces in console.
• Production:
 • Run with bun run start (optimized, no watch mode).
 • NODE_ENV=production (disables debug logging, optimizes Prisma).
 • Requires proper domain/SSL, CORS validation if added.
 • Errors are logged but not exposed to clients.
 • Use PM2 or systemd for process management and auto-restart on crashes.


For production deployment, ensure the database is accessible and environment variables are set securely. Monitor logs for performance and errors.
Plan grok-code (11:14 AM)


Read prisma/schema.prisma

 This is a copy of the schema from the Next.js app
 Generator and datasource
generator client {
  provider = "prisma-client-js"
}


The Prisma schema defines the following tables (models) used by the WebSocket server:

• User: Stores user information (id, clerkId, email, name, etc.) with relations to game sessions, bingo boards, and winners.
• GameSession: Manages game sessions (id, sessionCode, status, timing, host) with relations to revealed locations, bingo boards, and winners.
• Location: Represents bingo locations (id, name, description, coordinates) with relations to revealed locations.
• RevealedLocation: Tracks which locations have been revealed in a session (sessionId, locationId, revealedAt) with unique constraint per session-location pair.
• BingoBoard: Stores user bingo boards (id, sessionId, userId, board JSON) with unique constraint per session-user pair.
• Winner: Records game winners (id, sessionId, userId, place, claimedAt) with unique constraint per session-place.

These tables handle user management, game state, locations, reveals, boards, and winners for the BINGO World Tour application. The server primarily interacts with GameSession, Location, and
RevealedLocation for real-time operations.
Plan grok-code (11:17 AM)

how would an admin speed up or reveal the tiles manually?
ramses (11:17 AM)

To manually reveal tiles or speed up the process as an admin, connect to the WebSocket server and send specific control messages. Note: These actions require admin privileges (not enforced in the
current code, but assumed via session access).

### Manual Reveal (Immediate Tile Reveal)

Send a WebSocket message to trigger an instant reveal, bypassing the timer:

{ "type": "manual-reveal" }

• This calls gameManager.manualReveal(sessionCode), which selects and reveals the next unrevealed location immediately.
• Useful for testing or urgent reveals.

### Speeding Up Reveals

The server doesn't have a direct "speed up" command, but you can simulate it by:

1. Pausing and Resuming Quickly: Send {"type": "pause"} to stop the timer, then {"type": "resume"} to restart with the same interval. This effectively resets the countdown.
2. Frequent Manual Reveals: Repeatedly send {"type": "manual-reveal"} to reveal tiles faster than the set interval.
3. Adjust Interval (Not Implemented): The reveal interval is set per session in the database (revealIntervalMinutes). To change it permanently, update the GameSession record via the Next.js API
(not directly via WebSocket).

### Example Admin Client Code

const ws = new WebSocket('ws:localhost:3001/ws?sessionCode=ABC123');

 Manual reveal
ws.send(JSON.stringify({ "type": "manual-reveal" }));

 Pause game
ws.send(JSON.stringify({ "type": "pause" }));

 Resume game (after pause)
ws.send(JSON.stringify({ "type": "resume" }));

### Limitations

• No built-in rate limiting or permission checks for admin actions.
• Speeding up via pause/resume may not be precise due to timer drift.
• For persistent changes (e.g., shorter intervals), modify the session via the main app's API.
Plan grok-code (11:17 AM)