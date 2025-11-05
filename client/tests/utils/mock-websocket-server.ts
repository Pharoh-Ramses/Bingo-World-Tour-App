import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { WSIncomingMessage, WSOutgoingMessage } from '../../lib/websocket-types';

interface MockGameSession {
  id: string;
  code: string;
  status: 'WAITING' | 'STARTING' | 'ACTIVE' | 'PAUSED' | 'ENDED';
  revealedLocations: any[];
}

export class MockWebSocketServer {
  private wss: WebSocketServer;
  private clients = new Map<string, WebSocket>();
  private sessions = new Map<string, MockGameSession>();
  private messageHandlers = new Map<string, (message: WSOutgoingMessage) => void>();

  constructor(port: number = 6001) {
    this.wss = new WebSocketServer({ port });

    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      const url = new URL(request.url!, 'http://localhost');
      const sessionCode = url.searchParams.get('sessionCode');
      const userId = url.searchParams.get('userId');

      if (sessionCode) {
        console.log(`Mock WebSocket: Client connected for session ${sessionCode}, userId: ${userId}`);
        this.clients.set(sessionCode, ws);
        this.handleConnection(ws, sessionCode, userId);
      }
    });

    console.log(`Mock WebSocket server started on port ${port}`);
  }

  private handleConnection(ws: WebSocket, sessionCode: string, userId?: string | null) {
    // Get or create session
    let session = this.sessions.get(sessionCode);
    if (!session) {
      session = {
        id: `mock-session-${sessionCode}`,
        code: sessionCode,
        status: 'ACTIVE',
        revealedLocations: []
      };
      this.sessions.set(sessionCode, session);
    }

    // Send initial connected message
    const connectedMessage: WSIncomingMessage = {
      type: 'connected',
      data: {
        id: session.id,
        sessionCode: session.code,
        status: session.status,
        revealedLocations: session.revealedLocations
      }
    };

    ws.send(JSON.stringify(connectedMessage));

    // Handle incoming messages
    ws.on('message', (data: Buffer) => {
      try {
        const message: WSOutgoingMessage = JSON.parse(data.toString());
        console.log(`Mock WebSocket: Received message:`, message);

        const handler = this.messageHandlers.get(sessionCode);
        if (handler) {
          handler(message);
        }
      } catch (error) {
        console.error('Mock WebSocket: Error parsing message:', error);
      }
    });

    ws.on('close', () => {
      console.log(`Mock WebSocket: Client disconnected from session ${sessionCode}`);
      this.clients.delete(sessionCode);
    });
  }

  // Public methods to simulate server messages
  simulateLocationReveal(sessionCode: string, locationData: any) {
    const client = this.clients.get(sessionCode);
    if (client && client.readyState === WebSocket.OPEN) {
      const message: WSIncomingMessage = {
        type: 'location-revealed',
        data: locationData
      };
      client.send(JSON.stringify(message));
      console.log(`Mock WebSocket: Simulated location reveal for ${sessionCode}`);
    }
  }

  simulateGamePause(sessionCode: string) {
    const client = this.clients.get(sessionCode);
    if (client && client.readyState === WebSocket.OPEN) {
      const message: WSIncomingMessage = {
        type: 'game-paused'
      };
      client.send(JSON.stringify(message));
      console.log(`Mock WebSocket: Simulated game pause for ${sessionCode}`);
    }
  }

  simulateGameResume(sessionCode: string) {
    const client = this.clients.get(sessionCode);
    if (client && client.readyState === WebSocket.OPEN) {
      const message: WSIncomingMessage = {
        type: 'game-resumed'
      };
      client.send(JSON.stringify(message));
      console.log(`Mock WebSocket: Simulated game resume for ${sessionCode}`);
    }
  }

  simulateGameEnd(sessionCode: string) {
    const client = this.clients.get(sessionCode);
    if (client && client.readyState === WebSocket.OPEN) {
      const message: WSIncomingMessage = {
        type: 'game-ended'
      };
      client.send(JSON.stringify(message));
      console.log(`Mock WebSocket: Simulated game end for ${sessionCode}`);
    }
  }

  simulateWinnerFound(sessionCode: string, winnerData: { userId: string; place: number }) {
    const client = this.clients.get(sessionCode);
    if (client && client.readyState === WebSocket.OPEN) {
      const message: WSIncomingMessage = {
        type: 'winner-found',
        data: winnerData
      };
      client.send(JSON.stringify(message));
      console.log(`Mock WebSocket: Simulated winner found for ${sessionCode}`);
    }
  }

  simulateError(sessionCode: string, errorMessage: string) {
    const client = this.clients.get(sessionCode);
    if (client && client.readyState === WebSocket.OPEN) {
      const message: WSIncomingMessage = {
        type: 'error',
        message: errorMessage
      };
      client.send(JSON.stringify(message));
      console.log(`Mock WebSocket: Simulated error for ${sessionCode}: ${errorMessage}`);
    }
  }

  // Register message handler for a session
  onMessage(sessionCode: string, handler: (message: WSOutgoingMessage) => void) {
    this.messageHandlers.set(sessionCode, handler);
  }

  // Get message handler for a session
  getMessageHandler(sessionCode: string): ((message: WSOutgoingMessage) => void) | undefined {
    return this.messageHandlers.get(sessionCode);
  }

  // Update session data
  updateSession(sessionCode: string, updates: Partial<MockGameSession>) {
    const session = this.sessions.get(sessionCode);
    if (session) {
      Object.assign(session, updates);
    }
  }

  // Get session data
  getSession(sessionCode: string): MockGameSession | undefined {
    return this.sessions.get(sessionCode);
  }

  // Close the server
  close() {
    this.wss.close();
    console.log('Mock WebSocket server closed');
  }

  // Get server port
  get port(): number {
    return (this.wss.address() as any)?.port || 3002;
  }
}