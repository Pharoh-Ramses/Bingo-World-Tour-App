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
  countdownEndsAt?: string
  nextLocationRevealedAt?: string
  connectedPlayers: number
  readyPlayers: number
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
  | { type: 'game-starting', data: { countdownSeconds: number } }
  | { type: 'game-starting-tick', data: { remainingSeconds: number } }
  | { type: 'game-started', location?: LocationRevealedPayload }
  | { type: 'location-revealed', data: LocationRevealedPayload }
  | { type: 'game-paused' }
  | { type: 'game-resumed' }
  | { type: 'game-ended' }
  | { type: 'winner-found', data: Winner }
  | { type: 'player-joined', data: PlayerInfo }
  | { type: 'player-ready', data: PlayerInfo }
  | { type: 'player-left', data: { userId: string } }
  | { type: 'player-reconnected', data: PlayerInfo }
  | { type: 'session-updated', data: Partial<GameSession> }
  | { type: 'analytics-data', data: any }
  | { type: 'connection-lost', message: string }
  | { type: 'sync-request', data: { lastKnownMessageId?: string } }
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
  | { type: 'request-sync', data: { lastKnownMessageId?: string } }
  | { type: 'mark-ready', isReady: boolean }
  | { type: 'heartbeat' }

// WebSocket connection states
export type WSConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error'

// WebSocket hook return type
export interface UseWebSocketReturn {
  connectionState: WSConnectionState
  send: (message: WSOutgoingMessage) => void
  lastMessage: WSIncomingMessage | null
  error: string | null
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected'
}
