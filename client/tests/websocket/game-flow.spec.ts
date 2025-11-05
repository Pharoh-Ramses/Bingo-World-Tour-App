import { test, expect } from '@playwright/test';
import { createTestHelpers } from '../utils/test-helpers';

test.describe('WebSocket Game Flow', () => {
  test('should connect to game session and receive initial state', async ({ browser, page }) => {
    const helpers = createTestHelpers(browser, page);
    const sessionCode = 'TEST123';

    // Create test session in mock server
    await helpers.createTestSession(sessionCode);

    // Navigate to join page
    await page.goto('/join');

    // Enter session code
    await page.fill('input[placeholder*="session code"]', sessionCode);

    // Click join button
    await page.click('button:has-text("Join Game")');

    // Wait for navigation to setup page
    await page.waitForURL(`**/game/${sessionCode}/setup`);

    // Wait for WebSocket connection
    await page.waitForSelector('[data-testid="connection-status"]', {
      timeout: 10000
    });

    // Verify connection status
    const connectionStatus = await helpers.getConnectionStatus();
    expect(connectionStatus).toBe('Connected');

    // Verify we're on the setup page
    await expect(page).toHaveURL(new RegExp(`/game/${sessionCode}/setup`));
  });

  test('should handle location reveals and update board', async ({ browser, page }) => {
    const helpers = createTestHelpers(browser, page);
    const sessionCode = 'TEST456';

    // Create test session in mock server
    await helpers.createTestSession(sessionCode);

    // Join the game session
    await helpers.joinGameSession(sessionCode);

    // Navigate to play page (assuming setup is complete)
    await page.goto(`/game/${sessionCode}/play`);

    // Wait for connection
    await page.waitForSelector('[data-testid="connection-status"]', {
      timeout: 10000
    });

    // Simulate location reveal
    await helpers.simulateLocationReveal(sessionCode, {
      id: 'loc1',
      name: 'Paris',
      description: 'City of Light',
      imageUrl: '/test-image.jpg',
      category: 'Europe',
      revealIndex: 1,
      revealedAt: new Date().toISOString()
    });

    // Wait for the location to be revealed in the UI
    await page.waitForSelector('text=Paris');

    // Verify the revealed locations count increased
    const revealedCount = await helpers.getRevealedLocationsCount();
    expect(revealedCount).toBeGreaterThan(0);
  });

  test('should handle game state changes', async ({ browser, page }) => {
    const helpers = createTestHelpers(browser, page);
    const sessionCode = 'TEST789';

    // Create test session in mock server
    await helpers.createTestSession(sessionCode);

    // Join the game session
    await helpers.joinGameSession(sessionCode);

    // Navigate to play page
    await page.goto(`/game/${sessionCode}/play`);

    // Wait for connection
    await page.waitForSelector('[data-testid="connection-status"]', {
      timeout: 10000
    });

    // Initially should be active
    await expect(page.locator('[data-testid="game-active"]')).toBeVisible();

    // Simulate game pause
    await helpers.simulateGamePause(sessionCode);

    // Verify game is paused
    await expect(page.locator('[data-testid="game-paused"]')).toBeVisible();

    // Simulate game resume
    await helpers.simulateGameResume(sessionCode);

    // Verify game is resumed
    await expect(page.locator('[data-testid="game-active"]')).toBeVisible();
  });

  test('should handle winner announcements', async ({ browser, page }) => {
    const helpers = createTestHelpers(browser, page);
    const sessionCode = 'TEST999';

    // Create test session in mock server
    await helpers.createTestSession(sessionCode);

    // Join the game session
    await helpers.joinGameSession(sessionCode);

    // Navigate to play page
    await page.goto(`/game/${sessionCode}/play`);

    // Wait for connection
    await page.waitForSelector('[data-testid="connection-status"]', {
      timeout: 10000
    });

    // Simulate winner found
    await helpers.simulateWinnerFound(sessionCode, {
      userId: 'user123',
      place: 1
    });

    // Verify winner announcement appears
    await expect(page.locator('[data-testid="winner-place-1"]')).toBeVisible();
    await expect(page.locator('text=🥇')).toBeVisible();
  });
});