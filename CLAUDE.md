# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bingo World Tour is a real-time multiplayer bingo game application where players compete to complete bingo patterns as travel locations around the world are revealed. The application consists of two main parts:

1. **Next.js Client** (`Bingo-world-tour-nextjs-client/`) - Full-stack web application with UI, API routes, and database integration
2. **WebSocket Server** (`Bingo-world-tour-websocket-server/`) - Standalone real-time game server for location reveals and game state management

## Quick Start Commands

### Next.js Client (Main Application)
```bash
cd Bingo-world-tour-nextjs-client

# Install dependencies
npm install  # or bun install

# Development server with Turbopack (fast refresh)
npm run dev

# Production build
npm run build
npm run start

# Linting
npm run lint

# Database operations
npm run db:push    # Push Prisma schema to database
npm run db:seed    # Seed database with initial data
npm run db:studio  # Open Prisma Studio GUI
```

### WebSocket Server
```bash
cd Bingo-world-tour-websocket-server

# Install dependencies
bun install

# Development (auto-restarts on changes)
bun run dev

# Production
bun run start

# Database operations (uses same schema as client)
bun run db:generate
bun run db:push

# Testing
bun test
```

## Architecture Overview

### Client Architecture (Next.js App)

**App Directory Structure:**
- `app/(root)/` - Public pages (home, about, contact)
- `app/join/` - Join game session with code
- `app/game/[sessionCode]/` - Game session pages:
  - `lobby/` - Pre-game waiting room
  - `setup/` - Board generation and player readiness
  - `play/` - Active game with bingo board
  - `results/` - Post-game winners display
- `app/admin/` - Admin dashboard for managing sessions and locations
- `app/api/` - Next.js API routes (REST endpoints)

**Key Client Components:**
- `components/BingoBoard.tsx` - Interactive 5x5 bingo board with tile selection
- `components/AdminSidebar.tsx` - Navigation for admin features
- `lib/useWebSocket.ts` - WebSocket hook with auto-reconnect and state management
- `lib/game-logic.ts` - Core bingo logic (pattern detection, win validation)
- `lib/websocket-types.ts` - TypeScript definitions for WebSocket messages

**API Route Organization:**
- `/api/game/[sessionCode]/*` - Player game operations (join, board, bingo claim, status)
- `/api/admin/*` - Admin operations (create/update sessions and locations)
- `/api/webhooks/clerk` - Clerk authentication webhook handler
- `/api/auth/check-admin` - Admin authorization check

### WebSocket Server Architecture

**Core Modules:**
- `src/index.ts` - Bun HTTP server with WebSocket upgrade handling
- `src/game-manager.ts` - Game lifecycle management (start, pause, resume, end)
- `src/websocket-handler.ts` - WebSocket connection and message routing
- `src/types.ts` - Shared type definitions

**Game Manager Responsibilities:**
- Maintains active game sessions in memory
- Schedules automatic location reveals based on `revealInterval`
- Manages client connections per session
- Broadcasts real-time updates to all connected clients
- Handles manual admin actions (manual reveal, pause, resume, end)

**WebSocket Message Types:**

*Incoming (Client to Server):*
- `ping` - Keep-alive
- `manual-reveal` - Trigger immediate location reveal (admin)
- `pause`, `resume`, `end` - Game control (admin)
- `bingo-claimed` - Winner announcement

*Outgoing (Server to Client):*
- `connected` - Connection established with session state
- `location-revealed` - New location revealed with full details
- `game-paused`, `game-resumed`, `game-ended` - Game state changes
- `winner-found` - Player claimed bingo
- `pong` - Ping response
- `error` - Error message

### Database Schema (Prisma)

**Core Models:**
- `User` - Clerk-managed users with admin flag
- `GameSession` - Game instances with code, status, reveal interval
- `Location` - Travel destinations (name, description, image, category)
- `PlayerBoard` - User's board layout (5x5 grid stored as JSON)
- `PlayerBoardLocation` - Individual tiles on boards (position, selection state)
- `RevealedLocation` - Locations revealed during session (with reveal order)
- `Winner` - Game winners with place and win pattern

**Important Relationships:**
- A `GameSession` has many `PlayerBoard` entries (one per player)
- Each `PlayerBoard` has 25 `PlayerBoardLocation` entries (5x5 grid, center is free)
- `RevealedLocation` tracks which locations were revealed in which order per session
- Winners reference the specific board used to win

**Game Status Flow:**
```
WAITING → STARTING → ACTIVE → PAUSED (optional) → ENDED
                       ↑          ↓
                       └──────────┘
```

## Development Patterns

### Authentication & Authorization
- Uses Clerk for authentication (`@clerk/nextjs`)
- Middleware (`middleware.ts`) protects routes automatically
- Admin status stored in `User.isAdmin` field in database
- Admin routes check authorization via `/api/auth/check-admin`
- Webhook at `/api/webhooks/clerk` syncs Clerk users to database

### Real-Time Communication Pattern
1. Client connects to WebSocket server using session code and optional user ID
2. Server validates session exists and adds client to game's client set
3. Server sends `connected` message with current game state
4. Server broadcasts `location-revealed` messages on timer or manual trigger
5. Client updates UI reactively using the `useWebSocket` hook
6. Client can send admin commands if authorized

