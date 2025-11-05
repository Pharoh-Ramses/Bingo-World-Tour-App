import { chromium, Browser, Page } from '@playwright/test';
import { MockWebSocketServer } from './mock-websocket-server';

// Extend the global interface to include our mock server
declare global {
  var mockWebSocketServer: MockWebSocketServer;
  namespace NodeJS {
    interface Global {
      mockWebSocketServer: MockWebSocketServer;
    }
  }
}

// Test utilities for setting up game sessions and data
export class TestHelpers {
  private browser: Browser;
  private page: Page;

  constructor(browser: Browser, page: Page) {
    this.browser = browser;
    this.page = page;
  }

  // Create a test game session
  async createTestSession(sessionCode: string = 'TEST123') {
    // In a real implementation, this would create a session in the test database
    // For now, we'll just configure the mock server
    if (global.mockWebSocketServer) {
      global.mockWebSocketServer.updateSession(sessionCode, {
        id: `test-session-${sessionCode}`,
        code: sessionCode,
        status: 'ACTIVE',
        revealedLocations: []
      });
    }
    return sessionCode;
  }

  // Navigate to game page and wait for WebSocket connection
  async joinGameSession(sessionCode: string) {
    await this.page.goto('/join');

    // Enter session code
    await this.page.fill('input[placeholder*="session code"]', sessionCode);

    // Click join button
    await this.page.click('button:has-text("Join Game")');

    // Wait for navigation to setup page
    await this.page.waitForURL(`**/game/${sessionCode}/setup`);

    // Wait for WebSocket connection
    await this.page.waitForSelector('[data-testid="websocket-connected"], [data-testid="connection-status"]', {
      timeout: 10000
    });
  }

  // Simulate location reveal via mock server
  async simulateLocationReveal(sessionCode: string, locationData: any) {
    if (global.mockWebSocketServer) {
      global.mockWebSocketServer.simulateLocationReveal(sessionCode, locationData);
    }
  }

  // Simulate game state changes
  async simulateGamePause(sessionCode: string) {
    if (global.mockWebSocketServer) {
      global.mockWebSocketServer.simulateGamePause(sessionCode);
    }
  }

  async simulateGameResume(sessionCode: string) {
    if (global.mockWebSocketServer) {
      global.mockWebSocketServer.simulateGameResume(sessionCode);
    }
  }

  async simulateGameEnd(sessionCode: string) {
    if (global.mockWebSocketServer) {
      global.mockWebSocketServer.simulateGameEnd(sessionCode);
    }
  }

  async simulateWinnerFound(sessionCode: string, winnerData: { userId: string; place: number }) {
    if (global.mockWebSocketServer) {
      global.mockWebSocketServer.simulateWinnerFound(sessionCode, winnerData);
    }
  }

  // Wait for specific UI elements
  async waitForLocationRevealed(locationName: string) {
    // Wait for the location to appear in the latest revealed section
    await this.page.waitForSelector(`text=${locationName}`);
  }

  async waitForGamePaused() {
    await this.page.waitForSelector('[data-testid="game-paused"]');
  }

  async waitForGameResumed() {
    await this.page.waitForSelector('[data-testid="game-active"]');
  }

  async waitForWinnerAnnounced(place: number) {
    await this.page.waitForSelector(`[data-testid="winner-place-${place}"]`);
  }

  // Additional helper methods
  async waitForBingoTileRevealed(position: number) {
    await this.page.waitForSelector(`[data-testid="bingo-tile-${position}"].bg-primary-100`);
  }

  async getRevealedLocationsCount(): Promise<number> {
    const revealedSection = await this.page.$('[data-testid="revealed-locations"]');
    if (revealedSection) {
      const text = await revealedSection.textContent();
      const match = text?.match(/(\d+)\//);
      return match ? parseInt(match[1]) : 0;
    }
    return 0;
  }

  // Get WebSocket connection status
  async getConnectionStatus(): Promise<string> {
    const statusElement = await this.page.$('[data-testid="connection-status"]');
    if (statusElement) {
      return await statusElement.textContent() || '';
    }
    return '';
  }
}

// Helper to create test helpers instance
export function createTestHelpers(browser: Browser, page: Page): TestHelpers {
  return new TestHelpers(browser, page);
}