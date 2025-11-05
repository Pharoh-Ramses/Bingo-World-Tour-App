import { chromium, FullConfig } from '@playwright/test';
import { MockWebSocketServer } from './utils/mock-websocket-server';

async function globalSetup(config: FullConfig) {
  // Set environment variables for tests
  process.env.NEXT_PUBLIC_WEBSOCKET_URL = 'ws://localhost:6001/ws';

  // Start mock WebSocket server if not already running
  if (!global.mockWebSocketServer) {
    console.log('Starting mock WebSocket server for tests...');
    global.mockWebSocketServer = new MockWebSocketServer(6001);
  }

  // Wait a bit for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));
}

export default globalSetup;