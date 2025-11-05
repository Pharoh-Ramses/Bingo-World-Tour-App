#!/usr/bin/env node

import { MockWebSocketServer } from './mock-websocket-server.js';

const port = process.env.MOCK_WS_PORT ? parseInt(process.env.MOCK_WS_PORT) : 6001;

console.log(`Starting mock WebSocket server on port ${port}...`);

const server = new MockWebSocketServer(port);

// Keep the process alive
process.on('SIGINT', () => {
  console.log('Shutting down mock WebSocket server...');
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down mock WebSocket server...');
  server.close();
  process.exit(0);
});

// Export for use in tests
export { server };