### Bingo Game Logic
- Board is 5x5 grid (25 tiles), center tile is always FREE
- Locations are randomly assigned to each player's board during setup
- Players mark tiles when revealed locations match their board
- Win patterns: 5 rows + 5 columns + 2 diagonals = 12 possible winning patterns
- Win detection in `lib/game-logic.ts` using `hasBingo()` and `findWinningPatterns()`
- First 3 players to claim valid bingo become winners (1st, 2nd, 3rd place)

### Component and Styling System
- Tailwind CSS v4 with custom design system
- Two primary fonts: Cormorant Garamond (headings), DM Sans (body)
- Custom utility classes for typography (`heading-1` through `heading-6`, `body-1` through `body-4`)
- Semantic color palette (primary, secondary, accent, neutral, success, warning, error)
- Shadow system (`shadow-e0` through `shadow-e9`) for elevation and effects
- Component library in `components/ui/` using Radix UI primitives with CVA for variants

### Database Development
- Both client and server use the same Prisma schema
- Schema is maintained in `Bingo-world-tour-nextjs-client/prisma/schema.prisma`
- WebSocket server copies the schema for its own Prisma client
- Always run `db:push` on client first, then `db:generate` on server if schema changes
- Use `db:studio` to visually inspect and modify database during development

### Testing
- WebSocket server uses Vitest for unit tests
- Test files in `Bingo-world-tour-websocket-server/src/__tests__/`
- Run tests with `bun test`

## Environment Variables

**Next.js Client (.env):**
```
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
CLERK_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_WEBSOCKET_URL="ws://localhost:3001/ws"  # or production URL
```

**WebSocket Server (.env):**
```
DATABASE_URL="postgresql://..."  # Same database as client
PORT="3001"  # Default 3000, usually changed to avoid conflict
NODE_ENV="development"  # or "production"
```

## Common Development Workflows

### Creating a New Game Session (Admin)
1. Admin navigates to `/admin/sessions/create`
2. Selects reveal interval (minutes between automatic reveals)
3. System generates unique 6-character code
4. Session created in WAITING state
5. Share code with players to join

### Player Joining a Game
1. Navigate to `/join` and enter session code
2. System validates code and redirects to `/game/[sessionCode]/lobby`
3. Wait for admin to start game (status changes to STARTING then ACTIVE)
4. Generate bingo board at `/game/[sessionCode]/setup`
5. Mark as ready and proceed to `/game/[sessionCode]/play`

### Adding New Locations
1. Admin navigates to `/admin/locations/create`
2. Enter name, description, category, and optional image URL
3. Location becomes available for future game sessions
4. Existing games are not affected

### Manual Game Control (Admin)
1. Connect to WebSocket with session code
2. Send JSON messages: `{"type": "manual-reveal"}`, `{"type": "pause"}`, etc.
3. Or use admin API routes: `/api/admin/sessions/[sessionId]/reveal`, `/pause`, `/resume`, `/end`

## Important Implementation Notes

### WebSocket Connection Management
- Client auto-reconnects with exponential backoff (max 5 attempts by default)
- Connection state tracked: `disconnected`, `connecting`, `connected`, `error`
- Server maintains client sets per session in memory (not persisted)
- Server cleans up client references on disconnect
- Use `send()` method from `useWebSocket` hook to send messages safely

### Game Timing and Reveals
- Reveal timer managed by `GameManager` using `setTimeout` recursion
- Timer persists in server memory (lost on server restart)
- `revealInterval` stored in minutes in database, converted to milliseconds for timer
- Manual reveals skip timer but still increment reveal index
- Pausing clears timer; resuming restarts it from full interval

### Board Generation
- Each player gets a unique randomized board layout
- 25 locations chosen randomly from all available locations
- Center position (index 12) is always FREE and pre-selected
- Board stored as JSON in `PlayerBoard.boardLayout`
- Individual tiles tracked in `PlayerBoardLocation` for granular state

### Clerk Integration
- User creation/update happens via webhook, not directly in API routes
- Always check `currentUser()` from `@clerk/nextjs/server` for auth state
- Admin status must be manually set in database (not automatic via Clerk)
- Webhook validates requests using `svix` library signature verification

## Deployment Considerations

### WebSocket Server Production
- Use process manager (PM2, systemd) for auto-restart on crashes
- Ensure `NODE_ENV=production` for optimized Prisma client
- Configure proper CORS if client is on different domain
- WebSocket URL in client must use `wss://` (secure) for production
- Dockerfile included at `Bingo-world-tour-websocket-server/Dockerfile`
- Fly.io configuration in `fly.toml`

### Next.js Client Production
- Build uses Turbopack: `npm run build`
- Ensure Clerk production keys are set
- Database must be accessible from deployment environment
- Set `NEXT_PUBLIC_WEBSOCKET_URL` to production WebSocket server URL
- Static files served from `/public` directory

## File References for Common Tasks

**Modifying bingo win logic:** `Bingo-world-tour-nextjs-client/lib/game-logic.ts`
**Changing WebSocket message handling:** `Bingo-world-tour-websocket-server/src/websocket-handler.ts`
**Updating database schema:** `Bingo-world-tour-nextjs-client/prisma/schema.prisma`
**Styling changes:** `Bingo-world-tour-nextjs-client/app/globals.css`
**Component library:** `Bingo-world-tour-nextjs-client/components/ui/`
**API endpoint creation:** `Bingo-world-tour-nextjs-client/app/api/`
**Game state management:** `Bingo-world-tour-websocket-server/src/game-manager.ts`
