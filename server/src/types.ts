export interface WSMessage {
  type:
    | "location-revealed"
    | "game-started"
    | "game-paused"
    | "game-resumed"
    | "game-ended"
    | "winner-found"
    | "connected"
    | "player-joined"
    | "player-left"
    | "error";
  data?: any;
  message?: string;
}

export interface ClientMessage {
  type: "ping" | "manual-reveal" | "pause" | "resume" | "end" | "bingo-claimed";
  userId?: string;
  place?: number;
}