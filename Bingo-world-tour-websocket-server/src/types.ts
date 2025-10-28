export interface WSMessage {
  type:
    | "location-revealed"
    | "game-paused"
    | "game-resumed"
    | "game-ended"
    | "winner-found"
    | "connected"
    | "error";
  data?: any;
  message?: string;
}

export interface ClientMessage {
  type: "ping" | "manual-reveal" | "pause" | "resume" | "end" | "bingo-claimed";
  userId?: string;
  place?: number;
}