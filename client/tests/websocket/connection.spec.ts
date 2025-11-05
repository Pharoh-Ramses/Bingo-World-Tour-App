import { test, expect } from '@playwright/test';

test.describe('WebSocket Connection', () => {
  test('should establish WebSocket connection', async ({ page }) => {
    // Set up the WebSocket URL for testing
    await page.addInitScript(() => {
      window.localStorage.setItem('NEXT_PUBLIC_WEBSOCKET_URL', 'ws://localhost:6001/ws');
    });

    // Navigate to a simple page that uses WebSocket
    await page.goto('/join');

    // The page should load without WebSocket connection errors
    await expect(page.locator('h3').filter({ hasText: 'Join BINGO World Tour' })).toBeVisible();
  });
});