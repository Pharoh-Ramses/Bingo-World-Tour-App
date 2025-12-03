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
  | { type: 'audience-display-updated', data: AudienceDisplayConfig }
  | { type: 'event-pace-updated', data: { pace: 'normal' | 'fast' | 'slow' | 'dramatic'; newInterval?: number } }
  | { type: 'export-ready', data: { downloadUrl: string } }
  | { type: 'export-error', data: { error: string } }
  | { type: 'game-paused' }
  | { type: 'game-resumed' }
  | { type: 'game-ended' }
  | { type: 'winner-found', data: Winner }
  | { type: 'player-joined', data: PlayerInfo }
  | { type: 'player-ready', data: PlayerInfo }
  | { type: 'player-left', data: { userId: string } }
  | { type: 'player-reconnected', data: PlayerInfo }
  | { type: 'session-updated', data: Partial<GameSession> }
  | { type: 'analytics-data', data: EventAnalytics }
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
  | { type: 'analytics-request' }
  | { type: 'audience-display-config', config: AudienceDisplayConfig }
  | { type: 'event-pace-control', pace: 'normal' | 'fast' | 'slow' | 'dramatic', newInterval?: number }
  | { type: 'presentation-mode-toggle', enabled: boolean }
  | { type: 'host-announcement', message: string, priority: 'low' | 'medium' | 'high' }
  | { type: 'confetti-trigger', options: { intensity: string; duration: number; colors: string[] } }
  | { type: 'export-data-request', exportOptions: { format: string; dataTypes: string[] } }

// WebSocket connection states
export type WSConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface EventAnalytics {
  totalPlayers: number;
  activePlayers: number;
  tilesMarkedPerMinute: number;
  averageTimeToMark: number;
  peakActivityTime: Date;
  engagementScore: number;
  startTime: Date;
  lastActivityTime: Date;
  currentRevealIndex: number;
  totalReveals: number;
  winnersCount: number;
  averageBoardCompletion: number;
}

export interface AudienceDisplayConfig {
  showCurrentLocation: boolean;
  showRevealCount: boolean;
  showPlayerCount: boolean;
  showTimer: boolean;
  customBranding?: {
    logo: string;
    eventName: string;
    sponsorLogo?: string;
  };
}

export interface EventPacingConfig {
  dramaticReveal: boolean;
  countdownDuration: number;
  currentPace: 'normal' | 'fast' | 'slow' | 'dramatic';
  customInterval?: number;
}

// WebSocket hook return type
export interface UseWebSocketReturn {
  connectionState: WSConnectionState
  send: (message: WSOutgoingMessage) => void
  lastMessage: WSIncomingMessage | null
  error: string | null
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected'
}
