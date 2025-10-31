// WebSocket message types for BINGO World Tour

export interface Location {
  id: string
  name: string
  description?: string | null
  imageUrl?: string | null
  category?: string | null
  latitude?: number
  longitude?: number
}

export interface RevealedLocation {
  id: string
  locationId: string
  locationName: string
  revealIndex: number
  revealedAt: string
}

// Payload for live reveal messages from the server
export interface LocationRevealedPayload extends Location {
  revealIndex: number
  revealedAt: string
}

export interface GameSession {
  id: string
  sessionCode: string
  status: 'WAITING' | 'STARTING' | 'ACTIVE' | 'PAUSED' | 'ENDED'
  revealedLocations: RevealedLocation[]
}

export interface Winner {
  userId: string
  place: number
}

export interface PlayerInfo {
  userId: string
  userName?: string
  isReady?: boolean
  joinedAt: string
}

// Incoming messages from WebSocket server
export type WSIncomingMessage =
  | { type: 'connected', data: GameSession }
  | { type: 'game-started' }
  | { type: 'location-revealed', data: LocationRevealedPayload }
  | { type: 'game-paused' }
  | { type: 'game-resumed' }
  | { type: 'game-ended' }
  | { type: 'winner-found', data: Winner }
  | { type: 'player-joined', data: PlayerInfo }
  | { type: 'player-left', data: { userId: string } }
  | { type: 'error', message: string }
  | { type: 'pong' }

// Outgoing messages to WebSocket server
export type WSOutgoingMessage =
  | { type: 'ping' }
  | { type: 'manual-reveal' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'end' }
  | { type: 'bingo-claimed', userId: string, place: number }

// WebSocket connection states
export type WSConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error'

// WebSocket hook return type
export interface UseWebSocketReturn {
  connectionState: WSConnectionState
  send: (message: WSOutgoingMessage) => void
  lastMessage: WSIncomingMessage | null
  error: string | null
}
